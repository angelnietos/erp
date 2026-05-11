import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainTemplateCard } from './main-template-card';

describe('MainTemplateCard', () => {
  let component: MainTemplateCard;
  let fixture: ComponentFixture<MainTemplateCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainTemplateCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MainTemplateCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
