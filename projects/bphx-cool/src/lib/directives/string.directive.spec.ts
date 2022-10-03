import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { StringDirective } from "./string.directive";

@Component(
{
  template: "<input coolString='XXXX-XXXX-XXXX-XXXX' type='text' [(ngModel)]='value'>"
})
class TestComponent
{
  @Input()
  value: string;
}

describe("StringDirective", () =>
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
          StringDirective
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
    const element = fixture.debugElement.query(By.directive(StringDirective));
    //const stringDirective = element.injector.get(StringDirective);
    const input = element.nativeElement as HTMLInputElement;

    input.value = "1234-5678-9012-3456";
    input.dispatchEvent(newEvent("input"));
    fixture.detectChanges();

    await expect(component.value).toBe("1234567890123456");
  });
});

@Component(
  {
    template: "<input coolUpper type='text' [(ngModel)]='value'>"
  })
  class TestComponent2
  {
    @Input()
    value: string;
  }

  describe("StringDirective@upper", () =>
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
            StringDirective
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

    it("should parse and format model value", async () =>
    {
      const element = fixture.debugElement.query(By.directive(StringDirective));
      const input = element.nativeElement as HTMLInputElement;

      component.value = "qwerty";
      fixture.detectChanges();

      await fixture.whenStable();
      await expect(input.value).toBe("QWERTY");
      await expect(component.value).toBe("QWERTY");
    });
  });

  function newEvent(eventName: string, bubbles = false, cancelable = false)
{
  return new CustomEvent(eventName, { bubbles, cancelable });
}
