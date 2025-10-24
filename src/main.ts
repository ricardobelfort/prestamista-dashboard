import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { isDevMode } from '@angular/core';
import './app/chart.config';

// Forçar HTTPS em produção
if (!isDevMode() && location.protocol !== 'https:') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

bootstrapApplication(App, appConfig)
  .catch((err) => {
    // Em produção, não mostrar detalhes do erro
    if (isDevMode()) {
      console.error(err);
    } else {
      console.error('Erro ao inicializar a aplicação. Por favor, recarregue a página.');
    }
  });
