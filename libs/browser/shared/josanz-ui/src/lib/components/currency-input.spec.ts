import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyInputComponent } from './currency-input';

describe('CurrencyInputComponent', () => {
  let fixture: ComponentFixture<CurrencyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyInputComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should format value on writeValue', () => {
    fixture.componentInstance.writeValue(1250.5);
    expect(fixture.componentInstance.displayValue).toContain('1');
  });
});
