import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetShell } from './fleet-shell';

describe('FleetShell', () => {
  let component: FleetShell;
  let fixture: ComponentFixture<FleetShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetShell],
    }).compileComponents();

    fixture = TestBed.createComponent(FleetShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
