import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RentalsShell } from './rentals-shell';

describe('RentalsShell', () => {
  let component: RentalsShell;
  let fixture: ComponentFixture<RentalsShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalsShell],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalsShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
