import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MessageBoxComponent } from "./message-box.component";
import { TabScopeDirective } from "../../directives/tab-scope.directive";
import { PopupComponent } from "../popup/popup.component";

describe("MessageBoxComponent", () => {
  let component: MessageBoxComponent;
  let fixture: ComponentFixture<MessageBoxComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations:
      [
        MessageBoxComponent,
        TabScopeDirective,
        PopupComponent
      ]
    }).
    compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should open message box", async () =>
  {
    expect(component).toBeTruthy();

    let done = false;

    component.title = "My title";
    component.text = "My test";
    component.buttons =
    [
      { name: "OK", text: "OK?" },
      { name: "Cancel", text: "No, lets cancel!" },
    ];
    component.style = "Information";

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

