import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";

import { PopupComponent } from "./popup.component";
import { By } from "@angular/platform-browser";

@Component(
{
  template: `
    <cool-popup draggable="true" resizable="true">
      <header>
        <span class="appIcon"></span>
        <span class="appTitle">HEAD</span>
        <span class="popupIcons"><b
          title="Minimize" coolMinButton></b><b
          title="Maximize" coolMaxButton></b><b
          title="Close" coolCloseButton></b></span>
      </header>
      <content>CONTENT</content>
    </cool-popup>
  `
})
class TestComponent
{
}


describe("PopupComponent", () =>
{
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule(
    {
      declarations: [ TestComponent, PopupComponent ]
    }).
    compileComponents();
  });

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", async () =>
  {
    const popup = fixture.debugElement.
      query(By.directive(PopupComponent)).
      injector.get(PopupComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    await expect(popup).toBeTruthy();
  });
});
