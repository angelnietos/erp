import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelectComponent } from './multi-select';

describe('MultiSelectComponent', () => {
  let fixture: ComponentFixture<MultiSelectComponent>;
  let component: MultiSelectComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectComponent);
    component = fixture.componentInstance;
    component.options = [
      { label: 'Cambio de aceite', value: 'oil' },
      { label: 'Revisión frenos', value: 'brakes' },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write values through ControlValueAccessor', () => {
    component.writeValue(['oil', 'brakes']);
    expect(component.values).toEqual(['oil', 'brakes']);
  });

  it('should emit values when toggling an option', () => {
    const emitted: string[][] = [];
    component.valuesChange.subscribe((values) => emitted.push(values));

    component.writeValue(['oil']);
    component.toggleValue('brakes');

    expect(component.values).toEqual(['oil', 'brakes']);
    expect(emitted).toEqual([['oil', 'brakes']]);
  });
});
