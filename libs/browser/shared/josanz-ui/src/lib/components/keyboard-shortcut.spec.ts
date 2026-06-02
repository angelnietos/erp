import { TestBed } from '@angular/core/testing';
import { KeyboardShortcutComponent } from './keyboard-shortcut';

describe('KeyboardShortcutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyboardShortcutComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(KeyboardShortcutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default keys', () => {
    const fixture = TestBed.createComponent(KeyboardShortcutComponent);
    const component = fixture.componentInstance;
    expect(component.keys.length).toBe(2);
    expect(component.keys).toContain('Ctrl');
    expect(component.keys).toContain('K');
  });

  it('should accept custom keys', () => {
    const fixture = TestBed.createComponent(KeyboardShortcutComponent);
    const component = fixture.componentInstance;
    component.keys = ['Cmd', 'Shift', 'A'];
    expect(component.keys.length).toBe(3);
  });
});
