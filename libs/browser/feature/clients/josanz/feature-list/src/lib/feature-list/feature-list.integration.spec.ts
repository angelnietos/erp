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
    expect(component.showSuccessModal).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.any(Object),
      queryParams: {},
      replaceUrl: true,
    });
  });

  it('filters client cards by typology pill', () => {
    component.onFilter('Tipo cliente 2');

    expect(component.filteredClientItems).toHaveLength(1);
    expect(component.filteredClientItems[0]?.statusVariant).toBe('cliente-tipo-green');
  });

  it('navigates to create and detail routes from list actions', () => {
    component.onAdd();
    component.openDetail(component.clientItems[0]);

    expect(router.navigate).toHaveBeenNthCalledWith(1, ['/clients/new']);
    expect(router.navigate).toHaveBeenNthCalledWith(2, ['/clients', '1']);
  });
});
