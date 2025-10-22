import { Injectable } from '@angular/core';

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
  private versionInfo: VersionInfo = {
    version: '1.0.0',
    formatted: 'v1.0.0'
  };

  constructor() {
    this.loadVersionInfo();
  }

  private async loadVersionInfo(): Promise<void> {
    try {
      const response = await fetch('/assets/version.json');
      if (response.ok) {
        this.versionInfo = await response.json();
      }
    } catch (error) {
      console.warn('Could not load version info, using default');
    }
  }

  getVersion(): string {
    return this.versionInfo.version;
  }

  getVersionFormatted(): string {
    return this.versionInfo.formatted;
  }

  getBuildInfo() {
    return this.versionInfo.buildInfo;
  }

  isProduction(): boolean {
    return this.versionInfo.buildInfo?.isProduction ?? false;
  }

  getCommitHash(): string {
    return this.versionInfo.buildInfo?.gitCommit ?? '';
  }

  getBranch(): string {
    return this.versionInfo.buildInfo?.gitBranch ?? '';
  }
}