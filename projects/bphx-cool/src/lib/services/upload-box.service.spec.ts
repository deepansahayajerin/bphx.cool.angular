import { CommonModule } from "@angular/common";
import { Component, NgModule, ViewContainerRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FileData } from "../api/client/file-data";
import { PopupComponent } from "../components/popup/popup.component";
import { UploadBoxComponent } from "../components/upload-box/upload-box.component";

import { UploadBoxService } from "./upload-box.service";

@Component({ template: "" })
class TestComponent
{
  constructor(
    public viewContainerRef: ViewContainerRef,
    public uploadService: UploadBoxService)
  {
  }
}
@NgModule(
{
  imports: [CommonModule],
  declarations:
  [
    TestComponent,
    UploadBoxComponent,
    PopupComponent
  ],
  entryComponents: [UploadBoxComponent]
})
class TestModule {}

describe("UploadBoxService", () =>
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

  it("should upload box", async () =>
  {
    let results: FileData[];

    component.uploadService.
      open(component.viewContainerRef).
      subscribe(data => results = data);

    fixture.detectChanges();
    await fixture.whenStable();

    const element: HTMLInputElement = (fixture.debugElement.nativeElement as HTMLElement).
      parentElement.querySelector("input.cool-upload-input");

    await expect(element).toBeDefined("Input file is found.");

    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(new File(["hello"], "test-file.txt"));

    element.files = dataTransfer.files;
    element.dispatchEvent(new InputEvent("change"));

    await new Promise(resolve => window.setTimeout(resolve, 500));

    fixture.detectChanges();
    await fixture.whenStable();

    await expect(results).toBeTruthy("Has results");
  });
});
