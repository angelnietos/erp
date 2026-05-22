import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JosanzUsersListComponent } from './josanz-users-feature-list';

describe('JosanzUsersListComponent', () => {
  let component: JosanzUsersListComponent;
  let fixture: ComponentFixture<JosanzUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzUsersListComponent],
      providers: [{ provide: Router, useValue: { navigate: jest.fn() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzUsersListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
