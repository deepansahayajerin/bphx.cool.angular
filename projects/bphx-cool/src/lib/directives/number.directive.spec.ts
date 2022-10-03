import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NumberDirective } from "./number.directive";

@Component(
{
  template: "<input coolNumber='###,###.##;-#' type='text' [(ngModel)]='value'>"
})
class TestComponent
{
  @Input()
  value: number;
}

describe("NumberDirective", () =>
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
          NumberDirective
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

  it("should parse and format model value", async () =>
  {
    const element = fixture.debugElement.query(By.directive(NumberDirective));
    //const numberDirective = element.injector.get(NumberDirective);
    const input = element.nativeElement as HTMLInputElement;

    input.value = "3.245";
    input.dispatchEvent(newEvent("input"));
    fixture.detectChanges();

    await expect(component.value).toBe(3.24);

    component.value = 123456.78;
    fixture.detectChanges();

    await fixture.whenStable();
    await expect(input.value).toBe("123,456.78");

    const prevValue = input.value;
    const prevModel = component.value;

    input.value = "21f";
    input.dispatchEvent(newEvent("input"));
    fixture.detectChanges();

    await expect(component.value).toBe(prevModel);
    await expect(input.value).toBe(prevValue);

    component.value = 3.141592654;
    fixture.detectChanges();

    await fixture.whenStable();
    await expect(input.value).toBe("3.14");
    await expect(component.value).toBe(3.14);
  });
});

function newEvent(eventName: string, bubbles = false, cancelable = false)
{
  return new CustomEvent(eventName, { bubbles, cancelable });
}
