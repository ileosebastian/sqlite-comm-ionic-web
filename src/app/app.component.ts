import { NgIf } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { SqliteService } from './services/sqlite.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NgIf],
})
export class AppComponent implements OnDestroy {

  isLoaded: boolean;
  suscription!: Subscription;

  constructor(
    private readonly platform: Platform,
    private readonly sqlite: SqliteService
  ) {
    this.isLoaded = false;
    this.initApp();
  }

  initApp() {
    this.platform.ready().then(async () => {
      await this.sqlite.initialize()
      this.suscription = this.sqlite.isDBReady.subscribe(isLoad => {
        this.isLoaded = isLoad;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.suscription) this.suscription.unsubscribe();
    this.sqlite.finalization();
  }

}
