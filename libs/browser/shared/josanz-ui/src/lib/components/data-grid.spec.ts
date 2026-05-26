import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataGridComponent } from './data-grid';

describe('DataGridComponent', () => {
  let fixture: ComponentFixture<DataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataGridComponent);
    fixture.componentInstance.columns = [
      { key: 'name', label: 'Nombre' },
    ];
    fixture.componentInstance.rows = [{ id: '1', name: 'Test' }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should sort rows client-side', () => {
    fixture.componentInstance.rows = [
      { id: '1', name: 'Zeta' },
      { id: '2', name: 'Alpha' },
    ];
    fixture.componentInstance.sortBy('name');
    expect(fixture.componentInstance.displayedRows()[0]['name']).toBe('Alpha');
  });
});
