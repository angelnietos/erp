import { TestBed } from "@angular/core/testing";
import { ProgressBarComponent } from "./progress-bar";

describe("ProgressBarComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default values", () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    const component = fixture.componentInstance;
    expect(component.value).toBe(40);
    expect(component.max).toBe(100);
    expect(component.showValue).toBe(true);
  });

  it("should calculate percentage correctly", () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    const component = fixture.componentInstance;
    component.value = 50;
    component.max = 100;
    expect(component.percentage()).toBe(50);
  });

  it("should clamp safeValue between min and max", () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    const component = fixture.componentInstance;
    component.value = -10;
    expect(component.safeValue()).toBe(0);
    component.value = 150;
    expect(component.safeValue()).toBe(100);
  });

  it("should return correct corner class for square shape", () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    const component = fixture.componentInstance;
    component.shape = "square";
    expect(component.cornerClass()).toBe("rounded-none");
  });
});
