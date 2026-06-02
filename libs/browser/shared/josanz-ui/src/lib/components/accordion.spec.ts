import { TestBed } from '@angular/core/testing';
import { AccordionComponent } from './accordion';
import { JosanzThemeService } from '../services/theme.service';

describe('AccordionComponent', () => {
  const mockTheme = {
    currentTheme: () => ({
      defaultShape: 'rounded',
      atmosphere: {
        surface: '#fff',
        border: '#ddd',
        text: '#333',
        textMuted: '#666',
        shadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have empty items by default', () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    expect(fixture.componentInstance.items.length).toBe(0);
  });

  it('should toggle item open state', () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    const component = fixture.componentInstance;
    const item = { id: 'test-1', title: 'Test', content: 'Content' };
    component.items = [item];
    component.openIds = [];
    component.toggle(item);
    expect(component.openIds).toContain('test-1');
  });

  it('should not toggle disabled item', () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    const component = fixture.componentInstance;
    const item = {
      id: 'test-1',
      title: 'Test',
      content: 'Content',
      disabled: true,
    };
    component.items = [item];
    component.openIds = [];
    component.toggle(item);
    expect(component.openIds.length).toBe(0);
  });

  it('should check if item is open', () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    const component = fixture.componentInstance;
    component.openIds = ['item-1', 'item-2'];
    expect(component.isOpen('item-1')).toBe(true);
    expect(component.isOpen('item-2')).toBe(true);
    expect(component.isOpen('item-3')).toBe(false);
  });

  it('should generate correct corner class for square shape', () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    const component = fixture.componentInstance;
    component.shape = 'square';
    expect(component.cornerClass()).toBe('rounded-none');
  });

  it('should generate correct corner class for pill shape', () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    const component = fixture.componentInstance;
    component.shape = 'pill';
    expect(component.cornerClass()).toBe('rounded-[28px]');
  });

  it('should generate accent color with custom color', () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    const component = fixture.componentInstance;
    component.customColor = '#ff0000';
    expect(component.accentColor()).toBe('#ff0000');
  });
});
