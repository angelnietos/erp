import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiSelectComponent } from './select.component';

describe('UiSelectComponent', () => {
  let component: UiSelectComponent;
  let fixture: ComponentFixture<UiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label', () => {
    component.label = 'Choose option';
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Choose option');
  });

  it('should render options', () => {
    component.options = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ];
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('option');
    expect(options.length).toBe(3); // placeholder + 2 options
  });

  it('should apply glass variant', () => {
    component.variant = 'glass';
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select');
    expect(select.classList).toContain('select-glass');
  });
});
