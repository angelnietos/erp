import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingDataAccess } from './billing-data-access';

describe('BillingDataAccess', () => {
  let component: BillingDataAccess;
  let fixture: ComponentFixture<BillingDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
