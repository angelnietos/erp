import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsFeature } from './clients-feature';

describe('ClientsFeature', () => {
  let component: ClientsFeature;
  let fixture: ComponentFixture<ClientsFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
