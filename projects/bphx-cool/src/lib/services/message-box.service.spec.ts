import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, ViewContainerRef, NgModule } from "@angular/core";
import { PopupComponent } from "../components/popup/popup.component";
import { MessageBoxComponent } from "../components/message-box/message-box.component";
import { MessageBoxService } from "./message-box.service";

@Component({ template: "" })
class TestComponent
{
  constructor(
    public viewContainerRef: ViewContainerRef,
    public messageBox: MessageBoxService)
  {
  }
}
@NgModule(
{
  imports: [CommonModule],
  declarations:
  [
    TestComponent,
    MessageBoxComponent,
    PopupComponent
  ],
  entryComponents: [MessageBoxComponent]
})
class TestModule {}

describe("MessageBoxService", () =>
{
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        imports: [ TestModule, CommonModule ]
      }).
      compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should open message box", async () =>
  {
    let done = false;

    component.messageBox.open(
      component.viewContainerRef,
      "Question",
      "Confirm",
      "Please confirm file delete.",
      [ { name: "Yes" }, { name: "No", text: "<b>N</b>o" } ]).
      subscribe(name => done  = name === "Yes");

    fixture.detectChanges();
    await fixture.whenStable();

    const element = (fixture.debugElement.nativeElement as HTMLElement).
      parentElement.querySelector("button");

    await expect(element).toBeDefined("Yes button is found.");

    await new Promise(resolve => window.setTimeout(resolve, 500));

    element.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await expect(done).toBeTruthy("Yes is clicked");
  });
});
