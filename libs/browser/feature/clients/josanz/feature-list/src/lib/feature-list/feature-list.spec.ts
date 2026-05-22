import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { JosanzClientsListComponent } from './feature-list';

describe('JosanzClientsListComponent', () => {
  let component: JosanzClientsListComponent;
  let fixture: ComponentFixture<JosanzClientsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzClientsListComponent],
      providers: [
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzClientsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
