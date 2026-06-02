import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card';
import { JosanzThemeService } from '../services/theme.service';

describe('CardComponent', () => {
  const mockTheme = {
    currentTheme: () => ({
      defaultShape: 'rounded',
      atmosphere: {
        surface: '#fff',
        border: '#ddd',
        shadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const component = fixture.componentInstance;
    expect(component.title).toBe('');
    expect(component.subtitle).toBe('');
    expect(component.elevated).toBe(true);
  });

  it('should generate corner class for square shape', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const component = fixture.componentInstance;
    component.shape = 'square';
    expect(component.cornerClass()).toBe('rounded-none');
  });

  it('should generate shell styles', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const component = fixture.componentInstance;
    const styles = component.shellStyles();
    expect(styles.backgroundColor).toBe('#fff');
    expect(styles.borderColor).toBe('#ddd');
  });
});
