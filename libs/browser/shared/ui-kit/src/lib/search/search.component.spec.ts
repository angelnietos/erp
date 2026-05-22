import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiSearchComponent } from './search.component';

describe('UiSearchComponent', () => {
  let component: UiSearchComponent;
  let fixture: ComponentFixture<UiSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display placeholder', () => {
    component.placeholder = 'Search...';
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('placeholder')).toBe('Search...');
  });

  it('should apply glass variant', () => {
    component.variant = 'glass';
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.search-wrapper');
    expect(wrapper.classList).toContain('search-glass');
  });

  it('should emit search change', () => {
    spyOn(component.searchChange, 'emit');
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(component.searchChange.emit).toHaveBeenCalledWith('test');
  });
});
