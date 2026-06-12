import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzDeliveryNotesShell } from './josanz-delivery-notes-shell';

describe('JosanzDeliveryNotesShell', () => {
  let component: JosanzDeliveryNotesShell;
  let fixture: ComponentFixture<JosanzDeliveryNotesShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzDeliveryNotesShell],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzDeliveryNotesShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
