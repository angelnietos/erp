import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzStockShell } from './josanz-stock-shell';

describe('JosanzStockShell', () => {
  let component: JosanzStockShell;
  let fixture: ComponentFixture<JosanzStockShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzStockShell],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzStockShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
