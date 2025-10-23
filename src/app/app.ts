import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { LanguageService } from './core/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html'
})
export class App implements OnInit {
  private languageService = inject(LanguageService);

  ngOnInit(): void {
    // O LanguageService já inicializa automaticamente no construtor
    // mas injetamos aqui para garantir que seja instanciado no app root
  }
}

