import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { JosanzStockListComponent } from './josanz-stock-feature-list';

describe('JosanzStockListComponent', () => {
  let component: JosanzStockListComponent;
  let fixture: ComponentFixture<JosanzStockListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzStockListComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzStockListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
