import { By } from "@angular/platform-browser";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ViewDirective } from "./view.directive";
import { ProcedureType } from "../api/client/procedure-type";
import { Dialog, DIALOG_ACCESSOR } from "../api/dialog/dialog";
import { Procedure } from "../api/client/procedure";
import { Window } from "../api/client/window";
import { View } from "../api/dialog/view";

@Component(
{
  template: "<form [coolProcedure]='procedure' [coolWindow]='window'></form>",
  providers:
  [
    {
      provide: DIALOG_ACCESSOR,
      useFactory: (c: TestGUIComponent) => c.dialog,
      deps: [TestGUIComponent]
    }
  ]
})
class TestGUIComponent
{
  dialog: Dialog =
  {
    activeView: null,
    views: new Map<Element, View>()
  } as Dialog;
  procedure: Procedure = { type: ProcedureType.Window, id: 2, name: "procedure" };
  window: Window = { procedure: this.procedure, name: "window" };
}

describe("ViewDirective for GUI", () =>
{
  let component: TestGUIComponent;
  let fixture: ComponentFixture<TestGUIComponent>;

  beforeEach(async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        imports: [ FormsModule ],
        declarations:
        [
          TestGUIComponent,
          ViewDirective
        ]
      }).
      compileComponents();

    fixture = TestBed.createComponent(TestGUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create an instance and setup properties", async () => {
    const viewDirective = fixture.debugElement.
      query(By.directive(ViewDirective)).
      injector.get(ViewDirective);

    await expect(viewDirective).toBeTruthy();
    await expect(viewDirective.form).toBeTruthy();
    await expect(viewDirective.element).toBeTruthy();
    await expect(viewDirective.coolWindow).toBeTruthy();
    await expect(viewDirective.dialog).toBeTruthy();
    await expect(component.dialog.activeView).toBe(null);

    component.window =
      { procedure: component.procedure, name: "window", active: true };

    fixture.detectChanges();

    await expect(component.dialog.activeView).toBe(viewDirective);
  });
});

@Component(
{
  template: "<form [coolProcedure]='procedure'></form>",
  providers:
  [
    {
      provide: DIALOG_ACCESSOR,
      useFactory: (c: TestOnlineComponent) => c.dialog,
      deps: [TestOnlineComponent]
    }
  ]
})
class TestOnlineComponent
{
  dialog: Dialog = { views: new Map<Element, View>() } as Dialog;
  procedure: Procedure = { type: ProcedureType.Online, id: 3, name: "procedure" };
}

describe("ViewDirective for Online", () =>
{
  let component: TestOnlineComponent;
  let fixture: ComponentFixture<TestOnlineComponent>;

  beforeEach(async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        imports: [ FormsModule ],
        declarations:
        [
          TestOnlineComponent,
          ViewDirective
        ]
      }).
      compileComponents();

    fixture = TestBed.createComponent(TestOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create an instance and setup properties", async () => {
    const viewDirective = fixture.debugElement.
      query(By.directive(ViewDirective)).
      injector.get(ViewDirective);

    await expect(viewDirective).toBeTruthy();
    await expect(viewDirective.form).toBeTruthy();
    await expect(viewDirective.element).toBeTruthy();
    await expect(viewDirective.coolWindow).not.toBeTruthy();
    await expect(viewDirective.dialog).toBeTruthy();
  });
});
