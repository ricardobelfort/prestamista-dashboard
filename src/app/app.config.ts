import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from './core/custom-translate-loader';

// Registrar o locale pt-BR
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // Configuração i18n
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'pt-BR',
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader
        },
      })
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
