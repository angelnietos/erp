import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiCardComponent } from './card.component';

describe('UiCardComponent', () => {
  let component: UiCardComponent;
  let fixture: ComponentFixture<UiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    component.title = 'Test Title';
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.card-header h3');
    expect(title.textContent).toContain('Test Title');
  });

  it('should apply primary color', () => {
    component.color = 'primary';
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card');
    expect(card.classList).toContain('card-color-primary');
  });

  it('should apply glass shape', () => {
    component.shape = 'glass';
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card');
    expect(card.classList).toContain('card-shape-glass');
  });
});
