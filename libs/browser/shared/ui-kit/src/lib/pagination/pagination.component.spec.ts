import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiPaginationComponent } from './pagination.component';

describe('UiPaginationComponent', () => {
  let component: UiPaginationComponent;
  let fixture: ComponentFixture<UiPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate visible pages', () => {
    component.currentPage = 1;
    component.totalPages = 10;
    component.maxVisiblePages = 5;
    fixture.detectChanges();
    expect(component.visiblePages).toEqual([1, 2, 3, 4, 5]);
  });

  it('should apply minimal variant', () => {
    component.variant = 'minimal';
    fixture.detectChanges();
    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination.classList).toContain('pagination-minimal');
  });

  it('should emit page change', () => {
    spyOn(component.pageChange, 'emit');
    component.onPageChange(2);
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });
});
