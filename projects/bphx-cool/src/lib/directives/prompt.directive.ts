import { Directive, ElementRef, Input, Inject } from "@angular/core";
import { OnInit } from "@angular/core";
import { Video } from "../api/client/video";
import { Field } from "../api/dialog/field";
import { Renderer, RENDERER_ACCESSOR } from "../api/renderer";
import { Prompt } from "../api/dialog/prompt";
import { View, VIEW_ACCESSOR } from "../api/dialog/view";

@Directive({ selector: "[coolPrompt],[coolFor]" })
export class PromptDirective implements Prompt, OnInit
{
  /**
   * A prompt type.
   */
  readonly type = "prompt";

  /**
   * Default video attributes.
   */
  defaultVideo?: Video;

  /**
   * Optional field reference.
   */
  @Input()
  get coolFor(): Field|null
  {
    return this.field;
  }

  /**
   * Sets `Field` reference.
   */
  set coolFor(value: Field|null)
  {
    if (value !== this.field)
    {
      if (this.field?.coolPrompt === this)
      {
        this.field.coolPrompt = null;
      }

      this.field = value;

      if (value)
      {
        value.coolPrompt = this;
      }
    }
  }

  /**
   * Creates a `PromptDirective` instance.
   * @param element a prompt element reference.
   * @param view a `View` reference.
   * @param renderer a renderer service.
   */
  constructor(
    public element: ElementRef<HTMLElement>,
    @Inject(VIEW_ACCESSOR)
    public view: View,
    @Inject(RENDERER_ACCESSOR)
    public renderer: Renderer)
  {
    element.nativeElement.setAttribute("coolPrompt", "");
  }

  ngOnInit(): void
  {
    if (!this.coolFor)
    {
      this.defaultVideo = this.renderer.getVideo(this);
      this.renderer.render(this);
    }
  }

  /**
   * A `Field` reference.
   */
  private field: Field|null;
}
