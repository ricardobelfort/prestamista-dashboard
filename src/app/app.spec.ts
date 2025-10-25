import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('App', () => {
  let translateServiceMock: jest.Mocked<TranslateService>;

  beforeEach(async () => {
    translateServiceMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn().mockReturnValue(of({})),
      reloadLang: jest.fn().mockReturnValue(of({})),
      get: jest.fn().mockReturnValue(of({})),
      currentLang: 'pt-BR',
    } as any;

    await TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render toaster', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('ngx-sonner-toaster')).toBeTruthy();
  });
});
