import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DefaultValueDirective } from "./default-value.directive";

@Component(
{
  template: `
    <input type="radio" name="field" [(ngModel)]="value" value="default value"
      coolDefaultValue>`
})
class TestComponent
{
  @Input() value = "value";
}

describe("DefaultValueDirective", () =>
{
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        imports: [ FormsModule ],
        declarations:
        [
          TestComponent,
          DefaultValueDirective
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

  it("should assing default value, if required", async () =>
  {
    const element = fixture.debugElement.
      query(By.directive(DefaultValueDirective));
    const defaultValue = element.injector.get(DefaultValueDirective);
    const input = element.nativeElement as HTMLInputElement;

    await expect(defaultValue.coolDefaultValue).toBeDefined();
    await expect(input.checked).toBe(false);

    input.value = "";
    input.dispatchEvent(newEvent("change"));
    fixture.detectChanges();

    await fixture.whenStable();
    await expect(component.value).toBe("default value");
  });
});

function newEvent(eventName: string, bubbles = false, cancelable = false)
{
  return new CustomEvent(eventName, { bubbles, cancelable });
}
