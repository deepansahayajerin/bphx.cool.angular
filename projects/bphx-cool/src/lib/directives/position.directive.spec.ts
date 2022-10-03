import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { PositionDirective } from "./position.directive";

@Component(
{
  template: `<div coolWidth="50em" coolHeight="30em"></div>`
})
class TestComponent
{
}

describe("PositionDirective", () =>
{
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        declarations:
        [
          TestComponent,
          PositionDirective
        ]
      }).
      compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should set styles", async () =>
  {
    const element = fixture.debugElement.
      query(By.directive(PositionDirective)).nativeElement as HTMLElement;

    await fixture.whenStable();

    await expect(element.style.width).toBe("50em");
    await expect(element.style.height).toBe("30em");
  });
});
