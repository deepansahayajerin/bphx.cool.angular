import { By } from "@angular/platform-browser";
import { TestBed } from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
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
import { OpenEventDirective } from "./open-event.directive";
import { RequestType } from "../api/client/request-type";
import { View } from "../api/dialog/view";

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window">
      <div coolType coolOpen="MyWindow">area</div>
    </form>`,
  providers:
  [
    {
      provide: DIALOG_ACCESSOR,
      useFactory: (c: TestComponent) => c.dialog,
      deps: [TestComponent]
    },
    {
      provide: RENDERER_ACCESSOR,
      useFactory: (c: TestComponent) => c.renderer,
      deps: [TestComponent]
    }
  ]
})
class TestComponent
{
  renderer: Renderer =
    jasmine.createSpyObj("renderer", ["render", "getVideo", "setVideo"]);

  dialog: Dialog = { views: new Map<Element, View>() } as Dialog;

  procedure: Procedure = { type: ProcedureType.Window, id: 2, name: "procedure" };
  window: Window = { procedure: this.procedure, name: "window", controls: {} };

  params: EventParams;

  @ViewChild(OpenEventDirective, { static: true })
  directive: OpenEventDirective;
}

describe("OpenEventDirective", () =>
{
  it("should trigger open event", async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        declarations:
        [
          TestComponent,
          DefaultModelAccessorDirective,
          NestedModelAccessorDirective,
          ViewDirective,
          FieldDirective,
          OpenEventDirective
        ]
      }).
      compileComponents();

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.directive.trigger = params =>
    {
      component.params = params;

      return true;
    };

    const debugElement = fixture.debugElement.
      query(By.directive(OpenEventDirective));
    const element = debugElement.nativeElement as HTMLElement;

    element.click();

    await expect(component.params).toBeTruthy();
    await expect(component.params.action).toBe(RequestType.Event);
    await expect(component.params.type).toBe("Open");
    await expect(component.params.targetWindow).toBe("MyWindow");
  });
});
