import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryShell } from './inventory-shell';

describe('InventoryShell', () => {
  let component: InventoryShell;
  let fixture: ComponentFixture<InventoryShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryShell],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
