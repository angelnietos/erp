import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiBadgeComponent } from './badge.component';

describe('UiBadgeComponent', () => {
  let component: UiBadgeComponent;
  let fixture: ComponentFixture<UiBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default color', () => {
    component.color = 'default';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-color-default');
  });

  it('should display primary color', () => {
    component.color = 'primary';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-color-primary');
  });

  it('should display solid shape', () => {
    component.shape = 'solid';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('badge-shape-solid');
  });
});
