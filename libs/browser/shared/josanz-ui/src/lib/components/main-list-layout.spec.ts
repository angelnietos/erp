import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainListLayout } from './main-list-layout';

describe('MainListLayout', () => {
  let component: MainListLayout;
  let fixture: ComponentFixture<MainListLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainListLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(MainListLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
