import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FileData } from "../../api/client/file-data";
import { TabScopeDirective } from "../../directives/tab-scope.directive";
import { PopupComponent } from "../popup/popup.component";
import { UploadBoxComponent } from "./upload-box.component";

describe("UploadBoxComponent", () => 
{
  let component: UploadBoxComponent;
  let fixture: ComponentFixture<UploadBoxComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations:
      [
        UploadBoxComponent,
        TabScopeDirective,
        PopupComponent
      ]
    }).
    compileComponents();
  });

  beforeEach(() => 
  {
    fixture = TestBed.createComponent(UploadBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should open upload box and upload file", async () =>
  {
    expect(component).toBeTruthy();

    let results: FileData[] = null;

    component.done.subscribe(data => results = data);

    fixture.detectChanges();
    await fixture.whenStable();

    await new Promise(resolve => window.setTimeout(resolve, 500));

    await component.complete([ new File([], "my file.pdf")]);
    fixture.detectChanges();
    await fixture.whenStable();

    await expect(results).toBeTruthy("Has results");
  });
});

