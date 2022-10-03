import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, ViewContainerRef, NgModule } from "@angular/core";
import { ErrorHandlerService } from "./error-handler.service";
import { PopupComponent } from "../components/popup/popup.component";
import { ErrorBoxComponent } from "../components/error-box/error-box.component";

@Component({ template: "" })
class TestComponent
{
  constructor(
    public viewContainerRef: ViewContainerRef,
    public errorHandler: ErrorHandlerService)
  {
  }
}

@NgModule(
{
  imports: [CommonModule],
  declarations:
  [
    TestComponent,
    ErrorBoxComponent,
    PopupComponent
  ],
  entryComponents: [ErrorBoxComponent]
})
class TestModule {}

describe("ErrorHandlerService", () =>
{
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () =>
  {
    await TestBed.
      configureTestingModule(
      {
        imports: [ TestModule ]
      }).
      compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should open error box", async () =>
  {
    let done = false;

    component.errorHandler.open(
      component.viewContainerRef,
      "Error message from error handler service",
      null,
      "MyError",
      `Long details of
      the error message`,
      `at method 1
      at method 2
      at method 3`).
      subscribe(() => done  = true);

    fixture.detectChanges();
    await fixture.whenStable();

    const element = (fixture.debugElement.nativeElement as HTMLElement).
      parentElement.querySelector("button");

    await expect(element).toBeDefined("OK button is found.");

    await new Promise(resolve => window.setTimeout(resolve, 500));

    element.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await expect(done).toBeTruthy("OK clicked");
  });
});
