import { TestBed } from '@angular/core/testing';
import { DrawerComponent } from './drawer';
import { JosanzThemeService } from '../services/theme.service';

describe('DrawerComponent', () => {
  const mockTheme = {
    currentTheme: () => ({
      defaultShape: 'rounded',
      atmosphere: {
        surface: '#fff',
        border: '#ddd',
      },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default values', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    const component = fixture.componentInstance;
    expect(component.open).toBe(false);
    expect(component.title).toBe('Panel');
    expect(component.position).toBe('right');
    expect(component.size).toBe('md');
    expect(component.closable).toBe(true);
    expect(component.showBackdrop).toBe(true);
  });

  it('should close and emit events', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    const component = fixture.componentInstance;
    component.open = true;
    const openChangeSpy = jest.spyOn(component.openChange, 'emit');
    const closedSpy = jest.spyOn(component.closed, 'emit');

    component.close();

    expect(component.open).toBe(false);
    expect(openChangeSpy).toHaveBeenCalledWith(false);
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should generate correct drawer classes for left position', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    const component = fixture.componentInstance;
    component.position = 'left';
    const classes = component.drawerClasses();
    expect(classes).toContain('left-4');
    expect(classes).toContain('w-[480px]');
  });

  it('should generate correct drawer classes for bottom position', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    const component = fixture.componentInstance;
    component.position = 'bottom';
    const classes = component.drawerClasses();
    expect(classes).toContain('bottom-4');
    expect(classes).toContain('rounded-t-3xl');
  });

  it('should generate correct drawer classes for right position', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    const component = fixture.componentInstance;
    component.position = 'right';
    const classes = component.drawerClasses();
    expect(classes).toContain('right-4');
  });

  it('should generate correct drawer classes for square shape', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    const component = fixture.componentInstance;
    component.shape = 'square';
    const classes = component.drawerClasses();
    expect(classes).toContain('rounded-none');
  });
});
