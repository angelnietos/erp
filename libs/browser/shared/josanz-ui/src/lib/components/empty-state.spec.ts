import { TestBed } from "@angular/core/testing";
import { EmptyStateComponent } from "./empty-state";
import { JosanzThemeService } from "../services/theme.service";

describe("EmptyStateComponent", () => {
  const mockTheme = {
    currentTheme: () => ({
      defaultShape: "rounded",
      atmosphere: {
        surface: "#fff",
        border: "#ddd",
        shadow: "0 1px 2px rgba(0,0,0,0.1)",
      },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    const component = fixture.componentInstance;
    expect(component.title).toBe("Sin resultados");
    expect(component.icon).toBe("inbox");
    expect(component.showPrimaryIcon).toBe(true);
    expect(component.primaryLabel).toBe("");
    expect(component.secondaryLabel).toBe("");
  });

  it("should generate correct corner class for square shape", () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    const component = fixture.componentInstance;
    component.shape = "square";
    expect(component.cornerClass()).toBe("rounded-none");
  });

  it("should generate correct corner class for pill shape", () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    const component = fixture.componentInstance;
    component.shape = "pill";
    expect(component.cornerClass()).toBe("rounded-[36px]");
  });
});
