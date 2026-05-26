import { TestBed } from '@angular/core/testing';
import { SwitchComponent } from './switch';

describe('SwitchComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwitchComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SwitchComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(SwitchComponent);
    const component = fixture.componentInstance;
    expect(component.label).toBe('Switch');
    expect(component.description).toBe('');
    expect(component.checked).toBe(false);
  });

  it('should set value via writeValue', () => {
    const fixture = TestBed.createComponent(SwitchComponent);
    const component = fixture.componentInstance;
    component.writeValue(true);
    expect(component.checked).toBe(true);
  });

  it('should return accent color', () => {
    const fixture = TestBed.createComponent(SwitchComponent);
    const component = fixture.componentInstance;
    expect(component.accentColor).toBe('var(--josanz-primary)');
  });
});
