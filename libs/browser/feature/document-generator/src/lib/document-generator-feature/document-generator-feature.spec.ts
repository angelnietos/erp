import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentGeneratorFeature } from './document-generator-feature';

describe('DocumentGeneratorFeature', () => {
  let component: DocumentGeneratorFeature;
  let fixture: ComponentFixture<DocumentGeneratorFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentGeneratorFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentGeneratorFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
