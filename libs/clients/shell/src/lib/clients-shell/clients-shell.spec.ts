import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsShell } from './clients-shell';

describe('ClientsShell', () => {
  let component: ClientsShell;
  let fixture: ComponentFixture<ClientsShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsShell],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
