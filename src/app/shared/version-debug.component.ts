import { Component, inject } from '@angular/core';
import { VersionService } from '../core/version.service';

@Component({
  selector: 'app-version-debug',
  template: `
    <div class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border">
      <h3 class="font-bold text-sm mb-2">Debug Versão</h3>
      <div class="text-xs space-y-1">
        <div>Versão: {{ versionService.getVersionFormatted() }}</div>
        <div>Build: {{ versionService.getBuildInfo()?.buildNumber || 'N/A' }}</div>
        <div>Commit: {{ versionService.getCommitHash() || 'N/A' }}</div>
        <div>Ambiente: {{ versionService.getBuildInfo()?.environment || 'N/A' }}</div>
      </div>
      <button 
        (click)="reloadVersion()" 
        class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
        Recarregar Versão
      </button>
    </div>
  `
})
export class VersionDebugComponent {
  versionService = inject(VersionService);

  async reloadVersion() {
    console.log('🔄 Forçando reload da versão...');
    await this.versionService.forceReload();
    console.log('✅ Versão recarregada:', this.versionService.getVersionFormatted());
  }
}