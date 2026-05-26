import { TestBed } from "@angular/core/testing";
import { SpinnerComponent } from "./spinner";

describe("SpinnerComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    const component = fixture.componentInstance;
    expect(component.label).toBe("");
    expect(component.size).toBe("md");
    expect(component.srText).toBe("Cargando");
  });

  it("should return correct color when customColor is set", () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    const component = fixture.componentInstance;
    component.customColor = "#ff0000";
    expect(component.accentColor).toBe("#ff0000");
  });

  it("should return default primary color when no customColor", () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    const component = fixture.componentInstance;
    expect(component.accentColor).toBe("var(--josanz-primary)");
  });

  it("should return sm size class for sm", () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    const component = fixture.componentInstance;
    component.size = "sm";
    expect(component.sizeClass()).toBe("h-4 w-4");
  });

  it("should return lg size class for lg", () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    const component = fixture.componentInstance;
    component.size = "lg";
    expect(component.sizeClass()).toBe("h-9 w-9");
  });
});
