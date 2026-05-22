import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiFeatureFilterBarComponent } from './feature-filter-bar.component';

describe('UiFeatureFilterBarComponent', () => {
  let fixture: ComponentFixture<UiFeatureFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiFeatureFilterBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiFeatureFilterBarComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render framed shell', () => {
    const el = fixture.nativeElement.querySelector('.feature-filter-bar--framed');
    expect(el).toBeTruthy();
  });
});
