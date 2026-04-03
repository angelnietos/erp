import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUiShell } from './shared-ui-shell';

describe('SharedUiShell', () => {
  let component: SharedUiShell;
  let fixture: ComponentFixture<SharedUiShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUiShell],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedUiShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
