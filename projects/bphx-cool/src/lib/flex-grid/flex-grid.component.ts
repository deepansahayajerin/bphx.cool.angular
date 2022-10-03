import { AfterViewInit, EventEmitter, HostListener, Inject, OnInit, QueryList, Self, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { Component, ElementRef, Optional, Output } from "@angular/core";
import { Field, FIELD_ACCESSOR } from "../api/dialog/field";
import { View, VIEW_ACCESSOR } from "../api/dialog/view";
import { OptionsService } from "../services/options.service";
import { Control } from "../api/client/control";
import { EventBase } from "../api/event-base";
import { ClickEventDirective } from "../directives/click-event.directive";
import { EventParams } from "../api/event-params";

interface Column
{
  editMask?: string;
  width?: number;
  hidden?: boolean;
  dataType?: number;
  alignment?: number;
}

interface Row
{
  status?: number;
  selected?: boolean;
  cells?: Cell[];
}

interface Cell
{
  value?: string;
  background?: number;
  foreground?: number;
}

interface FlexGridControl extends Control
{
  cols?: Column[];
  rows?: Row[];

  mouseCol?: number;
  mouseRow?: number;

  col?: number;
  row?: number;

  colSel?: number;
  rowSel?: number;

  editCol?: number;
  editRow?: number;

  showCol?: number;
  showRow?: number;

  fixedCols?: number;
  fixedRows?: number;

  editable?: number;
  wordWrap?: boolean;
  tabBehavior?: number;
  selectionMode?: number;
  highLight?: number;
}

@Component(
{
  selector: "[coolType=flex-grid]",
  templateUrl: "./flex-grid.component.html",
  styleUrls: ["./flex-grid.component.css"]
})
export class FlexGridComponent implements OnInit, AfterViewInit
{
  /**
   * Validate cell value event.
   */
  @Output()
  coolValidateEdit = new EventEmitter<EventParams>();

  /**
   * Fired after a cell's contents change.
   */
  @Output()
  coolCellChanged = new EventEmitter<EventParams>();

  /**
   * Column or row change event.
   */
  @Output()
  coolAfterRowColChange = new EventEmitter<EventParams>();

  /**
   * Event triggered when a cell is entered.
   */
  @Output()
  coolEnterCell = new EventEmitter<EventParams>();

  /**
   * Mouse down event.
   */
  @Output()
  coolMouseDown = new EventEmitter<EventParams>();

  /**
   * Event triggered after the control exits cell edit mode.
   */
  @Output()
  coolAfterEdit = new EventEmitter<EventParams>();

  /**
   * An editor reference.
   */
  @ViewChildren("editor")
  editors: QueryList<ElementRef<HTMLInputElement>>;

  /**
   * A control reference.
   */
  control: FlexGridControl = { name: "", rows: [], cols: [] };

  /**
   * Creates a `FlexGridComponent` instance.
   * @param options options service.
   * @param element an element reference.
   * @param view a `View` reference.
   * @param field optional field reference.
   * @param click optional click directive.
   */
  constructor(
    public options: OptionsService,
    public element: ElementRef<HTMLElement>,
    @Optional() @Inject(VIEW_ACCESSOR) public view?: View,
    @Self() @Optional() @Inject(FIELD_ACCESSOR) public field?: Field,
    @Self() @Optional() public click?: ClickEventDirective)
  {
    if (field)
    {
      this.event = new EventBase(field);

      const focus = field.focus;
      const refresh = field.refresh;

      field.focus = () => this.focus() && focus?.();
      field.refresh = (init: boolean) => this.refresh(init) && refresh?.(init);
    }
  }

  ngOnInit(): void
  {
    const click = this.click;

    if (click)
    {
      if (click.coolClick.observers.length)
      {
        click.coolClick.subscribe(params => this.prepare(params));
      }

      if (click.coolDoubleClick.observers.length)
      {
        click.coolDoubleClick.subscribe(params => this.prepare(params));
      }
    }
  }

  ngAfterViewInit(): void
  {
    this.editors.changes.subscribe(() => 
    {
      this.focus();
    });
  }

  index(index: number): number
  {
    return index;
  }

  isRowSelected(row: Row, rowIndex: number): boolean
  {
    const control = this.control;

    return control.selectionMode === 3 ? row?.selected :
      (rowIndex >= control.row) && (rowIndex <= control.rowSel);
  }

  isCellSelected(row: Row, rowIndex: number, colIndex: number):
    boolean
  {
    const control = this.control;

    switch(control.selectionMode)
    {
      case 1:
      {
        return (rowIndex >= control.row) && (rowIndex <= control.rowSel);
      }
      case 2:
      {
        return (colIndex >= control.col) && (colIndex <= control.colSel);
      }
      case 3:
      {
        return row?.selected;
      }
      default:
      {
        return (rowIndex >= control.row) && (rowIndex <= control.rowSel) &&
          (colIndex >= control.col) && (colIndex <= control.colSel);
      }
    }
  }


  private prevEditRow: number;
  private prevEditCol: number;

  isCellFocused(rowIndex: number, colIndex: number): boolean
  {
    const focused = this.focused && 
      (rowIndex === this.control.editRow) && 
      (colIndex === this.control.editCol);

    if (focused != ((rowIndex === this.prevEditRow) && (colIndex === this.prevEditCol)))
    {
      if (focused)
      {
        this.prevEditRow = rowIndex;
        this.prevEditCol = colIndex;

        console.log("focus changed");
      }
      else
      {
        this.prevEditRow = null;
        this.prevEditCol = null;

        console.log("focus removed");
      }
    }

    return focused;
  }

  get focused(): boolean
  {
    return this.field.view?.coolWindow?.active &&
      this.field.coolName && 
      (this.field.view.coolWindow?.focused === this.field.coolName);
  }

  private focus(): boolean
  {
    if (this.focused)
    {
      const editor = this.editors?.first;

      if (editor)
      {
        editor.nativeElement.focus();

        return true;
      }
    }

    return false;
  }

  private refresh(init: boolean): boolean
  {
    if (init)
    {
      const control: FlexGridControl = this.field?.control ?? { name: "" };

      this.control = control;

      control.cols ??= [];
      control.rows ??= [];
      control.fixedCols ??= 0;
      control.fixedRows ??= 0;
      control.selectionMode ??= 0;

      if (control.selectionMode === 3)
      {
        this.updatedRowsFromSelected();
      }
      else
      {
        control.colSel ??= control.col;
        control.rowSel ??= control.row;
      }

      control.mouseCol ??= control.col;
      control.mouseRow ??= control.row;

      if ((control.showCol != null) && (control.showRow != null))
      {
        this.showCell(control.showRow, control.showCol);
        control.showCol = null;
        control.showRow = null;
      }

      this.getCell(control.editRow, control.editCol);
    }

    return false;
  }

  private updatedRowsFromSelected()
  {
    const control = this.control;

    control.row = null;
    control.rowSel = null;

    for(let i = 0; i < control.rows.length; ++i)
    {
      const row = control.rows[i] ??= {};

      if (row.selected)
      {
        control.row ??= control.rowSel = i;
      }
    }

    if (control.row != null)
    {
      control.col = 0;
      control.colSel = control.cols.length - 1;
    }
    else
    {
      control.col = null;
      control.colSel = null;
    }
  }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    if (!this.active)
    {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    const editor = this.editors?.first;
    const editorTarget = editor?.nativeElement === event.target;
    const key = event.key;
    const shift = event.shiftKey;
    const ctrl = event.ctrlKey;
    let preventDefault = true;
    const control = this.control;
    const selectionMode = control.selectionMode ?? 0;

    const oldCol = control.mouseCol;
    const oldRow = control.mouseRow;

    const validPos = (oldCol >= control.fixedCols) &&
      (oldCol < control.cols.length) &&
      (oldRow >= control.fixedRows) &&
      (oldRow < control.rows.length);

    if (validPos &&
      !editorTarget &&
      (control.editable) &&
      (key?.length === 1) &&
      !ctrl &&
      !event.altKey &&
      !event.metaKey)
    {
      this.triggerEdit(oldRow, oldCol);
      
      const cell = this.getCell(oldRow, oldCol);

      if (cell)
      {
        cell.value = key;
      }

      event.preventDefault();
      event.stopPropagation();

      return;
    }

    switch(key)
    {
      case " ":
      {
        if (editorTarget)
        {
          preventDefault = false;

          break;
        }

        if (!validPos)
        {
          break;
        }

        switch(control.selectionMode)
        {
          case 0:
          {
            if (ctrl && !shift)
            {
              control.colSel = control.col = -1;
              control.rowSel = control.row = -1;
            }
            else
            {
              control.colSel = control.col = control.mouseCol;
              control.rowSel = control.row = control.mouseRow;
            }

            break;
          }
          case 1:
          {
            if (ctrl && !shift)
            {
              control.colSel = control.col = -1;
              control.rowSel = control.row = -1;
            }
            else
            {
              control.col = control.fixedCols;
              control.colSel = control.cols.length - 1;
              control.rowSel = control.row = control.mouseRow;
            }

            break;
          }
          case 2:
          {
            if (ctrl && !shift)
            {
              control.colSel = control.col = -1;
              control.rowSel = control.row = -1;
            }
            else
            {
              control.colSel = control.col = control.mouseCol;
              control.row = control.fixedRows;
              control.rowSel = control.rows.length - 1;
            }

            break;
          }
          case 3:
          {
            const row = control.rows[control.mouseRow];

            if (ctrl && !shift)
            {
              row.selected = !row.selected;
            }
            else
            {
              row.selected = true;
            }

            this.updatedRowsFromSelected();

            break;
          }
        }

        break;
      }
      case "ArrowUp":
      case "Up":
      {
        if (selectionMode === 2)
        {
          break;
        }
        else if (!validPos)
        {
          control.mouseCol = control.fixedCols;
          control.mouseRow = control.fixedRows;

          break;
        }
        else if (control.mouseRow <= control.fixedRows)
        {
          break;
        }
        else if (shift)
        {
          --control.mouseRow;

          switch(selectionMode)
          {
            case 0:
            case 1:
            {
              control.row = control.mouseRow;

              break;
            }
            case 3:
            {
              control.rows[control.mouseRow].selected = true;
              this.updatedRowsFromSelected();

              break;
            }
          }
        }
        else if (ctrl)
        {
          --control.mouseRow;

          break;
        }
        else
        {
          --control.mouseRow;

          switch(selectionMode)
          {
            case 0:
            case 1:
            {
              control.rowSel = control.row = control.mouseRow;

              break;
            }
            case 3:
            {
              control.rows.forEach(row => row.selected = false);
              control.rows[control.mouseRow].selected = true;
              control.rowSel = control.row = control.mouseRow;

              break;
            }
          }
        }

        break;
      }
      case "ArrowDown":
      case "Down":
      {
        if (selectionMode === 2)
        {
          break;
        }
        else if (!validPos)
        {
          control.mouseCol = control.fixedCols;
          control.mouseRow = control.fixedRows;

          break;
        }
        else if (control.mouseRow >= control.rows.length - 1)
        {
          break;
        }
        else if (shift)
        {
          ++control.mouseRow;

          switch(selectionMode)
          {
            case 0:
            case 1:
            {
              control.rowSel = control.mouseRow;

              break;
            }
            case 3:
            {
              control.rows[control.mouseRow].selected = true;
              this.updatedRowsFromSelected();

              break;
            }
          }
        }
        else if (ctrl)
        {
          ++control.mouseRow;

          break;
        }
        else
        {
          ++control.mouseRow;

          switch(selectionMode)
          {
            case 0:
            case 1:
            {
              control.rowSel = control.row = control.mouseRow;

              break;
            }
            case 3:
            {
              control.rows.forEach(row => row.selected = false);
              control.rows[control.mouseRow].selected = true;
              control.rowSel = control.row = control.mouseRow;

              break;
            }
          }
        }

        break;
      }
      case "Left":
      case "ArrowLeft":
      {
        if (editorTarget)
        {
          preventDefault = false;

          break;
        }

        if ((selectionMode != 0) && (selectionMode != 2))
        {
          break;
        }
        else if (!validPos)
        {
          control.mouseCol = control.fixedCols;
          control.mouseRow = control.fixedRows;

          break;
        }
        else
        {
          while(control.mouseCol > control.fixedCols)
          {
            if (shift)
            {
              control.col = --control.mouseCol;
            }
            else if (ctrl)
            {
              --control.mouseCol;
    
              break;
            }
            else
            {
              control.colSel = control.col = --control.mouseCol;
            }

            if (control.cols[control.mouseCol].hidden)
            {
              continue;
            }

            break;
          }
        }

        break;
      }
      case "Right":
      case "ArrowRight":
      {
        if (editorTarget)
        {
          preventDefault = false;

          break;
        }

        preventDefault = true;

        if ((selectionMode != 0) && (selectionMode != 2))
        {
          break;
        }
        else if (!validPos)
        {
          control.mouseCol = control.fixedCols;
          control.mouseRow = control.fixedRows;

          break;
        }
        else 
        {
          while(control.mouseCol < control.cols.length - 1)
          {
            if (shift)
            {
              control.col = ++control.mouseCol;
            }
            else if (ctrl)
            {
              ++control.mouseCol;
    
              break;
            }
            else
            {
              control.colSel = control.col = ++control.mouseCol;
            }

            if (control.cols[control.mouseCol].hidden)
            {
              continue;
            }
            
            break;
          }
        }

        break;
      }
      case "Tab":
      {
        if ((control.tabBehavior !== 1) || 
          ctrl || 
          event.altKey || 
          event.metaKey)
        {
          break;
        }

        preventDefault = true;

        if (!validPos)
        {
          control.mouseCol = control.fixedCols;
          control.mouseRow = control.fixedRows;

          break;
        }

        if (control.editable &&
          (control.mouseCol === control.editCol) &&
          (control.mouseRow === control.mouseRow))
        {
          for(let i = 1; i < control.cols.length; ++i)
          {
            let next = shift ? control.mouseCol - i : control.mouseCol + i;

            if (next < 0)
            {
              next += control.cols.length;
            }
            else if (next >= control.cols.length)
            {
              next -= control.cols.length;
            }
            // No more cases.

            if ((next >= control.fixedCols) && !control.cols[next].hidden)
            {
              control.mouseCol = next;

              break;
            }
          }

          this.triggerEdit(control.mouseRow, control.mouseCol);
          event.preventDefault();
          event.stopPropagation();
          event = null;

          control.colSel = control.col = control.mouseCol;

          break;
        }

        switch(selectionMode)
        {
          case 0:
          case 2:
          {
            if (shift)
            {
              if (control.mouseCol <= control.fixedCols)
              {
                break;
              }

              --control.mouseCol;
            }
            else
            {
              if (control.mouseCol >= control.cols.length - 1)
              {
                break;
              }

              ++control.mouseCol;
            }
                
            control.colSel = control.col = control.mouseCol;

            break;
          }
          case 1:
          {
            if (shift)
            {
              if (control.mouseRow <= control.fixedRows)
              {
                break;
              }

              --control.mouseRow;
            }
            else
            {
              if (control.mouseRow >= control.rows.length - 1)
              {
                break;
              }

              ++control.mouseRow;
            }
            
            control.rowSel = control.row = control.mouseRow;

            break;
          }
          case 3:
          {
            if (shift)
            {
              if (control.mouseRow <= control.fixedRows)
              {
                break;
              }

              --control.mouseRow;
            }
            else
            {
              if (control.mouseRow >= control.rows.length - 1)
              {
                break;
              }

              ++control.mouseRow;
            }
            
            control.rows.forEach(row => row.selected = false);
            control.rows[control.mouseRow].selected = true;
            control.rowSel = control.row = control.mouseRow;

            break;
          }
        }

        break;        
      }
      default:
      {
        preventDefault = false;

        break;
      }
    }

    if (preventDefault)
    {
      this.triggerAfterRowColChange(
        event,
        oldRow,
        oldCol,
        control.mouseRow,
        control.mouseCol);

      this.triggerEnterCell(event);
      this.showCell(control.mouseRow, control.mouseCol);
    }
  }

  @HostListener("mousedown", ["$event"])
  @HostListener("dblclick", ["$event"])
  onmouse(event: MouseEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    if (!this.active)
    {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    const target = event.target as HTMLElement;

    if (target.matches("[disabled], [disabled] *"))
    {
      return;
    }

    const td = target.closest("td[col]");
    const tr = td?.closest("tr[row]");

    if (!tr)
    {
      return;
    }

    const control = this.control;
    const col = Number(td.getAttribute("col"));
    const row = Number(tr.getAttribute("row"));

    if ((col < control.fixedCols) ||
      (col >= control.cols.length) ||
      (row < control.fixedRows) ||
      (row >= control.rows.length))
    {
      return;
    }

    const oldRow = control.mouseRow;
    const oldCol = control.mouseCol;
    const colRowChanged = (oldRow !== row) || (oldCol !== col);

    const validPos = (oldCol >= control.fixedCols) &&
      (oldCol < control.cols.length) &&
      (oldRow >= control.fixedRows) &&
      (oldRow < control.rows.length);

    const selectionMode = control.selectionMode;
    const shift = event.shiftKey;
    const ctrl = event.ctrlKey;

    const mousedown = event.type === "mousedown";
    const dblclick = event.type === "dblclick";

    if (mousedown)
    {
      if (event.timeStamp -
        this.options.doubleClickDelay < this.mousedownTimestamp)
      {
        return;
      }

      this.mousedownTimestamp = event.timeStamp;
    }

    if ((dblclick && !colRowChanged) || this.focused)
    {
      if ((control.editable === 2) || (control.editable === -1))
      {
        this.triggerEdit(row, col);
        event.preventDefault();
        event.stopPropagation();
      }

      return;
    }

    if (shift && validPos)
    {
      switch(selectionMode)
      {
        case 0:
        {
          control.col = Math.min(col, control.mouseCol);
          control.colSel = Math.max(col, control.mouseCol);
          control.row = Math.min(row, control.mouseRow);
          control.rowSel = Math.max(row, control.mouseRow);

          break;
        }
        case 1:
        {
          control.col = control.fixedCols;
          control.colSel = control.cols.length - 1;
          control.row = Math.min(row, control.mouseRow);
          control.rowSel = Math.max(row, control.mouseRow);

          break;
        }
        case 2:
        {
          control.col = Math.min(col, control.mouseCol);
          control.colSel = Math.max(col, control.mouseCol);
          control.row = control.fixedRows;
          control.rowSel = control.rows.length - 1;

          break;
        }
        case 3:
        {
          control.col = control.fixedCols;
          control.colSel = control.cols.length - 1;
          control.row = Math.min(row, control.mouseRow);
          control.rowSel = Math.max(row, control.mouseRow);
          control.rows.forEach((r, i) =>
            r.selected = (i >= control.row) && (i <= control.rowSel));

          break;
        }
      }
    }
    else if (ctrl && (selectionMode === 3))
    {
      const r = control.rows[row];

      r.selected = !r.selected;
      this.updatedRowsFromSelected();
    }
    else
    {
      switch(selectionMode)
      {
        case 0:
        {
          control.colSel = control.col = col;
          control.rowSel = control.row = row;

          break;
        }
        case 1:
        {
          control.col = control.fixedCols;
          control.colSel = control.cols.length - 1;
          control.rowSel = control.row = row;

          break;
        }
        case 2:
        {
          control.colSel = control.col = col;
          control.row = control.fixedRows;
          control.rowSel = control.rows.length - 1;

          break;
        }
        case 3:
        {
          control.rows.forEach(row => row.selected = false);
          control.rows[row].selected = true;
          control.col = control.fixedCols;
          control.colSel = control.cols.length - 1;
          control.rowSel = control.row = row;

          break;
        }
      }
    }

    control.mouseCol = col;
    control.mouseRow = row;
    this.showCell(row, col);

    if (mousedown &&
      ((control.editable === 2) || (control.editable === -1)))
    {
      this.triggerEdit(row, col);
    }

    if (colRowChanged)
    {
      this.triggerMouseDown(event);
      this.triggerAfterRowColChange(event, oldRow, oldCol, row, col);
      this.triggerEnterCell(event);
    }
  }

  onEdited(event: Event, cell: Cell, row: number, col: number): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    if (!this.active)
    {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    const value = this.editors?.first.nativeElement.value;

    if (value != null)
    {
      cell.value = value;

      this.triggerValidateEdit(event, row, col);
      this.triggerCellChanged(event, row, col);
      this.triggerAfterEdit(event, row, col);
    }
  }

  get processing(): boolean
  {
    return !!this.view?.dialog?.pending;
  }

  get active(): boolean
  {
    return !this.processing &&
      !this.element.nativeElement.matches("[disabled], [disabled] *");
  }

  private showCell(row: number, col: number): void
  {
    const control = this.control;

    if ((col < control.fixedRows) ||
      (col >= control.cols.length) ||
      (row < 0) ||
      (row >= control.rows.length))
    {
      return;
    }

    const element = this.element.nativeElement;
    const cell: HTMLElement = element.querySelector(
      `tr[row='${control.mouseRow}'] td[col='${control.mouseCol}']`);

    if (!cell)
    {
      return;
    }

    const top = element.querySelector(".coolFlexHead")?.
      getBoundingClientRect().bottom ?? 0;
    const bottom = element.getBoundingClientRect().bottom;
    const cellRect = cell.getBoundingClientRect();

    if (cellRect.top < top)
    {
      element.scrollBy(0, cellRect.top - top);
    }
    else if (cellRect.bottom > bottom)
    {
      element.scrollBy(
        0,
        Math.min(cellRect.top - top, cellRect.bottom - bottom));
    }
    // No more cases
  }

  private triggerMouseDown(event: Event)
  {
    if (!this.coolMouseDown.observers.length)
    {
      return false;
    }

    const newRow = this.control.mouseRow;
    const newCol = this.control.mouseCol;
    const params =
      this.event.createParams("MouseDown", event, this.coolMouseDown);

    params.deduplicate = true;
    params.delay = this.options.changedDelay;
    params.defer = this.options.doubleClickDelay;

    params.canceled = () =>
      (this.control.mouseRow !== newRow) ||
        (this.control.mouseCol !== newCol);

    this.prepare(params);
    this.event.trigger(params);

    return true;
  }

  private triggerAfterRowColChange(
    event: Event,
    oldRow: number,
    oldCol: number,
    newRow: number,
    newCol: number): boolean
  {
    if ((oldCol === newCol) && (oldRow === newRow))
    {
      return false;
    }

    const params =
      this.event.createParams("AfterRowColChange", event, this.coolAfterRowColChange);

    params.deduplicate = true;
    params.delay = this.options.changedDelay;
    params.defer = this.coolAfterRowColChange.observers.length ?
      this.options.doubleClickDelay : -1;

    params.canceled = () =>
      (this.control.mouseRow !== newRow) ||
        (this.control.mouseCol !== newCol);

    this.prepare(params);

    params.attribute.push(
      { name: "OldRow", value: oldRow },
      { name: "OldCol", value: oldCol },
      { name: "NewRow", value: newRow },
      { name: "NewCol", value: newCol });

    this.event.trigger(params);

    return true;
  }

  private triggerEnterCell(event: Event): boolean
  {
    if (!this.coolEnterCell.observers.length)
    {
      return false;
    }

    const params =
      this.event.createParams("EnterCell", event, this.coolEnterCell);

    params.deduplicate = true;
    params.delay = this.options.changedDelay;
    params.defer = this.options.doubleClickDelay;
    this.event.trigger(params);

    return true;
  }

  private triggerEdit(editRow: number, editCol: number): boolean
  {
    const control = this.control;

    control.editCol = editCol;
    control.editRow = editRow;
    control.mouseCol = editCol;
    control.mouseRow = editRow;
    
    this.getCell(editRow, editCol);

    return true;
  }

  private triggerValidateEdit(event: Event, row: number, col: number): boolean
  {
    const params =
      this.event.createParams("ValidateEdit", event, this.coolValidateEdit);

    params.defer = this.coolAfterRowColChange.observers.length ?
      this.options.doubleClickDelay : -1;
    params.defer = this.options.doubleClickDelay;

    const attributes = params.attribute ??= [];

    attributes.push(
      { name: "selectedRows", value: String(row) },
      { name: "row", value: row },
      { name: "col", value: col },
      { name: "editRow", value: row },
      { name: "editCol", value: col },
      { name: "editText", value: this.getCell(row, col)?.value },
      { name: "Row", value: row },
      { name: "Col", value: col });

    this.event.trigger(params);

    return true;
  }

  private triggerCellChanged(event: Event, row: number, col: number): boolean
  {
    if (!this.coolCellChanged.observers.length)
    {
      return false;
    }

    const params =
      this.event.createParams("CellChanged", event, this.coolCellChanged);

    params.defer = this.options.doubleClickDelay;

    params.deduplicate = true;
    params.defer = this.options.doubleClickDelay;
    this.prepare(params);

    params.attribute.push(
      { name: "Row", value: row },
      { name: "Col", value: col });

    this.event.trigger(params);

    return true;
  }

  private triggerAfterEdit(event: Event, row: number, col: number): boolean
  {
    const control = this.control;
    const params =
      this.event.createParams("AfterEdit", event, this.coolAfterEdit);

    control.editCol = -1;
    control.editRow = -1;
    params.deduplicate = true;
    params.defer = this.coolAfterEdit.observers.length ?
      this.options.doubleClickDelay : -1;
    this.prepare(params);

    params.attribute.push(
      { name: "Row", value: row },
      { name: "Col", value: col });

    this.event.trigger(params);

    return true;
  }

  private getCell(cellRow: number, cellCol: number): Cell
  {
    const control = this.control;

    const validPos = (cellCol >= control.fixedCols) &&
      (cellCol < control.cols.length) &&
      (cellRow >= control.fixedRows) &&
      (cellRow < control.rows.length);

    if (!validPos)
    {
      return null;
    }

    const row = control.rows[cellRow] ??= {};
    const cell = (row.cells ??= [])[cellCol] ??= {};

    if (cell.value == null)
    {
      cell.value = "";
    }

    return cell;
  }

  private prepare(params: EventParams): void
  {
    const attributes = params.attribute ??= [];
    const control = this.control;

    attributes.push(
      { name: "mouseCol", value: control.mouseCol },
      { name: "mouseRow", value: control.mouseRow });

    if (control.selectionMode === 3)
    {
      const selectedRows: number[] = [];

      control.rows.forEach(
        (row, index) => row?.selected && selectedRows.push(index));

      if (selectedRows.length)
      {
        attributes.push(
          { name: "selectedRows", value: selectedRows.join(",") });
      }
    }

    if (control.row != null)
    {
      attributes.push({ name: "row", value: control.row });

      if (control.row !== control.rowSel)
      {
        attributes.push({ name: "rowSel", value: control.rowSel });
      }
    }

    if (control.col != null)
    {
      attributes.push({ name: "col", value: control.col });

      if (control.col !== control.colSel)
      {
        attributes.push({ name: "colSel", value: control.colSel });
      }
    }

    if ((control.editCol != null) && (control.editRow != null))
    {
      params.attribute.push(
        { name: "editRow", value: control.editRow },
        { name: "editCol", value: control.editCol });
    }
  }

  private event: EventBase;
  private mousedownTimestamp: number;
}
