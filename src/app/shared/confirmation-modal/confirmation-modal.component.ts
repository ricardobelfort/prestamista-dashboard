import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" (click)="!isLoading() && cancel.emit()">
      <div class="card w-full max-w-md p-6 bg-card" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <fa-icon [icon]="faExclamationTriangle" class="text-destructive text-xl mr-3"></fa-icon>
            <h2 class="text-lg font-semibold text-foreground">{{ title() }}</h2>
          </div>
          <button 
            class="btn btn-ghost btn-icon-sm" 
            (click)="cancel.emit()"
            [disabled]="isLoading()"
          >
            <fa-icon [icon]="faTimes" class="w-4 h-4"></fa-icon>
          </button>
        </div>

        <p class="text-muted-foreground mb-6">{{ message() }}</p>

        <div class="flex justify-end space-x-2">
          <button 
            type="button" 
            class="btn btn-outline" 
            (click)="cancel.emit()"
            [disabled]="isLoading()"
          >
            {{ cancelText() }}
          </button>
          <button 
            type="button" 
            class="btn btn-destructive" 
            (click)="confirm.emit()"
            [disabled]="isLoading()"
          >
            <fa-icon 
              *ngIf="isLoading()" 
              [icon]="faSpinner" 
              class="w-4 h-4 mr-2 animate-spin"
            ></fa-icon>
            {{ confirmText() }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  // Inputs
  title = input<string>('Confirmar ação');
  message = input<string>('Tem certeza que deseja continuar?');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');
  isLoading = input<boolean>(false);

  // Outputs
  confirm = output<void>();
  cancel = output<void>();

  // Icons
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;
  faSpinner = faSpinner;
}