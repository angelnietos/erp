import { TestBed } from '@angular/core/testing';
import { AvatarGroupComponent } from './avatar-group';

describe('AvatarGroupComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarGroupComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    const component = fixture.componentInstance;
    expect(component.items.length).toBe(0);
    expect(component.max).toBe(4);
    expect(component.size).toBe(36);
  });

  it('should limit visible items', () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    const component = fixture.componentInstance;
    component.items = [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
      { name: 'D' },
      { name: 'E' },
    ];
    expect(component.visibleItems().length).toBe(4);
  });

  it('should calculate extra count', () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    const component = fixture.componentInstance;
    component.items = [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
      { name: 'D' },
      { name: 'E' },
    ];
    expect(component.extraCount()).toBe(1);
  });

  it('should generate initials', () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    const component = fixture.componentInstance;
    expect(component.initials('John Doe')).toBe('JD');
    expect(component.initials('Jane')).toBe('J');
    expect(component.initials('A')).toBe('A');
  });

  it('should return fallback color', () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    const component = fixture.componentInstance;
    expect(component.fallbackColor(0)).toBe('#635BFF');
    expect(component.fallbackColor(1)).toBe('#0F766E');
    expect(component.fallbackColor(5)).toBe('#635BFF');
  });
});
