import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective {
  @Input() appMask: 'cpf' | 'phone' = 'cpf';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any) {
    const value = event.target.value.replace(/\D/g, '');
    let maskedValue = '';

    if (this.appMask === 'cpf') {
      maskedValue = this.applyCpfMask(value);
    } else if (this.appMask === 'phone') {
      maskedValue = this.applyPhoneMask(value);
    }

    event.target.value = maskedValue;
    
    // Trigger input event for reactive forms
    this.el.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    // Permitir apenas números
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  private applyCpfMask(value: string): string {
    value = value.substring(0, 11); // Limitar a 11 dígitos
    
    if (value.length <= 3) {
      return value;
    } else if (value.length <= 6) {
      return value.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (value.length <= 9) {
      return value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
  }

  private applyPhoneMask(value: string): string {
    value = value.substring(0, 11); // Limitar a 11 dígitos
    
    if (value.length <= 2) {
      return value;
    } else if (value.length <= 7) {
      return value.replace(/(\d{2})(\d+)/, '($1) $2');
    } else if (value.length <= 10) {
      return value.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    } else {
      return value.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
    }
  }
}