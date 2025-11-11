import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { routes } from './app.routes';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { I18nService } from './services/i18n.service';

registerLocaleData(es);

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient): CustomTranslateLoader {
  return new CustomTranslateLoader(http);
}

export function initializeI18n(i18nService: I18nService): () => Promise<void> {
  return () => {
    return new Promise<void>((resolve) => {
      // Forzar la inicialización del servicio
      const currentLang = i18nService.getCurrentLang();
      
      // Esperar un tick para que las traducciones se establezcan
      setTimeout(() => {
        // Verificar múltiples veces que las traducciones estén listas
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkTranslations = () => {
          const testTranslation = i18nService.instant('footer.copy');
          attempts++;
          
          if (testTranslation && testTranslation !== 'footer.copy') {
            resolve();
          } else if (attempts < maxAttempts) {
            setTimeout(checkTranslations, 20);
          } else {
            // Forzar resolución después de intentos máximos
            resolve();
          }
        };
        
        checkTranslations();
      }, 50);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideNzI18n(es_ES), 
    importProvidersFrom(FormsModule), 
    provideAnimationsAsync(), 
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot()
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeI18n,
      deps: [I18nService],
      multi: true
    }
  ]
};
