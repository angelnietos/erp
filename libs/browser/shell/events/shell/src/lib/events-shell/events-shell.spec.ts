import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsShell } from './events-shell';

describe('EventsShell', () => {
  let component: EventsShell;
  let fixture: ComponentFixture<EventsShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsShell],
    }).compileComponents();

    fixture = TestBed.createComponent(EventsShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
