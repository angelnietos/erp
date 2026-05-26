import { TestBed } from '@angular/core/testing';
import { JosanzSettingsPlaceholderComponent } from './josanz-settings-placeholder.component';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

describe('JosanzSettingsPlaceholderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzSettingsPlaceholderComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: {} } },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(JosanzSettingsPlaceholderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});