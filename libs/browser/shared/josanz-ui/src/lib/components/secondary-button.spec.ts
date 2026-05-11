import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondaryButton } from './secondary-button';

describe('SecondaryButton', () => {
  let component: SecondaryButton;
  let fixture: ComponentFixture<SecondaryButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondaryButton],
    }).compileComponents();

    fixture = TestBed.createComponent(SecondaryButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
