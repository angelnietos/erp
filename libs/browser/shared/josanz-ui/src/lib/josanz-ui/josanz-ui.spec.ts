import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzUi } from './josanz-ui';

describe('JosanzUi', () => {
  let component: JosanzUi;
  let fixture: ComponentFixture<JosanzUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzUi],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
