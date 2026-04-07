import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveryShell } from './delivery-shell';

describe('DeliveryShell', () => {
  let component: DeliveryShell;
  let fixture: ComponentFixture<DeliveryShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryShell],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
