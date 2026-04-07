import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetFeature } from './budget-feature';

describe('BudgetFeature', () => {
  let component: BudgetFeature;
  let fixture: ComponentFixture<BudgetFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
