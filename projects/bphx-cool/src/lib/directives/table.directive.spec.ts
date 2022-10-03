import { BodyDirective } from "./body.directive";
import { HeaderDirective } from "./header.directive";
import { By } from "@angular/platform-browser";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { TableDirective } from "./table.directive";

@Component(
{
  template:
    `
    <div coolTable coolHorizontalScroll style="display: block; width: 300px;">
      <div coolHeader style="overflow: hidden">
        <div style="display: block; width: 500px;">head</div>
      </div>
      <div coolBody style="overflow: auto">
        <div style="display: block; width: 500px;">body</div>
      </div>
    </div>
    `
})
class TestComponent
{
}

describe("TableDirective", () =>
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
          HeaderDirective,
          BodyDirective,
          TableDirective
        ]
      }).
      compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should sync scroll position of header with body", async () =>
  {
    const header = fixture.debugElement.
      query(By.directive(HeaderDirective)).nativeElement as HTMLElement;
    const body = fixture.debugElement.
      query(By.directive(BodyDirective)).nativeElement as HTMLElement;

    body.scrollLeft = 10;

    const offset = body.scrollLeft;

    body.dispatchEvent(newEvent("scroll"));

    expect(Math.abs(header.scrollLeft - offset)).toBeLessThan(1);
  });
});


function newEvent(eventName: string, bubbles = false, cancelable = false)
{
  return new CustomEvent(eventName, { bubbles, cancelable });
}

