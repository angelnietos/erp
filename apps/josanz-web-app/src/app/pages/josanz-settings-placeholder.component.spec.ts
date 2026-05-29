import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzSettingsPlaceholderComponent } from './josanz-settings-placeholder.component';
import { provideRouter, ActivatedRoute } from '@angular/router';

describe('JosanzSettingsPlaceholderComponent', () => {
  let fixture: ComponentFixture<JosanzSettingsPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzSettingsPlaceholderComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
              queryParamMap: {
                get: jest.fn(),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzSettingsPlaceholderComponent);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('template', () => {
    it('should render app-settings-page component', () => {
      fixture.detectChanges();
      const settingsPage = fixture.nativeElement.querySelector('josanz-app-settings-page');
      expect(settingsPage).toBeTruthy();
    });
  });
});
