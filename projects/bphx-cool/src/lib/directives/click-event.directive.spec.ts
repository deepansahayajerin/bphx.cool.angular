import { By } from "@angular/platform-browser";
import { TestBed } from "@angular/core/testing";
import { Component, ViewChild, Directive } from "@angular/core";
import { ClickEventDirective } from "./click-event.directive";
import { EventParams } from "../api/event-params";
import { DIALOG_ACCESSOR, Dialog } from "../api/dialog/dialog";
import { Renderer, RENDERER_ACCESSOR } from "../api/renderer";
import { Window } from "../api/client/window";
import { Procedure } from "../api/client/procedure";
import { ProcedureType } from "../api/client/procedure-type";
import { DefaultModelAccessorDirective } from "./default-model-accessor.directive";
import { NestedModelAccessorDirective } from "./nested-model-accessor.directive";
import { ViewDirective } from "./view.directive";
import { FieldDirective } from "./field.directive";
import { RequestType } from "../api/client/request-type";
import { View } from "../api/dialog/view";

@Directive()
class TestBase
{
  renderer: Renderer =
    jasmine.createSpyObj("renderer", ["render", "getVideo", "setVideo"]);
  dialog: Dialog = { views: new Map<Element, View>() } as Dialog;
  procedure: Procedure = { type: ProcedureType.Window, id: 2, name: "procedure" };
  window: Window = { procedure: this.procedure, name: "window", controls: {} };

  params: EventParams;

  @ViewChild(ClickEventDirective, { static: true })
  directive: ClickEventDirective;
}

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window">
      <div coolType (coolClick)="true">area</div>
    </form>`,
  providers:
  [
    {
      provide: DIALOG_ACCESSOR,
      useFactory: (c: TestClickComponent) => c.dialog,
      deps: [TestClickComponent]
    },
    {
      provide: RENDERER_ACCESSOR,
      useFactory: (c: TestClickComponent) => c.renderer,
      deps: [TestClickComponent]
    }
  ]
})
class TestClickComponent extends TestBase
{
}

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window">
      <div coolType (coolDoubleClick)="cancelled && $event.event.preventDefault();">area</div>
    </form>`,
  providers:
  [
    {
      provide: DIALOG_ACCESSOR,
      useFactory: (c: TestDoubleClickComponent) => c.dialog,
      deps: [TestDoubleClickComponent]
    },
    {
      provide: RENDERER_ACCESSOR,
      useFactory: (c: TestDoubleClickComponent) => c.renderer,
      deps: [TestDoubleClickComponent]
    }
  ]
})
class TestDoubleClickComponent extends TestBase
{
  cancelled: boolean;
}

describe("ClickEventDirective", () =>
{
  it("should trigger click", async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        declarations:
        [
          TestClickComponent,
          DefaultModelAccessorDirective,
          NestedModelAccessorDirective,
          ViewDirective,
          FieldDirective,
          ClickEventDirective
        ]
      }).
      compileComponents();

    const fixture = TestBed.createComponent(TestClickComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.directive.trigger = params =>
    {
      component.params = params;

      return true;
    };

    const debugElement = fixture.debugElement.
      query(By.directive(ClickEventDirective));
    const element = debugElement.nativeElement as HTMLElement;

    element.click();

    await expect(component.params).toBeTruthy();
    await expect(component.params.action).toBe(RequestType.Event);
    await expect(component.params.type).toBe("Click");
  });

  it("should trigger double click", async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        declarations:
        [
          TestDoubleClickComponent,
          DefaultModelAccessorDirective,
          NestedModelAccessorDirective,
          ViewDirective,
          FieldDirective,
          ClickEventDirective
        ]
      }).
      compileComponents();

    const fixture = TestBed.createComponent(TestDoubleClickComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.directive.trigger = params =>
    {
      component.params = params;

      return true;
    };

    const debugElement = fixture.debugElement.
      query(By.directive(ClickEventDirective));
    const element = debugElement.nativeElement as HTMLElement;

    let event =
      new MouseEvent("dblclick", { bubbles: true, cancelable: true });

    element.dispatchEvent(event);

    await expect(component.params).toBeTruthy();
    await expect(component.params.action).toBe(RequestType.Event);
    await expect(component.params.type).toBe("DoubleClick");

    component.cancelled = true;
    component.params = null;

    event = new MouseEvent("dblclick", { bubbles: true, cancelable: true });

    element.dispatchEvent(event);

    await expect(component.params).toBeTruthy();
    await expect(component.params.handler).toBeTruthy();

    component.params.handler.emit(component.params);

    await expect(component.params.event.defaultPrevented).toBeTruthy();
  });
});
