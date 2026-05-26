import { TestBed } from "@angular/core/testing";
import { TagComponent } from "./tag";

describe("TagComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagComponent],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(TagComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(TagComponent);
    const component = fixture.componentInstance;
    expect(component.label).toBe("Etiqueta");
    expect(component.tone).toBe("neutral");
    expect(component.removable).toBe(false);
  });

  it("should return correct color for success tone", () => {
    const fixture = TestBed.createComponent(TagComponent);
    const component = fixture.componentInstance;
    component.tone = "success";
    expect(component.tagStyles().color).toBe("var(--josanz-success)");
  });

  it("should return correct color for danger tone", () => {
    const fixture = TestBed.createComponent(TagComponent);
    const component = fixture.componentInstance;
    component.tone = "danger";
    expect(component.tagStyles().color).toBe("var(--josanz-danger)");
  });

  it("should return custom color when provided", () => {
    const fixture = TestBed.createComponent(TagComponent);
    const component = fixture.componentInstance;
    component.customColor = "#ff0000";
    expect(component.tagStyles().color).toBe("#ff0000");
  });

  it("should have remove output", () => {
    const fixture = TestBed.createComponent(TagComponent);
    const component = fixture.componentInstance;
    expect(component.remove).toBeDefined();
    expect(component.remove.observers.length).toBe(0);
  });
});
