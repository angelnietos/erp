import { TestBed } from "@angular/core/testing";
import { StatCardComponent } from "./stat-card";
import { JosanzThemeService } from "../services/theme.service";

describe("StatCardComponent", () => {
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
      imports: [StatCardComponent],
      providers: [{ provide: JosanzThemeService, useValue: mockTheme }],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    const component = fixture.componentInstance;
    expect(component.title).toBe("Indicador");
    expect(component.value).toBe("0");
    expect(component.trendDirection).toBe("flat");
    expect(component.tone).toBe("primary");
  });

  it("should generate correct corner class for square shape", () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    const component = fixture.componentInstance;
    component.shape = "square";
    expect(component.cornerClass()).toBe("rounded-none");
  });

  it("should generate correct trend prefix for up direction", () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    const component = fixture.componentInstance;
    component.trendDirection = "up";
    expect(component.trendPrefix()).toBe("+");
  });

  it("should generate correct trend prefix for down direction", () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    const component = fixture.componentInstance;
    component.trendDirection = "down";
    expect(component.trendPrefix()).toBe("-");
  });
});
