import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { VersionDebugComponent } from './shared/version-debug.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, VersionDebugComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html'
})
export class App {
}
