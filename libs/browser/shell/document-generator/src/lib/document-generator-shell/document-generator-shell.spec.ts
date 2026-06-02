import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentGeneratorShell } from './document-generator-shell';

describe('DocumentGeneratorShell', () => {
  let component: DocumentGeneratorShell;
  let fixture: ComponentFixture<DocumentGeneratorShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentGeneratorShell],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentGeneratorShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
