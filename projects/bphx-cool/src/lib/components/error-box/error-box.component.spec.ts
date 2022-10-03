import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ErrorBoxComponent } from "./error-box.component";
import { TabScopeDirective } from "../../directives/tab-scope.directive";
import { PopupComponent } from "../popup/popup.component";

describe("ErrorHandlerComponent", () => {
  let component: ErrorBoxComponent;
  let fixture: ComponentFixture<ErrorBoxComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations:
      [
        ErrorBoxComponent,
        TabScopeDirective,
        PopupComponent
      ]
    }).
    compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should open error box", async () =>
  {
    expect(component).toBeTruthy();

    let done = false;

    component.message = "Error message";
    component.details = `Long details of
    the error message`;
    component.stackTrace = `at method 1
    at method 2
    at method 3`;

    component.done.subscribe(() => done = true);

    fixture.detectChanges();
    await fixture.whenStable();

    await new Promise(resolve => window.setTimeout(resolve, 500));

    component.onDone("OK");
    fixture.detectChanges();
    await fixture.whenStable();

    await expect(done).toBeTruthy("OK clicked");
  });
});

