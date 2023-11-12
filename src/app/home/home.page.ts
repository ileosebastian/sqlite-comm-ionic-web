import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonIcon, IonItemSliding, IonList, IonLabel, IonItemOption, IonItemOptions } from '@ionic/angular/standalone';
import { SqliteService } from '../services/sqlite.service';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, trash, pencil } from 'ionicons/icons';
import { NgFor, TitleCasePipe } from '@angular/common';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonList,
    IonItemSliding,
    IonLabel,
    IonItemOptions,
    IonItemOption,

    FormsModule,
    NgFor,
    TitleCasePipe
  ],
})
export class HomePage implements OnInit {

  language: string = '';
  languages: string[] = [];

  constructor(
    private readonly sqlite: SqliteService
  ) {
    addIcons({ add, trash, pencil });
  }

  async ngOnInit() {
    await this.read();
  }

  async create() {
    await this.sqlite.createLang(this.language.toLowerCase());
    await this.read();
  }

  async read() {
    try {
      this.languages = await this.sqlite.readLangs();
      this.language = '';
    } catch (error) {
      console.error(error);
    }
  }

  async update(lang: string) {
    if (this.language.length > 0) {
      await this.sqlite.updateLang(this.language.toLowerCase(), lang);
      await this.read();
    }
  }

  async delete(lang: string) {
    await this.sqlite.deleteLang(lang);
    await this.read();
  }

}
