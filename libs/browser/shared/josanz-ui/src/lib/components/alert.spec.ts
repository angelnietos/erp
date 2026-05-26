import { TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert';
import { JosanzThemeService } from '../services/theme.service';

describe('AlertComponent', () => {
  const mockTheme = {
    currentTheme: () => ({
      defaultShape: 'rounded',
      atmosphere: {
        surface: '#fff',
        border: '#ddd',
      },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    const component = fixture.componentInstance;
    expect(component.tone).toBe('info');
    expect(component.title).toBe('Información');
    expect(component.description).toBe('');
    expect(component.dismissible).toBe(false);
  });

  it('should return correct tone color for success', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    const component = fixture.componentInstance;
    component.tone = 'success';
    expect(component.toneColor()).toBe('var(--josanz-success)');
  });

  it('should return correct tone color for warning', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    const component = fixture.componentInstance;
    component.tone = 'warning';
    expect(component.toneColor()).toBe('var(--josanz-warning)');
  });

  it('should return correct tone color for danger', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    const component = fixture.componentInstance;
    component.tone = 'danger';
    expect(component.toneColor()).toBe('var(--josanz-danger)');
  });

  it('should return correct tone color for neutral', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    const component = fixture.componentInstance;
    component.tone = 'neutral';
    expect(component.toneColor()).toBe('var(--josanz-text-muted)');
  });

  it('should generate correct corner class for square shape', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    const component = fixture.componentInstance;
    component.shape = 'square';
    expect(component.cornerClass()).toBe('rounded-none');
  });

  it('should generate correct corner class for pill shape', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    const component = fixture.componentInstance;
    component.shape = 'pill';
    expect(component.cornerClass()).toBe('rounded-[28px]');
  });
});