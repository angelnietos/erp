import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzUsersShell } from './josanz-users-shell';

describe('JosanzUsersShell', () => {
  let component: JosanzUsersShell;
  let fixture: ComponentFixture<JosanzUsersShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzUsersShell],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzUsersShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
