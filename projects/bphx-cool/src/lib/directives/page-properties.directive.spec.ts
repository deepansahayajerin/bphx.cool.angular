import { By } from "@angular/platform-browser";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ViewDirective } from "./view.directive";
import { FieldDirective } from "./field.directive";
import { NestedModelAccessorDirective } from "./nested-model-accessor.directive";
import { DefaultModelAccessorDirective } from "./default-model-accessor.directive";
import { PagePropertiesDirective } from "./page-properties.directive";
import { Renderer, RENDERER_ACCESSOR } from "../api/renderer";
import { View } from "../api/dialog/view";
import { ProcedureType } from "../api/client/procedure-type";
import { Dialog, DIALOG_ACCESSOR } from "../api/dialog/dialog";
import { Procedure } from "../api/client/procedure";
import { Window } from "../api/client/window";

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window"
      coolPageSize="10" coolScrollSize="50">
      <input coolType="SNGLNFLD" type="text" [(ngModel)]="value" name="field" #field="field">
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

describe("PagePropertiesDirective", () =>
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
          FieldDirective,
          PagePropertiesDirective
        ]
      }).
      compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create an instance and setup properties", async () =>
  {
    const properties = fixture.debugElement.
      query(By.directive(PagePropertiesDirective)).
      injector.get(PagePropertiesDirective);

    await expect(properties).toBeTruthy();
    await expect(component.procedure.pageSize).toBe(10);
    await expect(component.procedure.scrollSize).toBe(50);
  });
});

