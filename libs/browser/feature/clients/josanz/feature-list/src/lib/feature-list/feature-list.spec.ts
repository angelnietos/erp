import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { JosanzClientsListComponent } from './feature-list';

describe('JosanzClientsListComponent', () => {
  let component: JosanzClientsListComponent;
  let fixture: ComponentFixture<JosanzClientsListComponent>;
  let router: { navigate: jest.Mock };
  let mockRoute: { snapshot: { queryParamMap: { get: jest.Mock } } };

  beforeEach(async () => {
    router = { navigate: jest.fn() };
    mockRoute = {
      snapshot: {
        queryParamMap: { get: jest.fn() },
      },
    };

    await TestBed.configureTestingModule({
      imports: [JosanzClientsListComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzClientsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have title', () => {
      expect(component.title).toBe('Clientes');
    });

    it('should have primaryBtnLabel', () => {
      expect(component.primaryBtnLabel).toBe('Añadir Cliente');
    });

    it('should have filterOptions', () => {
      expect(component.filterOptions.length).toBe(5);
      expect(component.filterOptions).toContain('Todos');
    });

    it('should have clientFieldLabels', () => {
      expect(component.clientFieldLabels).toEqual([
        'Teléfono',
        'Email',
        'Operador',
      ]);
    });

    it('should have all client items', () => {
      expect(component.clientItems.length).toBe(7);
    });

    it('should have default pagination', () => {
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(10);
    });
  });

  describe('ngOnInit with query params', () => {
    it('should show success indicators when ?created=1', async () => {
      mockRoute.snapshot.queryParamMap.get.mockReturnValue('1');
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [JosanzClientsListComponent],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: mockRoute },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(JosanzClientsListComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent.showSuccessToast).toBe(true);
      expect(newComponent.showSuccessModal).toBe(true);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockRoute,
        queryParams: {},
        replaceUrl: true,
      });
    });

    it('should not show success indicators when ?created is not 1', async () => {
      mockRoute.snapshot.queryParamMap.get.mockReturnValue(null);
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [JosanzClientsListComponent],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: mockRoute },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(JosanzClientsListComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent.showSuccessToast).toBe(false);
      expect(newComponent.showSuccessModal).toBe(false);
    });
  });

  describe('filteredClientItems', () => {
    it('should return all items when activeTypology is Todos', () => {
      component.activeTypology = 'Todos';
      const filtered = component.filteredClientItems;
      expect(filtered.length).toBe(component.clientItems.length);
    });

    it('should filter items by typology', () => {
      component.activeTypology = 'Tipo cliente 1';
      const filtered = component.filteredClientItems;
      expect(
        filtered.every((item) => item.statusVariant === 'cliente-tipo-pink'),
      ).toBe(true);
    });
  });

  describe('typologyPillKey', () => {
    it('should map tab names to pill keys', () => {
      expect(component.typologyPillKey('Tipo cliente 1')).toBe(
        'cliente-tipo-pink',
      );
      expect(component.typologyPillKey('Tipo cliente 2')).toBe(
        'cliente-tipo-green',
      );
      expect(component.typologyPillKey('Tipo cliente 3')).toBe(
        'cliente-tipo-yellow',
      );
    });

    it('should return undefined for unknown tab', () => {
      expect(component.typologyPillKey('Unknown')).toBeUndefined();
    });
  });

  describe('pagination', () => {
    it('should calculate totalPages', () => {
      const total = component.totalPages;
      expect(total).toBeGreaterThanOrEqual(1);
    });

    it('should return paginated items', () => {
      component.currentPage = 1;
      const page1 = component.paginatedItems;
      expect(page1.length).toBeLessThanOrEqual(component.pageSize);
    });

    it('should change page', () => {
      component.onPageChange(2);
      expect(component.currentPage).toBe(2);
    });
  });

  describe('onFilter', () => {
    it('should set activeTypology and reset currentPage', () => {
      component.currentPage = 3;
      component.onFilter('Tipo cliente 2');
      expect(component.activeTypology).toBe('Tipo cliente 2');
      expect(component.currentPage).toBe(1);
    });
  });

  describe('onAdd', () => {
    it('should navigate to /clients/new', () => {
      component.onAdd();
      expect(router.navigate).toHaveBeenCalledWith(['/clients/new']);
    });
  });

  describe('openDetail', () => {
    it('should navigate to client detail', () => {
      const item = component.clientItems[0];
      component.openDetail(item);
      expect(router.navigate).toHaveBeenCalledWith(['/clients', item.id]);
    });
  });

  describe('dismissToast', () => {
    it('should hide success toast', () => {
      component.showSuccessToast = true;
      component.dismissToast();
      expect(component.showSuccessToast).toBe(false);
    });
  });

  describe('closeSuccessModal', () => {
    it('should hide success modal', () => {
      component.showSuccessModal = true;
      component.closeSuccessModal();
      expect(component.showSuccessModal).toBe(false);
    });
  });

  describe('onExcel', () => {
    it('should log export message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.onExcel();
      expect(consoleSpy).toHaveBeenCalledWith('Exportando clientes a Excel...');
      consoleSpy.mockRestore();
    });
  });
});
