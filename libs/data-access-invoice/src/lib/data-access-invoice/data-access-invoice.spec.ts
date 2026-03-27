import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataAccessInvoice } from './data-access-invoice';

describe('DataAccessInvoice', () => {
  let component: DataAccessInvoice;
  let fixture: ComponentFixture<DataAccessInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAccessInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(DataAccessInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
