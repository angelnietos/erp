import { TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton';

describe('SkeletonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    const component = fixture.componentInstance;
    expect(component.variant).toBe('text');
    expect(component.lines).toBe(3);
    expect(component.animated).toBe(true);
  });

  it('should generate correct items for text variant', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    const component = fixture.componentInstance;
    component.lines = 5;
    const items = component.skeletonItems();
    expect(items.length).toBe(5);
  });

  it('should generate correct items with max 8', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    const component = fixture.componentInstance;
    component.lines = 10;
    const items = component.skeletonItems();
    expect(items.length).toBe(8);
  });

  it('should generate shine gradient', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    const component = fixture.componentInstance;
    expect(component.shineGradient()).toContain('linear-gradient');
  });
});
