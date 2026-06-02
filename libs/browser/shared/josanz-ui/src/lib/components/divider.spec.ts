import { TestBed } from '@angular/core/testing';
import { DividerComponent } from './divider';

describe('DividerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DividerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(DividerComponent);
    const component = fixture.componentInstance;
    expect(component.label).toBe('');
    expect(component.orientation).toBe('horizontal');
    expect(component.color).toBe('');
  });

  it('should return horizontal line class by default', () => {
    const fixture = TestBed.createComponent(DividerComponent);
    const component = fixture.componentInstance;
    expect(component.lineClass()).toBe('h-px flex-1');
  });

  it('should return vertical line class when orientation is vertical', () => {
    const fixture = TestBed.createComponent(DividerComponent);
    const component = fixture.componentInstance;
    component.orientation = 'vertical';
    expect(component.lineClass()).toBe('h-full min-h-8 w-px');
  });
});
