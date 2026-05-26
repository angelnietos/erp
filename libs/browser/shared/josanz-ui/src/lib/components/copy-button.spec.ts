import { TestBed } from "@angular/core/testing";
import { CopyButtonComponent } from "./copy-button";

describe("CopyButtonComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyButtonComponent],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(CopyButtonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(CopyButtonComponent);
    const component = fixture.componentInstance;
    expect(component.text).toBe("");
    expect(component.label).toBe("Copiar");
    expect(component.copiedLabel).toBe("Copiado");
    expect(component.copied).toBe(false);
  });

  it("should have copiedText output", () => {
    const fixture = TestBed.createComponent(CopyButtonComponent);
    const component = fixture.componentInstance;
    expect(component.copiedText).toBeDefined();
  });
});
