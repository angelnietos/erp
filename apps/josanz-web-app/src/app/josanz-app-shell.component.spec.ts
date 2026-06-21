import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { JosanzAppShellComponent } from './josanz-app-shell.component';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';

describe('JosanzAppShellComponent', () => {
  let authStore: { logout: jest.Mock };
  let fixture: ComponentFixture<JosanzAppShellComponent>;

  beforeEach(async () => {
    authStore = { logout: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [JosanzAppShellComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        {
          provide: JosanzThemeService,
          useValue: { setTheme: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzAppShellComponent);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls AuthStore.logout on shell logout', () => {
    fixture.componentInstance.onLogout();
    expect(authStore.logout).toHaveBeenCalledTimes(1);
  });
});
