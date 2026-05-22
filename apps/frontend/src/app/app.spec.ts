import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { App } from './app';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { PluginStore } from '@josanz-erp/shared-data-access';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule],
      providers: [
        {
          provide: AuthStore,
          useValue: {
            loadUserFromToken: jest.fn(),
            refreshSession: jest.fn(),
          },
        },
        {
          provide: PluginStore,
          useValue: {
            loadFromStorage: jest.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create and render the root router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
