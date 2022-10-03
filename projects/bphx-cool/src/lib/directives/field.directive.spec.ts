import { By } from "@angular/platform-browser";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ViewDirective } from "./view.directive";
import { ProcedureType } from "../api/client/procedure-type";
import { Dialog, DIALOG_ACCESSOR } from "../api/dialog/dialog";
import { Procedure } from "../api/client/procedure";
import { Window } from "../api/client/window";
import { FieldDirective } from "./field.directive";
import { Renderer, RENDERER_ACCESSOR } from "../api/renderer";
import { NestedModelAccessorDirective } from "./nested-model-accessor.directive";
import { DefaultModelAccessorDirective } from "./default-model-accessor.directive";
import { View } from "../api/dialog/view";

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window">
      <input coolType="SNGLNFLD" type="text" [(ngModel)]="value" name="field">
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
  @Input() value: string;

  renderer: Renderer =
    jasmine.createSpyObj("renderer", ["render", "getVideo", "setVideo"]);
  dialog: Dialog = { views: new Map<Element, View>() } as Dialog;
  procedure: Procedure = { type: ProcedureType.Window, id: 2, name: "procedure" };
  window: Window = { procedure: this.procedure, name: "window", controls: {} };
}

describe("FieldDirective", () =>
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
          DefaultModelAccessorDirective,
          NestedModelAccessorDirective,
          ViewDirective,
          FieldDirective
        ]
      }).
      compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create an instance and setup properties", async () =>
  {
    const fieldElement = fixture.debugElement.
      query(By.directive(FieldDirective));
    const field = fieldElement.injector.get(FieldDirective);
    const element = fieldElement.nativeElement as HTMLElement;

    await expect(field).toBeTruthy();

    await fixture.whenStable();

    await expect(element.getAttribute("coolName")).toBe("field");
  });
});

