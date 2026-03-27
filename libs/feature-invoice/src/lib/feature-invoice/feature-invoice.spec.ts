import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureInvoice } from './feature-invoice';

describe('FeatureInvoice', () => {
  let component: FeatureInvoice;
  let fixture: ComponentFixture<FeatureInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
