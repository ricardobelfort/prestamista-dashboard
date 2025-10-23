import { Injectable, signal } from '@angular/core';

interface VersionInfo {
  version: string;
  formatted: string;
  buildInfo?: {
    baseVersion: string;
    buildNumber: string;
    gitCommit: string;
    gitBranch: string;
    environment: string;
    buildTime: string;
    isProduction: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private versionInfo = signal<VersionInfo>({
    version: '1.0.0',
    formatted: 'v1.0.0'
  });

  private loadingPromise: Promise<void>;

  constructor() {
    this.loadingPromise = this.loadVersionInfo();
  }

  private async loadVersionInfo(): Promise<void> {
    try {
      // Cache busting mais agressivo
      const cacheBuster = `?v=${Date.now()}&r=${Math.random()}`;
      const response = await fetch(`/version.json${cacheBuster}`);
      if (response.ok) {
        const data = await response.json();
        this.versionInfo.set(data);
      }
    } catch (error) {
      // Falha silenciosa - usa valores padrão
    }
  }

  // Método para forçar recarregamento
  async forceReload(): Promise<void> {
    this.loadingPromise = this.loadVersionInfo();
    return this.loadingPromise;
  }

  // Método para aguardar o carregamento
  async waitForLoad(): Promise<void> {
    return this.loadingPromise;
  }

  getVersion(): string {
    return this.versionInfo().version;
  }

  getVersionFormatted(): string {
    return this.versionInfo().formatted;
  }

  getBuildInfo() {
    return this.versionInfo().buildInfo;
  }

  isProduction(): boolean {
    return this.versionInfo().buildInfo?.isProduction ?? false;
  }

  getCommitHash(): string {
    return this.versionInfo().buildInfo?.gitCommit ?? '';
  }

  getBranch(): string {
    return this.versionInfo().buildInfo?.gitBranch ?? '';
  }
}