import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RentalsFeature } from './rentals-feature';

describe('RentalsFeature', () => {
  let component: RentalsFeature;
  let fixture: ComponentFixture<RentalsFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalsFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalsFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
