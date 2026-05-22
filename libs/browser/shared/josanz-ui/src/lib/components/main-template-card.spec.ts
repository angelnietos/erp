import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainTemplateCardComponent } from './main-template-card';

describe('MainTemplateCardComponent', () => {
  let component: MainTemplateCardComponent;
  let fixture: ComponentFixture<MainTemplateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainTemplateCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainTemplateCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
