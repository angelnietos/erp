import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NumberInputComponent } from './number-input';

describe('NumberInputComponent', () => {
  let fixture: ComponentFixture<NumberInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberInputComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should write value through ControlValueAccessor', () => {
    fixture.componentInstance.writeValue(7);
    expect(fixture.componentInstance.value).toBe(7);
  });
});
