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

  it('should open page picker and emit on select', () => {
    component.total = 10;
    component.current = 1;
    fixture.detectChanges();

    jest.spyOn(component.pageChange, 'emit');

    component.togglePagePicker(new Event('click'));
    expect(component.pagePickerOpen).toBe(true);

    component.selectPage(4, new Event('click'));
    expect(component.pageChange.emit).toHaveBeenCalledWith(4);
    expect(component.pagePickerOpen).toBe(false);
  });

  it('should list all page numbers in pageOptions', () => {
    component.total = 5;
    expect(component.pageOptions()).toEqual([1, 2, 3, 4, 5]);
  });
});
