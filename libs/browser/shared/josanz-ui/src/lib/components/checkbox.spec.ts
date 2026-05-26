import { TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox';
import { JosanzThemeService } from '../services/theme.service';

describe('CheckboxComponent', () => {
  const mockTheme = {
    currentTheme: () => ({
      defaultShape: 'rounded',
      atmosphere: { surface: '#fff', border: '#ddd' },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    const component = fixture.componentInstance;
    expect(component.label).toBe('Checkbox');
    expect(component.description).toBe('');
    expect(component.checked).toBe(false);
  });

  it('should set value via writeValue', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    const component = fixture.componentInstance;
    component.writeValue(true);
    expect(component.checked).toBe(true);
  });

  it('should generate correct corner class for square shape', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    const component = fixture.componentInstance;
    component.shape = 'square';
    expect(component.cornerClass()).toBe('rounded-none');
  });
});
