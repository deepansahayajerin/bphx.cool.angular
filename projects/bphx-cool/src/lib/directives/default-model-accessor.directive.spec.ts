import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DefaultModelAccessorDirective } from "./default-model-accessor.directive";

@Component(
{
  template: "<input name=\"name\" coolType type=\"text\" [(ngModel)]=\"value\">"
})
class TestComponent
{
  @Input()
  value: string;
}

describe("DefaultModelAccessorDirective", () =>
{
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() =>
  {
    TestBed.
      configureTestingModule(
      {
        imports: [ FormsModule ],
        declarations:
        [
          TestComponent,
          DefaultModelAccessorDirective
        ]
      }).
      compileComponents();
  }));

  beforeEach(() =>
  {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create an instance", () =>
  {
    const modelAccessor = fixture.debugElement.
      query(By.directive(DefaultModelAccessorDirective)).
      injector.get(DefaultModelAccessorDirective);

    expect(modelAccessor).toBeTruthy();
    expect(modelAccessor.element).toBeTruthy();
    expect(modelAccessor.model).toBeTruthy();
  });
});
