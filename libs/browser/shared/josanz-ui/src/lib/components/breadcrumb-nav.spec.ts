import { TestBed } from "@angular/core/testing";
import { BreadcrumbNavComponent } from "./breadcrumb-nav";

describe("BreadcrumbNavComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbNavComponent],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(BreadcrumbNavComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(BreadcrumbNavComponent);
    const component = fixture.componentInstance;
    expect(component.items.length).toBe(0);
    expect(component.separator).toBe("/");
    expect(component.ariaLabel).toBe("");
  });

  it("should accept custom ariaLabel", () => {
    const fixture = TestBed.createComponent(BreadcrumbNavComponent);
    const component = fixture.componentInstance;
    component.ariaLabel = "Custom breadcrumb label";
    expect(component.ariaLabel).toBe("Custom breadcrumb label");
  });

  it("should accept custom separator", () => {
    const fixture = TestBed.createComponent(BreadcrumbNavComponent);
    const component = fixture.componentInstance;
    component.separator = ">";
    expect(component.separator).toBe(">");
  });
});
