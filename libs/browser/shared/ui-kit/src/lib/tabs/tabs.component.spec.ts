import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiTabsComponent } from './tabs.component';

describe('UiTabsComponent', () => {
  let component: UiTabsComponent;
  let fixture: ComponentFixture<UiTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTabsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tabs', () => {
    component.tabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
    ];
    component.activeTab = 'tab1';
    fixture.detectChanges();
    const tabItems = fixture.nativeElement.querySelectorAll('.tab-item');
    expect(tabItems.length).toBe(2);
  });

  it('should mark active tab', () => {
    component.tabs = [{ id: 'tab1', label: 'Tab 1' }];
    component.activeTab = 'tab1';
    fixture.detectChanges();
    const activeTab = fixture.nativeElement.querySelector('.tab-item.active');
    expect(activeTab).toBeTruthy();
  });

  it('should apply underline variant', () => {
    component.tabs = [{ id: 'tab1', label: 'Tab 1' }];
    component.variant = 'underline';
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelector('.tabs');
    expect(tabs.classList).toContain('tabs-underline');
  });
});
