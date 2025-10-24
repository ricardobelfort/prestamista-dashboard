import { Injectable, signal, ApplicationRef, LOCALE_ID, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import localeEs from '@angular/common/locales/es-PY';
import localeEn from '@angular/common/locales/en';

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
  currency: string;
  locale: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // Idiomas disponíveis
  readonly availableLanguages: Language[] = [
    { 
      code: 'pt-BR', 
      name: 'Português', 
      flag: '🇧🇷', 
      nativeName: 'Português (Brasil)',
      currency: 'BRL',
      locale: 'pt-BR'
    },
    { 
      code: 'es-PY', 
      name: 'Español', 
      flag: '🇵🇾', 
      nativeName: 'Español (Paraguay)',
      currency: 'PYG',
      locale: 'es-PY'
    },
    { 
      code: 'en-US', 
      name: 'English', 
      flag: '🇺🇸', 
      nativeName: 'English (US)',
      currency: 'USD',
      locale: 'en-US'
    }
  ];

  // Signal para idioma atual
  currentLanguage = signal<Language>(this.availableLanguages[0]);

  constructor(
    private translate: TranslateService,
    private appRef: ApplicationRef
  ) {
    // Registrar locales
    registerLocaleData(localePt, 'pt-BR');
    registerLocaleData(localeEs, 'es-PY');
    registerLocaleData(localeEn, 'en-US');
    
    this.initializeLanguage();
  }

  /**
   * Inicializa o idioma da aplicação
   * Ordem de prioridade:
   * 1. localStorage
   * 2. navigator.language
   * 3. pt-BR (padrão)
   */
  private initializeLanguage(): void {
    const savedLang = localStorage.getItem('app_language');
    
    if (savedLang && this.isValidLanguage(savedLang)) {
      this.setLanguage(savedLang);
    } else {
      // Tentar detectar idioma do navegador
      const browserLang = this.detectBrowserLanguage();
      this.setLanguage(browserLang);
    }
  }

  /**
   * Detecta o idioma do navegador
   */
  private detectBrowserLanguage(): string {
    const browserLang = navigator.language;
    
    // Verifica se o idioma do navegador está disponível
    if (browserLang.startsWith('es')) {
      return 'es-PY';
    }
    
    if (browserLang.startsWith('en')) {
      return 'en-US';
    }
    
    // Padrão: pt-BR
    return 'pt-BR';
  }

  /**
   * Verifica se o código de idioma é válido
   */
  private isValidLanguage(code: string): boolean {
    return this.availableLanguages.some(lang => lang.code === code);
  }

  /**
   * Altera o idioma da aplicação
   */
  setLanguage(langCode: string): void {
    const language = this.availableLanguages.find(lang => lang.code === langCode);
    
    if (!language) {
      console.warn(`Idioma não suportado: ${langCode}. Usando pt-BR.`);
      langCode = 'pt-BR';
    }

    // Atualizar TranslateService e forçar reload
    this.translate.use(langCode).subscribe(() => {
      // Força a atualização de todas as traduções
      this.translate.reloadLang(langCode);
      
      // Força detecção de mudanças em toda a aplicação
      this.appRef.tick();
    });
    
    // Salvar preferência
    localStorage.setItem('app_language', langCode);
    
    // Atualizar signal
    this.currentLanguage.set(language || this.availableLanguages[0]);
    
    // Atualizar atributo HTML lang
    document.documentElement.lang = langCode;
  }

  /**
   * Obtém o idioma atual
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }

  /**
   * Obtém o código do idioma atual
   */
  getCurrentLanguageCode(): string {
    return this.currentLanguage().code;
  }

  /**
   * Obtém a moeda do idioma atual
   */
  getCurrentCurrency(): string {
    return this.currentLanguage().currency;
  }

  /**
   * Obtém o locale do idioma atual
   */
  getCurrentLocale(): string {
    return this.currentLanguage().locale;
  }
}
