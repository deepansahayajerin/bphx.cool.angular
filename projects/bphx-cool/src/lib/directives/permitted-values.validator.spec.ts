import { Component, Input, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, NgModel } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { PermittedValuesValidator } from "./permitted-values.validator";

@Component(
{
  template: `
    <input type="text" name="field" [(ngModel)]="value" #model="ngModel"
      [coolPermittedValues]="['1', '2', '3']">`
})
class TestComponent
{
  @Input() value: string;
  @ViewChild("model") model: NgModel;
}

describe("PermittedValuesValidator", () =>
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
          PermittedValuesValidator
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

  it("Empty value should be valid", async () =>
  {
    const element = fixture.debugElement.
      query(By.directive(PermittedValuesValidator));
    const permittedValues = element.injector.get(PermittedValuesValidator);
    const input = element.nativeElement as HTMLInputElement;

    await expect(permittedValues.coolPermittedValues).toBeDefined();

    input.value = "";
    input.dispatchEvent(newEvent("input"));
    fixture.detectChanges();

    await fixture.whenStable();
    await expect(component.model.valid).toBe(true);
  });

  it("Permitted value should be accepted", async () =>
  {
    const element = fixture.debugElement.
      query(By.directive(PermittedValuesValidator));
    const permittedValues = element.injector.get(PermittedValuesValidator);
    const input = element.nativeElement as HTMLInputElement;

    await expect(permittedValues.coolPermittedValues).toBeDefined();

    input.value = "2";
    input.dispatchEvent(newEvent("input"));
    fixture.detectChanges();

    await fixture.whenStable();
    await expect(component.model.valid).toBe(true);
  });

  it("Not permitted value should not be accepted", async () =>
  {
    const element = fixture.debugElement.
      query(By.directive(PermittedValuesValidator));
    const permittedValues = element.injector.get(PermittedValuesValidator);
    const input = element.nativeElement as HTMLInputElement;

    await expect(permittedValues.coolPermittedValues).toBeDefined();

    input.value = "-1";
    input.dispatchEvent(newEvent("input"));
    fixture.detectChanges();

    await fixture.whenStable();
    await expect(component.model.valid).toBe(false);
  });
});

function newEvent(eventName: string, bubbles = false, cancelable = false)
{
  return new CustomEvent(eventName, { bubbles, cancelable });
}
