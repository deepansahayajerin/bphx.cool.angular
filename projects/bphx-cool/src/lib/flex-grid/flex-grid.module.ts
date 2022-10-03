import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexGridComponent } from "./flex-grid.component";
import { BphxCoolModule } from "../bphx-cool.module";

@NgModule(
{
  declarations: [FlexGridComponent],
  exports: [FlexGridComponent],
  imports:
  [
    CommonModule,
    BphxCoolModule
  ]
})
export class FlexGridModule
{
}
