import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetFeature } from './fleet-feature';

describe('FleetFeature', () => {
  let component: FleetFeature;
  let fixture: ComponentFixture<FleetFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(FleetFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
