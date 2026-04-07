import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingFeature } from './billing-feature';

describe('BillingFeature', () => {
  let component: BillingFeature;
  let fixture: ComponentFixture<BillingFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
