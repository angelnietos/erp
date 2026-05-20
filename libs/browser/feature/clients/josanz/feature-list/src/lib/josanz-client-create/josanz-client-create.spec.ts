import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JosanzClientCreateComponent } from './josanz-client-create';

describe('JosanzClientCreateComponent', () => {
  let fixture: ComponentFixture<JosanzClientCreateComponent>;
  let component: JosanzClientCreateComponent;
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    router = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [JosanzClientCreateComponent],
      providers: [{ provide: Router, useValue: router }],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzClientCreateComponent);
    component = fixture.componentInstance;
  });

  it('starts with an empty required form and the default client type', () => {
    expect(component.form.valid).toBe(false);
    expect(component.selectedTypeLabel()).toBe('Tipo cliente 1');
    expect(component.selectedTypePillKey()).toBe('cliente-tipo-pink');
  });

  it('maps client types to their design-system pill keys', () => {
    component.form.patchValue({ tipo: 'tipo-2' });
    expect(component.selectedTypePillKey()).toBe('cliente-tipo-green');

    component.form.patchValue({ tipo: 'tipo-3' });
    expect(component.selectedTypePillKey()).toBe('cliente-tipo-yellow');

    component.form.patchValue({ tipo: 'nuevo' });
    expect(component.selectedTypePillKey()).toBe('cliente-nuevo');
  });

  it('marks fields as touched instead of navigating when submit is invalid', () => {
    component.onSubmit();

    expect(component.form.touched).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('navigates back to clients with created flag when submit is valid', () => {
    component.form.setValue({
      razonSocial: 'Empresa ejemplo',
      email: 'cliente@josanz.com',
      telefono: '+34 600 000 000',
      tipo: 'tipo-1',
    });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/clients'], { queryParams: { created: '1' } });
  });
});
