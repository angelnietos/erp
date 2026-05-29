import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetFeatureComponent } from './budget-feature.component';

describe('BudgetFeature', () => {
  let component: BudgetFeatureComponent;
  let fixture: ComponentFixture<BudgetFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetFeatureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetFeatureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
