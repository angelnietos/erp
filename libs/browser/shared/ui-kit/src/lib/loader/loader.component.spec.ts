import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiLoaderComponent } from './loader.component';

describe('UiLoaderComponent', () => {
  let component: UiLoaderComponent;
  let fixture: ComponentFixture<UiLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiLoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    component.message = 'Loading...';
    fixture.detectChanges();
    const message = fixture.nativeElement.querySelector('.message');
    expect(message.textContent).toContain('Loading...');
  });

  it('should apply primary variant', () => {
    component.variant = 'primary';
    fixture.detectChanges();
    const loader = fixture.nativeElement.querySelector('.loader');
    expect(loader.classList).toContain('loader-primary');
  });

  it('should show clear button when value exists', () => {
    component.value = 'test';
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.clear-btn');
    expect(clearBtn).toBeTruthy();
  });
});
