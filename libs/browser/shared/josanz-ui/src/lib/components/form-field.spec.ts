import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field';

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    fixture.componentInstance.label = 'Campo';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
