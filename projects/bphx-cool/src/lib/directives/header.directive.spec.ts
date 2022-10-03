import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { HeaderDirective } from "./header.directive";

@Component(
{
  template: `<div coolHeader>`
})
class TestComponent
{
}

describe("HeaderDirective", () =>
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
          HeaderDirective
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

  it("should be created and initialized", async () =>
  {
    const header = fixture.debugElement.
      query(By.directive(HeaderDirective)).
      injector.get(HeaderDirective);

    await expect(header).toBeTruthy();
    await expect(header.element.nativeElement).toBeTruthy();
  });
});
