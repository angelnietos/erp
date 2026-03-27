import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataAccessBudget } from './data-access-budget';

describe('DataAccessBudget', () => {
  let component: DataAccessBudget;
  let fixture: ComponentFixture<DataAccessBudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAccessBudget],
    }).compileComponents();

    fixture = TestBed.createComponent(DataAccessBudget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
