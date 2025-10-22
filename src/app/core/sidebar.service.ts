import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  expanded = signal(true);

  toggle() {
    this.expanded.update(current => !current);
  }

  setExpanded(value: boolean) {
    this.expanded.set(value);
  }
}