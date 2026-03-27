import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryFeature } from './inventory-feature';

describe('InventoryFeature', () => {
  let component: InventoryFeature;
  let fixture: ComponentFixture<InventoryFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
