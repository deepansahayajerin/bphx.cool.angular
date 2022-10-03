import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { TabScopeDirective } from "./tab-scope.directive";

@Component(
{
  template: `
    <input type="text" name="field1" value="1" tabindex="1">
    <div coolTabScope>
      <input type="text" name="field2" value="2" tabindex="2">
      <input type="text" name="field3" value="3" tabindex="3">
      <input type="text" name="field4" value="4" tabindex="4">
    </div>
    `
})
class TestComponent
{
}

describe("TabScopeDirective", () =>
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
          TabScopeDirective
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

  it("tab should change focus within tab scope", async () =>
  {
    const field2 = fixture.debugElement.
      query(By.css("[name=field2]")).nativeElement as HTMLElement;
    const field3 = fixture.debugElement.
      query(By.css("[name=field3]")).nativeElement as HTMLElement;
    const field4 = fixture.debugElement.
      query(By.css("[name=field4]")).nativeElement as HTMLElement;

    field2.focus();
    await expect(document.activeElement === field2).
      toBeTruthy("field2 is focused");

    tab(field2);
    await expect(document.activeElement === field3).
      toBeTruthy("field2 -> field3 is focused");

    tab(field3);
    await expect(document.activeElement === field4).
      toBeTruthy("field3 -> field4 is focused");

    tab(field4);
    await expect(document.activeElement === field2).
      toBeTruthy("field4 -> field2 is focused");

    tab(field2, true);
    await expect(document.activeElement === field4).
      toBeTruthy("field2 -> field4 is focused");
  });
});

function tab(element: HTMLElement, shift?: boolean)
{
  const event = new KeyboardEvent(
    "keydown",
    {
      bubbles : true,
      cancelable : true,
      key : "Tab",
      shiftKey : !!shift
    });

  element.dispatchEvent(event);
}
