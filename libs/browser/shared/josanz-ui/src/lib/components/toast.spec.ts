import { TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast';

describe('ToastComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    expect(component.toasts.length).toBe(0);
    expect(component.position).toBe('top-right');
    expect(component.dismissible).toBe(true);
    expect(component.limit).toBe(4);
  });

  it('should limit visible toasts', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    component.toasts = [
      { id: '1', title: 'Toast 1' },
      { id: '2', title: 'Toast 2' },
      { id: '3', title: 'Toast 3' },
      { id: '4', title: 'Toast 4' },
      { id: '5', title: 'Toast 5' },
    ];
    component.limit = 3;
    expect(component.visibleToasts().length).toBe(3);
  });

  it('should return correct position class for top-left', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    component.position = 'top-left';
    expect(component.positionClass()).toBe('left-4 top-4');
  });

  it('should return correct position class for bottom-right', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    component.position = 'bottom-right';
    expect(component.positionClass()).toBe('bottom-4 right-4');
  });

  it('should return correct tone color for success', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    expect(component.toneColor('success')).toBe('var(--josanz-success)');
  });

  it('should return correct tone color for danger', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    expect(component.toneColor('danger')).toBe('var(--josanz-danger)');
  });

  it('should dismiss toast and emit event', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    const spy = jest.spyOn(component.toastDismiss, 'emit');

    component.dismiss('toast-1');

    expect(spy).toHaveBeenCalledWith('toast-1');
  });

  it('should emit action event', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const component = fixture.componentInstance;
    const toast = { id: 'toast-1', title: 'Test' };
    const spy = jest.spyOn(component.toastAction, 'emit');

    component.action(toast);

    expect(spy).toHaveBeenCalledWith(toast);
  });
});
