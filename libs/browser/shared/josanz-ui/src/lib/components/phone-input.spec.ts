import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhoneInputComponent } from './phone-input';

describe('PhoneInputComponent', () => {
  let fixture: ComponentFixture<PhoneInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneInputComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should parse prefix on writeValue', () => {
    fixture.componentInstance.writeValue('+34 600 111 222');
    expect(fixture.componentInstance.countryCode).toBe('+34');
  });
});
