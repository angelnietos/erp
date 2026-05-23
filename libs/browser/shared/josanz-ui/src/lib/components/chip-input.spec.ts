import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipInputComponent } from './chip-input';

describe('ChipInputComponent', () => {
  let fixture: ComponentFixture<ChipInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipInputComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should write values through ControlValueAccessor', () => {
    fixture.componentInstance.writeValue(['Taller', 'Urgente']);
    expect(fixture.componentInstance.values).toEqual(['Taller', 'Urgente']);
  });
});
