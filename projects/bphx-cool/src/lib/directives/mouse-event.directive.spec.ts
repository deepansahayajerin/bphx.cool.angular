import { View } from "../api/dialog/view";
import { By } from "@angular/platform-browser";
import { TestBed } from "@angular/core/testing";
import { Component, ViewChild, Directive } from "@angular/core";
import { MouseEventDirective } from "./mouse-event.directive";
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

@Directive()
class TestBase
{
  renderer: Renderer =
    jasmine.createSpyObj("renderer", ["render", "getVideo", "setVideo"]);
  dialog: Dialog = { views: new Map<Element, View>() } as Dialog;
  procedure: Procedure = { type: ProcedureType.Window, id: 2, name: "procedure" };
  window: Window = { procedure: this.procedure, name: "window", controls: {} };

  params: EventParams;

  @ViewChild(MouseEventDirective, { static: true })
  directive: MouseEventDirective;
}

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window">
      <div coolType (coolLeftMouseBtnDown)="true">area</div>
    </form>`,
  providers:
  [
    {
      provide: DIALOG_ACCESSOR,
      useFactory: (c: TestMouseEventComponent) => c.dialog,
      deps: [TestMouseEventComponent]
    },
    {
      provide: RENDERER_ACCESSOR,
      useFactory: (c: TestMouseEventComponent) => c.renderer,
      deps: [TestMouseEventComponent]
    }
  ]
})
class TestMouseEventComponent extends TestBase
{
}

describe("MouseDownEventDirective", () =>
{
  it("should trigger mousedowwn", async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        declarations:
        [
          TestMouseEventComponent,
          DefaultModelAccessorDirective,
          NestedModelAccessorDirective,
          ViewDirective,
          FieldDirective,
          MouseEventDirective
        ]
      }).
      compileComponents();

    const fixture = TestBed.createComponent(TestMouseEventComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.directive.trigger = params =>
    {
      component.params = params;

      return true;
    };

    const debugElement = fixture.debugElement.
      query(By.directive(MouseEventDirective));
    const element = debugElement.nativeElement as HTMLElement;

    const event = new MouseEvent(
      "mousedown",
      { bubbles: true, cancelable: true, button: 0 });

    element.dispatchEvent(event);

    await expect(component.params).toBeTruthy();
    await expect(component.params.action).toBe(RequestType.Event);
    await expect(component.params.type).toBe("LeftMouseBtnDown");
  });
});
