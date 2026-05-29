import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzAppShellComponent } from './josanz-app-shell.component';
import { JosanzDemoAuthService } from './auth/josanz-demo-auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('JosanzAppShellComponent', () => {
  let auth: { logout: jest.Mock };
  let fixture: ComponentFixture<JosanzAppShellComponent>;
  let component: JosanzAppShellComponent;

  beforeEach(async () => {
    auth = { logout: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [JosanzAppShellComponent],
      providers: [
        { provide: JosanzDemoAuthService, useValue: auth },
        {
          provide: Router,
          useValue: {
            navigateByUrl: jest.fn(),
            events: of(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: { params: {}, queryParams: {}, data: {} },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzAppShellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onLogout', () => {
    it('should call auth.logout()', () => {
      component.onLogout();
      expect(auth.logout).toHaveBeenCalledTimes(1);
    });

    it('should navigate to /auth/login with replaceUrl', () => {
      component.onLogout();
      const router = TestBed.inject(Router);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login', { replaceUrl: true });
    });

    it('should logout before navigating', () => {
      const callOrder: string[] = [];
      auth.logout.mockImplementation(() => callOrder.push('logout'));
      const router = TestBed.inject(Router);
      (router as unknown as { navigateByUrl: jest.Mock }).navigateByUrl.mockImplementation(
        () => callOrder.push('navigate'),
      );

      component.onLogout();

      expect(callOrder).toEqual(['logout', 'navigate']);
    });
  });
});
