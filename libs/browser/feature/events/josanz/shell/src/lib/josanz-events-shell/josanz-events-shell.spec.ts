import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzEventsShell } from './josanz-events-shell';

describe('JosanzEventsShell', () => {
  let component: JosanzEventsShell;
  let fixture: ComponentFixture<JosanzEventsShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzEventsShell],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzEventsShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
