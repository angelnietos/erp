import { TestBed } from "@angular/core/testing";
import { BadgeComponent } from "./badge";
import { JosanzThemeService } from "../services/theme.service";

describe("BadgeComponent", () => {
  const mockTheme = {
    currentTheme: () => ({
      defaultShape: "rounded",
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    expect(component.label).toBe("Badge");
    expect(component.tone).toBe("primary");
    expect(component.variant).toBe("soft");
    expect(component.size).toBe("md");
  });

  it("should return correct accent color for success tone", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    component.tone = "success";
    expect(component.accentColor()).toBe("var(--josanz-success)");
  });

  it("should return correct accent color for warning tone", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    component.tone = "warning";
    expect(component.accentColor()).toBe("var(--josanz-warning)");
  });

  it("should return correct accent color for danger tone", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    component.tone = "danger";
    expect(component.accentColor()).toBe("var(--josanz-danger)");
  });

  it("should return custom color when provided", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    component.customColor = "#ff0000";
    expect(component.accentColor()).toBe("#ff0000");
  });

  it("should generate correct size class for sm", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    component.size = "sm";
    expect(component.badgeClasses()).toContain("px-2 py-0.5 text-[9px]");
  });

  it("should generate correct size class for lg", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    component.size = "lg";
    expect(component.badgeClasses()).toContain("px-3.5 py-1.5 text-xs");
  });

  it("should generate square shape class when shape is square", () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    const component = fixture.componentInstance;
    component.shape = "square";
    expect(component.badgeClasses()).toContain("rounded-none");
  });
});
