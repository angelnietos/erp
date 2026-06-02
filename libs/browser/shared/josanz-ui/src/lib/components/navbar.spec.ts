import { TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar';

describe('NavbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const component = fixture.componentInstance;
    expect(component.brand).toBe('Josanz ERP');
    expect(component.logoText).toBe('J');
    expect(component.compact).toBe(false);
    expect(component.items.length).toBe(0);
  });

  it('should generate active background with custom color', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const component = fixture.componentInstance;
    component.customColor = '#ff0000';
    expect(component.activeBackground()).toContain('#ff0000');
  });

  it('should generate active background without custom color', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const component = fixture.componentInstance;
    expect(component.activeBackground()).toContain('var(--josanz-primary)');
  });
});
