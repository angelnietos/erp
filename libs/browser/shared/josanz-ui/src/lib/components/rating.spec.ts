import { TestBed } from '@angular/core/testing';
import { RatingComponent } from './rating';

describe('RatingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    expect(component.value).toBe(4);
    expect(component.max).toBe(5);
    expect(component.readonly).toBe(false);
    expect(component.showValue).toBe(true);
  });

  it('should generate correct stars array', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    const stars = component.stars();
    expect(stars.length).toBe(5);
    expect(stars[0]).toBe(1);
    expect(stars[4]).toBe(5);
  });

  it('should generate stars based on max value', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    component.max = 10;
    const stars = component.stars();
    expect(stars.length).toBe(10);
  });

  it('should return custom color when provided', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    component.customColor = '#ff0000';
    expect(component.accentColor()).toBe('#ff0000');
  });

  it('should not change value when readonly', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    component.readonly = true;
    component.setValue(3);
    expect(component.value).toBe(4);
  });
});
