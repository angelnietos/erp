import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzUiComponent } from './josanz-ui';

describe('JosanzUi', () => {
  let component: JosanzUiComponent;
  let fixture: ComponentFixture<JosanzUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JosanzUiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzUiComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
