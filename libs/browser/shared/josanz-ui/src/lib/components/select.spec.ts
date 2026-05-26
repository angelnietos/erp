import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from './select';

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent>;
  let component: SelectComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent, ReactiveFormsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    component.options = [
      { label: 'Madrid', value: 'mad' },
      { label: 'Barcelona', value: 'bcn' },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync with FormControl via CVA', () => {
    const control = new FormControl('bcn');
    component.registerOnChange((value: string) => control.setValue(value, { emitEvent: false }));
    component.writeValue(control.value);
    fixture.detectChanges();
    expect(component.value).toBe('bcn');
  });
});
