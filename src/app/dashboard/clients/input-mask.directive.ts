import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[mask]',
  standalone: true
})
export class InputMaskDirective {
  @Input() mask: 'cpf' | 'phone' = 'cpf';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (this.mask === 'cpf') {
      value = this.formatCPF(value);
    } else if (this.mask === 'phone') {
      value = this.formatPhone(value);
    }
    
    input.value = value;
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const charCode = event.which || event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  private formatCPF(value: string): string {
    value = value.substring(0, 11);
    return value
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  private formatPhone(value: string): string {
    value = value.substring(0, 11);
    return value
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
  }
}