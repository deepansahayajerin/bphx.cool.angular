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
import { PromptDirective } from "./prompt.directive";
import { View } from "../api/dialog/view";

@Component(
{
  template:
    `<form [coolProcedure]="procedure" [coolWindow]="window">
      <label [coolFor]="field">Field: </label>
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

describe("PromptDirective", () =>
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
          PromptDirective
        ]
      }).
      compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create an instance and setup properties", async () =>
  {
    const fieldDebugElement = fixture.debugElement.
      query(By.directive(FieldDirective));
    const field = fieldDebugElement.injector.get(FieldDirective);

    const promptDebugElement = fixture.debugElement.
      query(By.directive(PromptDirective));
    const prompt = promptDebugElement.injector.get(PromptDirective);

    await expect(field).toBeTruthy();
    await expect(prompt).toBeTruthy();

    await fixture.whenStable();

    await expect(field.coolPrompt === prompt).
      toBeTruthy("Field refers to prompt");
    await expect(prompt.coolFor === field).
      toBeTruthy("Prompt refer to field");
  });
});

