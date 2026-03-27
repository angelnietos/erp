import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdentityFeature } from './identity-feature';

describe('IdentityFeature', () => {
  let component: IdentityFeature;
  let fixture: ComponentFixture<IdentityFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(IdentityFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
