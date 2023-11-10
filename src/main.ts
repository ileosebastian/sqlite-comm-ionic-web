import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import { Capacitor } from '@capacitor/core';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

const platform = Capacitor.getPlatform();

if (platform === 'web') {
  jeepSqlite(window);

  window.addEventListener(
    'DOMContentLoaded',
    () => {
      const jeepElement = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepElement);
    }
  );
}


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
  ],
});
