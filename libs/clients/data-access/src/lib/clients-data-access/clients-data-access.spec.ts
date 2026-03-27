import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsDataAccess } from './clients-data-access';

describe('ClientsDataAccess', () => {
  let component: ClientsDataAccess;
  let fixture: ComponentFixture<ClientsDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
