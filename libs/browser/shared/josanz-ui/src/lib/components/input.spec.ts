import { TestBed } from "@angular/core/testing";
import { InputComponent } from "./input";

describe("InputComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(InputComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(InputComponent);
    const component = fixture.componentInstance;
    expect(component.label).toBe("");
    expect(component.placeholder).toBe("");
    expect(component.type).toBe("text");
    expect(component.controlName).toBe("");
  });
});
