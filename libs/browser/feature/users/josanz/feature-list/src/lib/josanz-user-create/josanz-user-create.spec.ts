import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzUserCreate } from './josanz-user-create';

describe('JosanzUserCreate', () => {
  let component: JosanzUserCreate;
  let fixture: ComponentFixture<JosanzUserCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzUserCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzUserCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
