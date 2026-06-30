import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { JosanzLoginComponent } from './josanz-login.component';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';
import {
  AuthService,
  AuthStore,
  JOSANZ_FIGMA_TENANT_SLUG,
} from '@josanz-erp/identity-data-access';

describe('JosanzLoginComponent', () => {
  const authService = {
    canUseKeycloakPkce: jest.fn(() => false),
    isKeycloakAvailable: jest.fn(() => of(false)),
    startKeycloakPkceRedirect: jest.fn(),
  };
  const store = {
    login: jest.fn(),
    loading: jest.fn(() => false),
    error: jest.fn(() => null),
  };
  const theme = {
    setTheme: jest.fn(),
    currentTheme: jest.fn(() => ({
      defaultShape: 'rounded',
      primaryColor: '#080808',
    })),
  };
  let fixture: ComponentFixture<JosanzLoginComponent>;
  let component: JosanzLoginComponent;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [JosanzLoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: AuthStore, useValue: store },
        { provide: JosanzThemeService, useValue: theme },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzLoginComponent);
    component = fixture.componentInstance;
  });

  it('applies the rounded login shape on init', () => {
    fixture.detectChanges();
    expect(theme.setTheme).toHaveBeenCalledWith('luxe-rounded');
  });

  it('submits credentials through AuthStore when local fallback is active', () => {
    fixture.detectChanges();
    component.onSubmit();
    expect(store.login).toHaveBeenCalledWith({
      email: 'admin@alexis.local',
      password: 'Admin123!',
      tenantSlug: JOSANZ_FIGMA_TENANT_SLUG,
    });
  });

  it('does not submit when the form is invalid', () => {
    fixture.detectChanges();
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(store.login).not.toHaveBeenCalled();
  });
});
