import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NestedModelAccessorDirective } from "./nested-model-accessor.directive";

@Component(
{
  template:
    `<div coolType="CHKBOX">
      <input name="name" type="checkbox" [(ngModel)]="value">
    </div>`
})
class TestComponent
{
  @Input()
  value: string;
}

describe("NestedModelAccessorDirective", () =>
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
          NestedModelAccessorDirective
        ]
      }).
      compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create an instance and initialize model", async () =>
  {
    const modelAccessor = fixture.debugElement.
      query(By.directive(NestedModelAccessorDirective)).
      injector.get(NestedModelAccessorDirective);

    await expect(modelAccessor).toBeTruthy();
    await expect(modelAccessor.element).toBeTruthy();
    await expect(modelAccessor.model).toBeTruthy();
  });
});
