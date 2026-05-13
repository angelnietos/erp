import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit pageChange when clicking another page', () => {
    component.total = 5;
    component.current = 1;
    fixture.detectChanges();

    jest.spyOn(component.pageChange, 'emit');

    component.go(3);
    expect(component.pageChange.emit).toHaveBeenCalledWith(3);
  });
});
