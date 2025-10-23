import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Diretiva para sanitizar inputs de texto e prevenir XSS
 * Uso: <input appSanitize [allowHtml]="false">
 */
@Directive({
  selector: '[appSanitize]',
  standalone: true
})
export class SanitizeDirective {
  @Input() allowHtml = false;
  @Input() allowSpecialChars = true;

  constructor(private el: ElementRef) {}

  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement;
    let value = input.value;

    if (!value) return;

    // Remove tags HTML se não permitido
    if (!this.allowHtml) {
      value = this.stripHtml(value);
    }

    // Remove caracteres especiais perigosos se não permitido
    if (!this.allowSpecialChars) {
      value = this.removeSpecialChars(value);
    }

    // Remove scripts inline
    value = this.removeScripts(value);

    input.value = value;
    
    // Dispara evento de input para atualizar o FormControl
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private stripHtml(value: string): string {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML.replace(/<[^>]*>/g, '');
  }

  private removeSpecialChars(value: string): string {
    // Permite apenas letras, números, espaços e pontuação básica
    return value.replace(/[^a-zA-Z0-9\s\.,\-_@]/g, '');
  }

  private removeScripts(value: string): string {
    // Remove qualquer tentativa de script
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}
