import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LanguageService } from '../../core/language.service';

@Pipe({
  name: 'localizedCurrency',
  standalone: true,
  pure: false
})
export class LocalizedCurrencyPipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  transform(
    value: number | string | null | undefined,
    display: 'code' | 'symbol' | 'symbol-narrow' | string | boolean = 'symbol',
    digitsInfo?: string
  ): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const locale = this.languageService.getCurrentLocale();
    const currency = this.languageService.getCurrentCurrency();
    
    const currencyPipe = new CurrencyPipe(locale);
    return currencyPipe.transform(value, currency, display, digitsInfo);
  }
}
