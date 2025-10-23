import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';

@Injectable()
export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    // Usar fetch API para carregar os arquivos JSON
    return from(
      fetch(`/assets/i18n/${lang}.json`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .catch((error) => {
          console.error(`Erro ao carregar traduções para ${lang}:`, error);
          return {};
        })
    );
  }
}
