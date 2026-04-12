import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeManager } from './theme-manager';

describe('ThemeManager', () => {
  let component: ThemeManager;
  let fixture: ComponentFixture<ThemeManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeManager],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
