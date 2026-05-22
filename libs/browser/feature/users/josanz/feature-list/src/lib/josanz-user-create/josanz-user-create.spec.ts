import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JosanzUserCreateComponent } from './josanz-user-create';

describe('JosanzUserCreateComponent', () => {
  let component: JosanzUserCreateComponent;
  let fixture: ComponentFixture<JosanzUserCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzUserCreateComponent],
      providers: [{ provide: Router, useValue: { navigate: jest.fn() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzUserCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
