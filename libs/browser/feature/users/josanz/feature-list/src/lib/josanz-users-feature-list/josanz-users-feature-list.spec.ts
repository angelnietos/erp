import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzUsersFeatureList } from './josanz-users-feature-list';

describe('JosanzUsersFeatureList', () => {
  let component: JosanzUsersFeatureList;
  let fixture: ComponentFixture<JosanzUsersFeatureList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzUsersFeatureList],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzUsersFeatureList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
