import { TestBed } from '@angular/core/testing';
import { JosanzAppShellComponent } from './josanz-app-shell.component';
import { provideRouter } from '@angular/router';
import { JosanzDemoAuthService } from './auth/josanz-demo-auth.service';

describe('JosanzAppShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzAppShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: JosanzDemoAuthService,
          useValue: { logout: jest.fn() },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(JosanzAppShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});