import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DateDirective } from "./date.directive";

@Component(
{
  template: "<input coolDate=\"dd/MM/yyyy\" type=\"text\" [(ngModel)]=\"value\">"
})
class TestComponent
{
  @Input()
  value: string;
}

describe("DateDirective", () =>
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
          DateDirective
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
    const element = fixture.debugElement.query(By.directive(DateDirective));
    const dateDirective = element.injector.get(DateDirective);
    const input = element.nativeElement as HTMLInputElement;

    input.value = "14/07/2019";
    input.dispatchEvent(newEvent("input"));
    fixture.detectChanges();

    await expect(component.value).toBe("2019-07-14");

    component.value = "2019-07-15";
    fixture.detectChanges();

    await fixture.whenStable();
    await expect(input.value).toBe("15/07/2019");

    input.value = "34/07/2019";
    input.dispatchEvent(newEvent("input"));
    fixture.detectChanges();

    await expect(component.value).not.toBeDefined();
    await expect(dateDirective.model.invalid).toBeTruthy();
  });
});

@Component(
  {
    template: "<input coolTime='HH:mm' type='text' [(ngModel)]='value'>"
  })
  class TestComponent2
  {
    @Input()
    value: string;
  }

  describe("TimeDirective", () =>
  {
    let component: TestComponent2;
    let fixture: ComponentFixture<TestComponent2>;

    beforeEach(async () =>
    {
      await TestBed.
        configureTestingModule(
        {
          imports: [ FormsModule ],
          declarations:
          [
            TestComponent2,
            DateDirective
          ]
        }).
        compileComponents();
    });

    beforeEach(() =>
    {
      fixture = TestBed.createComponent(TestComponent2);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it("should implicitly update model value per format", async () =>
    {
      const element = fixture.debugElement.query(By.directive(DateDirective));
      const input = element.nativeElement as HTMLInputElement;

      component.value = "12:34:56";
      fixture.detectChanges();

      await fixture.whenStable();
      await expect(input.value).toBe("12:34");
      await expect(component.value).toBe("12:34:00");

      component.value = "17:45";
      fixture.detectChanges();

      await fixture.whenStable();
      await expect(input.value).toBe("17:45");
      await expect(component.value).toBe("17:45:00");
    });
  });

  function newEvent(eventName: string, bubbles = false, cancelable = false)
{
  return new CustomEvent(eventName, { bubbles, cancelable });
}
