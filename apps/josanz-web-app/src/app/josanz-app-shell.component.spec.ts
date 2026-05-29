import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { JosanzAppShellComponent } from './josanz-app-shell.component';
import { JosanzDemoAuthService } from './auth/josanz-demo-auth.service';

@Component({
  selector: 'josanz-sidebar',
  template: '',
})
class StubSidebarComponent {
  @Output() logoutClick = new EventEmitter<void>();
}

@Component({
  selector: 'josanz-mobile-tab-bar',
  template: '',
})
class StubMobileTabBarComponent {}

describe('JosanzAppShellComponent', () => {
  let auth: { logout: jest.Mock };
  let router: { navigateByUrl: jest.Mock };
  let fixture: ComponentFixture<JosanzAppShellComponent>;
  let component: JosanzAppShellComponent;

  beforeEach(async () => {
    auth = { logout: jest.fn() };
    router = { navigateByUrl: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [StubSidebarComponent, StubMobileTabBarComponent],
      imports: [JosanzAppShellComponent],
      providers: [
        { provide: JosanzDemoAuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzAppShellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct selector', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe('app-josanz-shell');
  });

  describe('onLogout', () => {
    it('should call auth.logout()', () => {
      component.onLogout();
      expect(auth.logout).toHaveBeenCalledTimes(1);
    });

    it('should navigate to /auth/login with replaceUrl', () => {
      component.onLogout();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login', { replaceUrl: true });
    });

    it('should logout before navigating', () => {
      const callOrder: string[] = [];
      auth.logout.mockImplementation(() => callOrder.push('logout'));
      router.navigateByUrl.mockImplementation(() => callOrder.push('navigate'));

      component.onLogout();

      expect(callOrder).toEqual(['logout', 'navigate']);
    });
  });

  describe('template', () => {
    beforeEach(() => fixture.detectChanges());

    it('should render the sidebar', () => {
      const sidebar = fixture.nativeElement.querySelector('josanz-sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('should render the mobile tab bar', () => {
      const tabBar = fixture.nativeElement.querySelector('josanz-mobile-tab-bar');
      expect(tabBar).toBeTruthy();
    });

    it('should render the router outlet', () => {
      const outlet = fixture.nativeElement.querySelector('router-outlet');
      expect(outlet).toBeTruthy();
    });

    it('should trigger onLogout when sidebar emits logoutClick', () => {
      const sidebarDebug = fixture.debugElement.query(
        (de) => de.nativeElement.tagName.toLowerCase() === 'josanz-sidebar',
      );
      (sidebarDebug.componentInstance as StubSidebarComponent).logoutClick.emit();
      expect(auth.logout).toHaveBeenCalledTimes(1);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login', { replaceUrl: true });
    });
  });
});
