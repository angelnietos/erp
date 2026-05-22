import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiSearchToolbarComponent } from './search-toolbar.component';

describe('UiSearchToolbarComponent', () => {
  let fixture: ComponentFixture<UiSearchToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSearchToolbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSearchToolbarComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render feature shell', () => {
    const el = fixture.nativeElement.querySelector('.search-toolbar--feature');
    expect(el).toBeTruthy();
  });
});
