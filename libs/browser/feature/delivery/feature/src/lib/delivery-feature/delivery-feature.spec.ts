import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveryFeature } from './delivery-feature';

describe('DeliveryFeature', () => {
  let component: DeliveryFeature;
  let fixture: ComponentFixture<DeliveryFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
