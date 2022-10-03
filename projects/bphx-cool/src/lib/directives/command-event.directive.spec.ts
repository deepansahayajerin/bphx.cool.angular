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
import { RequestType } from "../api/client/request-type";
import { CommandEventDirective } from "./command-event.directive";
import { CloseEventDirective } from "./close-event.directive";
import { View } from "../api/dialog/view";

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window">
      <div coolType coolCommand="MyCommand">area</div>
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

  params: EventParams[] = [];

  @ViewChild(CommandEventDirective, { static: true })
  directive: CommandEventDirective;
}

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window">
      <div coolType coolCommand="command" coolClose>area</div>
    </form>`,
  providers:
  [
    {
      provide: DIALOG_ACCESSOR,
      useFactory: (c: Test2Component) => c.dialog,
      deps: [Test2Component]
    },
    {
      provide: RENDERER_ACCESSOR,
      useFactory: (c: Test2Component) => c.renderer,
      deps: [Test2Component]
    }
  ]
})
class Test2Component
{
  renderer: Renderer =
    jasmine.createSpyObj("renderer", ["render", "getVideo", "setVideo"]);
  dialog: Dialog = { views: new Map<Element, View>() } as Dialog;
  procedure: Procedure = { type: ProcedureType.Window, id: 2, name: "procedure" };
  window: Window = { procedure: this.procedure, name: "window", controls: {} };

  params: EventParams[] = [];

  @ViewChild(CommandEventDirective, { static: true })
  directive: CommandEventDirective;

  @ViewChild(CloseEventDirective, { static: true })
  closeDirective: CloseEventDirective;
}

describe("CommandEventDirective", () =>
{
  it("should trigger command event", async () =>
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
          CommandEventDirective
        ]
      }).
      compileComponents();

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.directive.trigger = params =>
    {
      component.params.push(params);

      return true;
    };

    const debugElement = fixture.debugElement.
      query(By.directive(CommandEventDirective));
    const element = debugElement.nativeElement as HTMLElement;

    element.click();

    await expect(component.params.length).toBe(1);
    await expect(component.params[0].action).toBe(RequestType.Command);
    await expect(component.params[0].command).toBe("MyCommand");
  });

  it("should trigger command and close events", async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        declarations:
        [
          Test2Component,
          DefaultModelAccessorDirective,
          NestedModelAccessorDirective,
          ViewDirective,
          FieldDirective,
          CommandEventDirective,
          CloseEventDirective
        ]
      }).
      compileComponents();

    const fixture = TestBed.createComponent(Test2Component);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.directive.trigger = params =>
    {
      component.params.push(params);

      return true;
    };

    component.closeDirective.trigger = params =>
    {
      component.params.push(params);

      return true;
    };

    const debugElement = fixture.debugElement.
      query(By.directive(CommandEventDirective));
    const element = debugElement.nativeElement as HTMLElement;

    element.click();

    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => window.setTimeout(resolve, 1000));

    await expect(component.params.length).toBe(2);
    await expect(component.params[0].action).toBe(RequestType.Command);
    await expect(component.params[0].command).toBe("command");
    await expect(component.params[1].action).toBe(RequestType.Event);
    await expect(component.params[1].type).toBe("Close");
    await expect(component.params[1].targetWindow).toBe("window");
  }, 1000000);
});
