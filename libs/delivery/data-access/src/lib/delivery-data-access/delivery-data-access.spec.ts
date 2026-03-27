import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveryDataAccess } from './delivery-data-access';

describe('DeliveryDataAccess', () => {
  let component: DeliveryDataAccess;
  let fixture: ComponentFixture<DeliveryDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
