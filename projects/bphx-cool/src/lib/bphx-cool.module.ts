import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientService } from "./services/http-client.service";
import { BodyDirective } from "./directives/body.directive";
import { ChangedDirective } from "./directives/changed-event.directive";
import { ClickEventDirective } from "./directives/click-event.directive";
import { CLIENT_ACCESSOR } from "./api/client/client";
import { CloseEventDirective } from "./directives/close-event.directive";
import { CommandEventDirective } from "./directives/command-event.directive";
import { DateDirective } from "./directives/date.directive";
import { DatePipe } from "./pipes/date.pipe";
import { DefaultModelAccessorDirective } from "./directives/default-model-accessor.directive";
import { DefaultValueDirective } from "./directives/default-value.directive";
import { DIALOG_LOCATION_ACCESSOR } from "./api/dialog/dialog-location";
import { DialogComponent } from "./components/dialog/dialog.component";
import { EditablePipe } from "./pipes/editable.pipe";
import { ErrorBoxComponent } from "./components/error-box/error-box.component";
import { FieldDirective } from "./directives/field.directive";
import { GainFocusEventDirective } from "./directives/gain-focus-event.directive";
import { HeaderDirective } from "./directives/header.directive";
import { InitDirective } from "./directives/init.directive";
import { KeyPressDirective } from "./directives/key-press-event.directive";
import { ListAccessorDirective } from "./directives/list-accessor.directive";
import { LOCAL_ACCESSOR, SESSION_ACCESSOR } from "./api/state-service";
import { LocalService } from "./services/local.service";
import { LoseFocusEventDirective } from "./directives/lose-focus-event.directive";
import { MenuDirective } from "./directives/menu.directive";
import { MessageBoxComponent } from "./components/message-box/message-box.component";
import { MessageTypeDirective } from "./directives/message-type.directive";
import { MouseEventDirective } from "./directives/mouse-event.directive";
import { NestedModelAccessorDirective } from "./directives/nested-model-accessor.directive";
import { NumberDirective } from "./directives/number.directive";
import { NumberPipe } from "./pipes/number.pipe";
import { OpenEventDirective } from "./directives/open-event.directive";
import { PagePropertiesDirective } from "./directives/page-properties.directive";
import { PermittedValuesValidator } from "./directives/permitted-values.validator";
import { PopupComponent } from "./components/popup/popup.component";
import { PositionDirective } from "./directives/position.directive";
import { PromptDirective } from "./directives/prompt.directive";
import { RENDERER_ACCESSOR } from "./api/renderer";
import { RendererService } from "./services/renderer.service";
import { RowDirective } from "./directives/row.directive";
import { ScrollEventDirective } from "./directives/scroll-event.directive";
import { SelectedPipe } from "./pipes/selected.pipe";
import { SelectionPipe } from "./pipes/selection.pipe";
import { SessionService } from "./services/session.service";
import { StringDirective } from "./directives/string.directive";
import { StringPipe } from "./pipes/string.pipe";
import { TabActivateEventDirective } from "./directives/tab-activate-event.directive";
import { TableDirective } from "./directives/table.directive";
import { TabScopeDirective } from "./directives/tab-scope.directive";
import { TimePipe } from "./pipes/time.pipe";
import { TrueFalseValueDirective } from "./directives/true-false-value-directive";
import { UploadEventDirective } from "./directives/upload-event.directive";
import { UrlDialogLocationService } from "./services/url-dialog-location.service";
import { ViewDirective } from "./directives/view.directive";
import { ZipPipe } from "./pipes/zip.pipe";
import { UploadBoxComponent } from "./components/upload-box/upload-box.component";

const compoments =
[
  BodyDirective,
  ChangedDirective,
  ClickEventDirective,
  CloseEventDirective,
  CommandEventDirective,
  DateDirective,
  DatePipe,
  DefaultModelAccessorDirective,
  DefaultValueDirective,
  DialogComponent,
  EditablePipe,
  ErrorBoxComponent,
  FieldDirective,
  GainFocusEventDirective,
  HeaderDirective,
  InitDirective,
  KeyPressDirective,
  ListAccessorDirective,
  LoseFocusEventDirective,
  MenuDirective,
  MessageBoxComponent,
  MessageTypeDirective,
  MouseEventDirective,
  NestedModelAccessorDirective,
  NumberDirective,
  NumberPipe,
  OpenEventDirective,
  PagePropertiesDirective,
  PermittedValuesValidator,
  PopupComponent,
  PositionDirective,
  PromptDirective,
  RowDirective,
  ScrollEventDirective,
  SelectedPipe,
  SelectionPipe,
  StringDirective,
  StringPipe,
  TabActivateEventDirective,
  TableDirective,
  TabScopeDirective,
  TimePipe,
  TrueFalseValueDirective,
  UploadBoxComponent,
  UploadEventDirective,
  ViewDirective,
  ZipPipe,
];

@NgModule(
{
  imports: [CommonModule],
  declarations: compoments,
  exports: compoments,
  entryComponents: [ MessageBoxComponent, ErrorBoxComponent, UploadBoxComponent ],
  providers:
  [
    EditablePipe,
    SelectedPipe,
    SelectionPipe,
    ZipPipe,
    { provide: CLIENT_ACCESSOR, useClass: HttpClientService },
    { provide: DIALOG_LOCATION_ACCESSOR, useClass: UrlDialogLocationService },
    { provide: RENDERER_ACCESSOR, useClass: RendererService },
    { provide: LOCAL_ACCESSOR, useClass: LocalService },
    { provide: SESSION_ACCESSOR, useClass: SessionService }
  ]
})
export class BphxCoolModule
{
}
