import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal';
import { JosanzThemeService } from '../services/theme.service';

describe('ModalComponent', () => {
  const mockTheme = {
    currentTheme: () => ({
      defaultShape: 'rounded',
      atmosphere: { surface: '#fff', border: '#ddd' },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    const component = fixture.componentInstance;
    expect(component.title).toBe('');
    expect(component.width).toBe('712px');
    expect(component.trapFocus).toBe(true);
    expect(component.closeOnBackdrop).toBe(true);
  });

  it('should emit close event on onClose', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    const component = fixture.componentInstance;
    const spy = jest.fn('close');
    component.close.subscribe(spy);
    component.onClose();
    expect(spy).toHaveBeenCalled();
  });

  it('should generate correct modal classes', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    const component = fixture.componentInstance;
    expect(component.modalClasses).toContain('rounded-[24px]');
  });
});
