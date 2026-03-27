import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryDataAccess } from './inventory-data-access';

describe('InventoryDataAccess', () => {
  let component: InventoryDataAccess;
  let fixture: ComponentFixture<InventoryDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
