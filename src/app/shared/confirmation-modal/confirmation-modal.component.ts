import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, X, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" (click)="!isLoading() && cancel.emit()">
      <div class="card w-full max-w-md p-6 bg-card" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <lucide-icon [img]="AlertTriangle" class="text-destructive text-xl mr-3"></lucide-icon>
            <h2 class="text-lg font-semibold text-foreground">{{ title() }}</h2>
          </div>
          <button 
            class="btn btn-ghost btn-icon-sm" 
            (click)="cancel.emit()"
            [disabled]="isLoading()"
          >
            <lucide-icon [img]="X" class="w-4 h-4"></lucide-icon>
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
            <lucide-icon 
              *ngIf="isLoading()" 
              [img]="Loader2" 
              class="w-4 h-4 mr-2 animate-spin"
            ></lucide-icon>
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

  // Lucide icons
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;
  readonly Loader2 = Loader2;
}