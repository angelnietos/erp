import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureBudget } from './feature-budget';

describe('FeatureBudget', () => {
  let component: FeatureBudget;
  let fixture: ComponentFixture<FeatureBudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureBudget],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureBudget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
