import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiForms } from './ui-forms';

describe('UiForms', () => {
  let component: UiForms;
  let fixture: ComponentFixture<UiForms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiForms],
    }).compileComponents();

    fixture = TestBed.createComponent(UiForms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
