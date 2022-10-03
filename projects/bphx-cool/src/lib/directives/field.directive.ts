import { Directive, Input, ElementRef, Attribute } from "@angular/core";
import { Inject, OnInit, OnChanges, OnDestroy } from "@angular/core";
import { Self, Optional } from "@angular/core";
import { Control } from "../api/client/control";
import { Video } from "../api/client/video";
import { ModelAccessor } from "../api/model-accessor";
import { MODEL_ACCESSOR } from "../api/model-accessor";
import { Field, FIELD_ACCESSOR } from "../api/dialog/field";
import { View, VIEW_ACCESSOR } from "../api/dialog/view";
import { Prompt } from "../api/dialog/prompt";
import { Renderer, RENDERER_ACCESSOR } from "../api/renderer";
import { isReadonly } from "../api/utils";

/**
 * A field directive.
 */
@Directive(
{
  selector: "[coolType],[coolVideo]",
  exportAs: "field",
  providers: [ { provide: FIELD_ACCESSOR, useExisting: FieldDirective } ]
})
export class FieldDirective
  implements Field, OnDestroy, OnInit, OnChanges
{
  /**
   * Creates a FieldDirective.
   * @param element an element refernece.
   * @param coolType a field type.
   * @param coolName optional control name.
   * @param modelAccessor optional model accessor.
   * @param renderer a renderer service.
   * @param view `View` reference.
   */
  constructor(
    public element: ElementRef<HTMLElement>,
    @Attribute("coolType")
    public coolType: string|null,
    @Attribute("coolName")
    public coolName: string|null,
    @Self() @Optional() @Inject(MODEL_ACCESSOR)
    public modelAccessor: ModelAccessor,
    @Inject(RENDERER_ACCESSOR) public renderer: Renderer,
    @Inject(VIEW_ACCESSOR) public view: View)
  {
    this.focus = this.focus.bind(this);
    this.update = this.update.bind(this);
    this.refresh = this.refresh.bind(this);

    view.fields?.set(element.nativeElement, this);
    this.defaultVideo = this.renderer.getVideo(this);

    if (modelAccessor)
    {
      modelAccessor.onReady(() =>
      {
        const model = modelAccessor.model;

        if (!model)
        {
          return;
        }

        if (coolName)
        {
          if (!model.name)
          {
            model.name = coolName;
          }
        }
        else
        {
          const name = model.name ??
            element.nativeElement.getAttribute("name");

          if (name)
          {
            this.coolName = name;
            this.element.nativeElement.setAttribute("coolName", name);
          }
        }

        this.view.form?.addControl(model);

        model.update.subscribe(() => this.update?.(false));
        model.control.registerOnDisabledChange(() => this.update?.(false));
        Promise.resolve().then(() => this.update?.(true));
      });
    }
    else
    {
      if (!coolName)
      {
        const name = element.nativeElement.getAttribute("name");

        if (name)
        {
          this.coolName = name;
          element.nativeElement.setAttribute("coolName", name);
        }
      }
    }
  }

  ngOnDestroy(): void
  {
    const model = this.modelAccessor?.model;

    if (model)
    {
      this.view.form?.removeControl(model);
    }

    this.view.fields?.delete(this.element.nativeElement);
  }

  ngOnInit(): void
  {
    this.initialized = true;

    if (!this.modelAccessor)
    {
      this.update?.(true);
    }
  }

  ngOnChanges(): void
  {
    if (this.initialized)
    {
      this.refresh?.(false);
    }
  }

  /**
   * A field type.
   */
  readonly type = "field";

  /**
   * Optional video attributes.
   */
  @Input()
  coolVideo?: Video|null;

  /**
   * A disabled indicator.
   */
  @Input()
  disabled: boolean|null = null;

  /**
   * Readonly indicator.
   */
  get readonly(): boolean|null
  {
    return isReadonly(this.modelAccessor?.element?.nativeElement);
  }

  /**
   * Optional prompt element.
   */
  @Input()
  get coolPrompt(): Prompt|null
  {
    return this.prompt;
  }

  /**
   * Sets `Prompt`
   */
  set coolPrompt(value: Prompt|null)
  {
    if (value !== this.prompt)
    {
      if (this.prompt?.coolFor === this)
      {
        this.prompt.coolFor = null;
      }

      this.prompt = value;

      if (value)
      {
        value.coolFor = this;
      }
    }
  }

  /**
   * A default field indicator.
   */
  @Input()
  get coolDefault(): boolean
  {
    return this.isDefault;
  }

  /**
   * Sets default indicator.
   */
  set coolDefault(value: unknown)
  {
    const isDefault =
      (value == true) || (value === "true") || (value === 1) || (value === "");

    if (isDefault !== this.isDefault)
    {
      this.isDefault = isDefault;

      if (isDefault)
      {
        this.view.defaultField = this;
      }
      else
      {
        if (this.view.defaultField === this)
        {
          this.view.defaultField = null;
        }
      }
    }
  }

  /**
   * Original tabindex.
   */
  @Input()
  tabindex?: number|null;

  /**
   * Gets control digest.
   */
  control?: Control = { name: null, value: null };

  /**
   * Default video attributes.
   */
  defaultVideo?: Video;

  /**
   * Optional field items.
   */
  items?: unknown = empty;

  /**
   * A line height.
   */
  get lineHeight(): number
  {
    if (this.lineHeightValue == null)
    {
      const element = this.element.nativeElement;
      const document = element.ownerDocument;
      const div = document.createElement("div");

      div.setAttribute("style", "position: absolute; visibility: hidden");
      div.innerText = "Wg";
      element.appendChild(div);

      try
      {
        this.lineHeightValue = div.getBoundingClientRect().height;
      }
      finally
      {
        element.removeChild(div);
      }
    }

    return this.lineHeightValue;
  }

  /**
   * Returns a value inicating whether control's model has any data items:
   * `true` if model has data items, and `false` otherwise.
   */
  get hasData(): boolean
  {
    if (Array.isArray(this.items) && (this.items !== empty))
    {
      return !!this.items.length;
    }

    const modelAccessor = this.modelAccessor;
    const modelElement = modelAccessor?.element.nativeElement;

    if (modelElement instanceof HTMLInputElement)
    {
      switch(modelElement.type)
      {
        case "checkbox":
        case "radio":
        {
          return modelElement.checked;
        }
      }
    }

    const value = modelAccessor?.value;

    if ((value == null) || (value === 0) || (value === ""))
    {
      return false;
    }

    return true;
  }

  /**
   * Indicates whether control's model has exactly one item selected:
   *   `true` if model has exactly one item selected, and `false` otherwise.
   */
  get hasOneSelected(): boolean
  {
    const modelAccessor = this.modelAccessor;
    const value = modelAccessor?.value;

    if (value == null)
    {
      return false;
    }

    return !Array.isArray(value) || (value.length === 1);
  }

  /**
   * Inicates whether control's model has many items selected:
   *   `true` if model has many items selected, and `false` otherwise.
   */
  get hasManySelected(): boolean
  {
    const modelAccessor = this.modelAccessor;
    const value = modelAccessor?.value;

    if (value == null)
    {
      return false;
    }

    return Array.isArray(value) && (value.length > 1);
  }

  /**
   * Inicates whether control's model has no items selected:
   *   `true` if model has no items selected, and `false` otherwise.
   */
  get hasNoneSelected(): boolean
  {
    const value = this.modelAccessor?.value;

    if (value == null)
    {
      return true;
    }

    return Array.isArray(value) && !value.length;
  }

  /**
   * Inicates whether control's value is selected into the model:
   *   `true` if value is selected into the model, and `false` otherwise.
   */
  get isOn(): boolean
  {
    return this.modelAccessor?.value === "on";
  }

  /**
   * Focuses a field.
   */
  focus(): boolean
  {
    return this.renderer.focus(this);
  }

  /**
   * Updates field.
   * @param init true to initial, and false to next update.
   */
  update(init: boolean): void
  {
    const modelAccessor = this.modelAccessor;
    const model = modelAccessor?.model;

    if (modelAccessor && !model)
    {
      return;
    }

    const view = this.view;
    const value = modelAccessor?.value;

    if (modelAccessor && init)
    {
      modelAccessor.initialValue = value;
    }

    const window = view.coolWindow;
    const name = this.coolName;

    const control = name && window?.controls ?
      window.controls[name] ?? (window.controls[name] = { name }) :
      { name };

    control.field = this;
    this.control = control;
    this.lineHeightValue = null;

    control.disabledState = this.disabled;

    const emptyValue = (value == null) || Array.isArray(value);

    if ((control.value == null) || !emptyValue)
    {
      control.value = emptyValue ? null : String(value);
    }

    // if (modelAccessor)
    // {
    //   const element = this.element.nativeElement;

    //   if ((this.coolType === "COMBGRP") &&
    //     ((element as HTMLSelectElement).selectedIndex === -1))
    //   {
    //     model.viewToModelUpdate(value);
    //   }
    // }

    this.refresh?.(init);
  }

  /**
   * Optional refresh function.
   * @param init true to initial, and false to next update.
   * @returns `true` to call default implementation.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refresh(init: boolean): boolean
  {
    this.renderer.render(this);

    return true;
  }

  /**
   * A line height value.
   */
  private lineHeightValue: number = null;

  /**
   * A `Prompt` instance.
   */
  private prompt: Prompt|null;

  /**
   * Default field indicator.
   */
  private isDefault = false;

  /**
   * Initialized indicator.
   */
  private initialized: boolean;
}

/**
 * Empty items marker.
 */
const empty: unknown = [];
