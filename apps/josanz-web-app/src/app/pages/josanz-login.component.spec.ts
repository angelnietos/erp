import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JosanzDemoAuthService } from '../auth/josanz-demo-auth.service';
import { JosanzLoginComponent } from './josanz-login.component';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';

describe('JosanzLoginComponent', () => {
  const auth = { login: jest.fn() };
  const router = { navigate: jest.fn() };
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
        { provide: JosanzDemoAuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: JosanzThemeService, useValue: theme },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzLoginComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('applies the rounded login shape on init', () => {
      fixture.detectChanges();
      expect(theme.setTheme).toHaveBeenCalledWith('luxe-rounded');
    });

    it('should have default email value', () => {
      expect(component.loginForm.controls.email.value).toBe('admin@josanz.com');
    });

    it('should have default password value', () => {
      expect(component.loginForm.controls.password.value).toBe('demo');
    });

    it('should have required validator on email', () => {
      component.loginForm.controls.email.setValue('');
      expect(component.loginForm.controls.email.hasError('required')).toBe(
        true,
      );
    });

    it('should have required validator on password', () => {
      component.loginForm.controls.password.setValue('');
      expect(component.loginForm.controls.password.hasError('required')).toBe(
        true,
      );
    });

    it('should have loginCta from JOSANZ_FIGMA_LOGIN', () => {
      expect(component.loginCta).toBeDefined();
    });
  });

  describe('form submission', () => {
    it('marks invalid form controls as touched without logging in', () => {
      component.loginForm.setValue({ email: '', password: '' });
      component.onSubmit();

      expect(component.loginForm.touched).toBe(true);
      expect(auth.login).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('marks individual controls as touched when form is invalid', () => {
      component.loginForm.setValue({ email: '', password: '' });
      component.onSubmit();

      expect(component.loginForm.controls.email.touched).toBe(true);
      expect(component.loginForm.controls.password.touched).toBe(true);
    });

    it('blocks submission with only email filled', () => {
      component.loginForm.setValue({ email: 'test@test.com', password: '' });
      component.onSubmit();

      expect(auth.login).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('blocks submission with only password filled', () => {
      component.loginForm.setValue({ email: '', password: 'secret' });
      component.onSubmit();

      expect(auth.login).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('logs in and navigates to dashboard when the form is valid', () => {
      component.onSubmit();

      expect(auth.login).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], {
        replaceUrl: true,
      });
    });
  });

  describe('template', () => {
    beforeEach(() => fixture.detectChanges());

    it('should render the form', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should render email input', () => {
      const inputs = fixture.nativeElement.querySelectorAll('josanz-input');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it('should render submit button', () => {
      const button = fixture.nativeElement.querySelector('josanz-button');
      expect(button).toBeTruthy();
    });

    it('should have button with Acceder label', () => {
      const button = fixture.nativeElement.querySelector('josanz-button');
      expect(button.textContent).toContain('Acceder');
    });
  });
});
