import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzStockFeatureList } from './josanz-stock-feature-list';

describe('JosanzStockFeatureList', () => {
  let component: JosanzStockFeatureList;
  let fixture: ComponentFixture<JosanzStockFeatureList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzStockFeatureList],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzStockFeatureList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
