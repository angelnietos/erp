import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentGeneratorDataAccess } from './document-generator-data-access';

describe('DocumentGeneratorDataAccess', () => {
  let component: DocumentGeneratorDataAccess;
  let fixture: ComponentFixture<DocumentGeneratorDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentGeneratorDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentGeneratorDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
