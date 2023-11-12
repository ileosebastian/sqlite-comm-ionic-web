import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { CapacitorSQLite, JsonSQLite, capSQLiteChanges, capSQLiteValues } from '@capacitor-community/sqlite';
import { Preferences } from '@capacitor/preferences';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  isDBReady: BehaviorSubject<boolean>;
  isWebPlatform: boolean;
  dbName: string = '';

  constructor(
    private readonly http: HttpClient
  ) {
    this.isDBReady = new BehaviorSubject(false);
    this.isWebPlatform = false;
  }

  async initialize() {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      this.isWebPlatform = true;
      await CapacitorSQLite.initWebStore();
    }

    try {
      await this.setupLanguageDatabase();
      this.isDBReady.next(true);
    } catch (error) {
      console.error(error)
    }
  }

  async setupLanguageDatabase() {
    const isSetup = await Preferences.get({ key: 'isSetup' });

    if (!isSetup.value) {
      await this.downloadDatabase();
    } else {
      await this.getDBName();
    }

    await CapacitorSQLite.createConnection({ database: this.dbName });
    await CapacitorSQLite.open({ database: this.dbName });
  }

  async finalization() {
    await this.getDBName();
    await CapacitorSQLite.close({ database: this.dbName });
  }

  async downloadDatabase() {

    const obs = this.http.get<JsonSQLite>('assets/databases/languages.json');

    const json = await firstValueFrom(obs);
    const jsonstring = JSON.stringify(json);

    const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

    if (isValid.result) {
      this.dbName = json.database;

      await CapacitorSQLite.importFromJson({ jsonstring });

      await Preferences.set({ key: 'isSetup', value: '1' });
      await Preferences.set({ key: 'dbName', value: this.dbName });
    }

  }

  async getDBName() {
    if (!this.dbName) {
      const name = await Preferences.get({ key: 'dbName' });

      if (name.value) {
        this.dbName = name.value;
      }
    }

    return this.dbName;
  }

  private async execute(database: string, statement: string, values: any[]) {

    return CapacitorSQLite.executeSet({
      database,
      set: [
        {
          statement,
          values
        }
      ]
    })
      .then(async (changes: capSQLiteChanges) => {
        if (this.isWebPlatform) {
          await CapacitorSQLite.saveToStore({ database });
        }
        return changes;
      })
      .catch((err) => { Promise.reject(err) });

  }

  async createLang(lang: string) {
    const statement = `INSERT INTO languages VALUES(?);`;
    const database = await this.getDBName();
    return this.execute(database, statement, [lang]);
  }

  async readLangs() {
    const statement = `SELECT * FROM languages;`;
    const database = await this.getDBName();
    return CapacitorSQLite.query({
      database,
      statement,
      values: []
    })
      .then(async (response: capSQLiteValues) => {
        const langs: string[] = [];

        if (response.values) {
          for (const lang of response.values) {
            langs.push(lang.name);
          }
        }
        return langs;
      })
      .catch((err) => Promise.reject(err));
  }

  async updateLang(newLang: string, oldLang: string) {
    const statement = `UPDATE languages SET name=? WHERE name=?;`;
    const database = await this.getDBName();
    return this.execute(database, statement, [newLang, oldLang]);
  }

  async deleteLang(lang: string) {
    const statement = `DELETE FROM languages WHERE name=?;`;
    const database = await this.getDBName();
    return this.execute(database, statement, [lang]);
  }


}
