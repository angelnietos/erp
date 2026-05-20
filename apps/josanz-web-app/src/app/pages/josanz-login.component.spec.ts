import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { JosanzDemoAuthService } from '../auth/josanz-demo-auth.service';
import { JosanzLoginComponent } from './josanz-login.component';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';

describe('JosanzLoginComponent', () => {
  const auth = {
    login: jest.fn(),
  };
  const router = {
    navigate: jest.fn(),
  };
  const theme = {
    setTheme: jest.fn(),
    currentTheme: jest.fn(() => ({ defaultShape: 'rounded', primaryColor: '#080808' })),
  };

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
  });

  it('applies the rounded login shape on init', () => {
    const fixture = TestBed.createComponent(JosanzLoginComponent);
    fixture.detectChanges();

    expect(theme.setTheme).toHaveBeenCalledWith('luxe-rounded');
  });

  it('marks invalid form controls as touched without logging in', () => {
    const fixture = TestBed.createComponent(JosanzLoginComponent);
    const component = fixture.componentInstance;
    component.loginForm.setValue({ email: '', password: '' });

    component.onSubmit();

    expect(component.loginForm.touched).toBe(true);
    expect(auth.login).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('logs in and navigates to dashboard when the form is valid', () => {
    const fixture = TestBed.createComponent(JosanzLoginComponent);

    fixture.componentInstance.onSubmit();

    expect(auth.login).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
  });
});
