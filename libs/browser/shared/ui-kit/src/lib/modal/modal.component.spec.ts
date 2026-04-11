import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiModalComponent } from './modal.component';

describe('UiModalComponent', () => {
  let component: UiModalComponent;
  let fixture: ComponentFixture<UiModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display modal when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal-overlay');
    expect(modal).toBeFalsy();
  });

  it('should display modal when isOpen is true', () => {
    component.isOpen = true;
    component.title = 'Test Modal';
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal-overlay');
    expect(modal).toBeTruthy();
    const title = fixture.nativeElement.querySelector('.modal-header h3');
    expect(title.textContent).toContain('Test Modal');
  });

  it('should apply danger color', () => {
    component.isOpen = true;
    component.color = 'danger';
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.modal-content');
    expect(content.classList).toContain('modal-color-danger');
  });
});
