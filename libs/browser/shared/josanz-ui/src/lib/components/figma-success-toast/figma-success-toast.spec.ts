import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { JosanzFigmaSuccessToastComponent } from './figma-success-toast';

describe('JosanzFigmaSuccessToastComponent', () => {
  let fixture: ComponentFixture<JosanzFigmaSuccessToastComponent>;
  let component: JosanzFigmaSuccessToastComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzFigmaSuccessToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzFigmaSuccessToastComponent);
    component = fixture.componentInstance;
    component.message = 'Guardado';
  });

  it('se cierra solo tras el tiempo configurado', fakeAsync(() => {
    const dismissSpy = jest.fn();
    component.dismissed.subscribe(dismissSpy);
    component.open = true;
    component.durationMs = 2000;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.josanz-client-success-toast')).toBeTruthy();

    tick(1999);
    expect(dismissSpy).not.toHaveBeenCalled();

    tick(1);
    expect(dismissSpy).toHaveBeenCalledTimes(1);
  }));

  it('se cierra al pulsar el botón', () => {
    const dismissSpy = jest.fn();
    component.dismissed.subscribe(dismissSpy);
    component.open = true;
    fixture.detectChanges();

    const closeBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.josanz-client-success-toast__close');
    closeBtn?.click();

    expect(dismissSpy).toHaveBeenCalledTimes(1);
  });
});
