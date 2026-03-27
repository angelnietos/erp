import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RentalsDataAccess } from './rentals-data-access';

describe('RentalsDataAccess', () => {
  let component: RentalsDataAccess;
  let fixture: ComponentFixture<RentalsDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalsDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalsDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
