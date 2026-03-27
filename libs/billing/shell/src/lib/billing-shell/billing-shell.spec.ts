import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingShell } from './billing-shell';

describe('BillingShell', () => {
  let component: BillingShell;
  let fixture: ComponentFixture<BillingShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingShell],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
