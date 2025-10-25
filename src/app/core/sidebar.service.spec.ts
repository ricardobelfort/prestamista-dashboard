import { TestBed } from '@angular/core/testing';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
  let service: SidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SidebarService],
    });
    service = TestBed.inject(SidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with expanded = true', () => {
    expect(service.expanded()).toBe(true);
  });

  it('should toggle expanded state', () => {
    expect(service.expanded()).toBe(true);
    
    service.toggle();
    expect(service.expanded()).toBe(false);
    
    service.toggle();
    expect(service.expanded()).toBe(true);
  });

  it('should set expanded to true', () => {
    service.setExpanded(false);
    expect(service.expanded()).toBe(false);
    
    service.setExpanded(true);
    expect(service.expanded()).toBe(true);
  });

  it('should set expanded to false', () => {
    service.setExpanded(false);
    expect(service.expanded()).toBe(false);
  });
});
