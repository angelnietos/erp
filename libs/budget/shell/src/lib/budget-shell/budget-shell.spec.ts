import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetShell } from './budget-shell';

describe('BudgetShell', () => {
  let component: BudgetShell;
  let fixture: ComponentFixture<BudgetShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetShell],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
