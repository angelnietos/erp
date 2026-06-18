import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JosanzClientsListComponent } from './feature-list';

describe('JosanzClientsListComponent integration', () => {
  let fixture: ComponentFixture<JosanzClientsListComponent>;
  let component: JosanzClientsListComponent;
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    router = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [JosanzClientsListComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ created: '1' }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzClientsListComponent);
    component = fixture.componentInstance;
  });

  it('shows creation feedback and clears query params on init', () => {
    component.ngOnInit();

    expect(component.showSuccessToast).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.any(Object),
      queryParams: {},
      replaceUrl: true,
    });
  });

  it('filters client cards by typology pill', () => {
    component.onFilter('Tipo cliente 2');

    expect(component.filteredClientItems).toHaveLength(2);
    expect(
      component.filteredClientItems.every(
        (item) => item.statusVariant === 'cliente-tipo-green',
      ),
    ).toBe(true);
  });

  it('paginates client items correctly', () => {
    component.currentPage = 1;
    fixture.detectChanges();
    expect(component.paginatedItems).toHaveLength(7); // All 7 items fit in page 1 (pageSize=10)

    // Test with filter
    component.onFilter('Tipo cliente 2');
    fixture.detectChanges();
    expect(component.paginatedItems).toHaveLength(2); // 2 items filtered, fit in page 1
  });

  it('navigates to create and detail routes from list actions', () => {
    component.onAdd();
    component.openDetail(component.clientItems[0]);

    expect(router.navigate).toHaveBeenNthCalledWith(1, ['/clients/new']);
    expect(router.navigate).toHaveBeenNthCalledWith(2, ['/clients', '1']);
  });
});
