import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiTextareaComponent } from './textarea.component';

describe('UiTextareaComponent', () => {
  let component: UiTextareaComponent;
  let fixture: ComponentFixture<UiTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label', () => {
    component.label = 'Description';
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Description');
  });

  it('should apply glass variant', () => {
    component.variant = 'glass';
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.classList).toContain('textarea-glass');
  });

  it('should show error state', () => {
    component.error = true;
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.classList).toContain('invalid');
  });
});
