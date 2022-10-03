import { Injectable } from "@angular/core";
import { Video } from "../api/client/video";
import { Prompt } from "../api/dialog/prompt";
import { Field } from "../api/dialog/field";
import { Highlighting } from "../api/client/highlighting";
import { Intensity } from "../api/client/intensity";
import { toBoolean, isSelect, nodeName, focusable } from "../api/utils";
import { supportsReadonly, bgr, toColor } from "../api/utils";
import { Renderer } from "../api/renderer";
import { ProcedureType } from "../api/client/procedure-type";

/**
 * A field and prompt renderer.
 */
@Injectable()
export class RendererService implements Renderer
{
  /**
   * Renders field or prompt.
   * @param instance a field or prompt to render.
   */
  render(instance: Field|Prompt): void
  {
    const [field, prompt] = instance.type === "field" ?
      [instance, null] : [null, instance];
    const element = instance.element.nativeElement;
    const view = instance.view;
    const control = field?.control;
    const modelAccessor = field?.modelAccessor;
    const model = modelAccessor?.model;
    const modelElement = modelAccessor?.element?.nativeElement;
    const promptElement = field ?
      field.coolPrompt?.element.nativeElement :
      prompt.element.nativeElement;
    let tabindexElement = field && (modelElement || element);
    const defaultVideo = instance.defaultVideo;

    const video = !defaultVideo ? field?.coolVideo ?? {} :
      !field?.coolVideo ? defaultVideo :
      {
        color: defaultVideo.color,
        backgroundColor: defaultVideo.backgroundColor,
        ...field.coolVideo
      };

    const readonly = control?.readOnly || video?.protected;
    const controlDisabled = control?.disabled;
    const modelDisabled = model?.isDisabled;
    const fieldDisabled = field?.disabled;
    const disabled = controlDisabled ||
      (modelDisabled ?? fieldDisabled ?? controlDisabled ?? false);

    const zeroSized = control &&
      ((typeof control.height === "number" ?
        control.height === 0 : parseInt(control.height, 10) === 0) ||
      (typeof control.width === "number" ?
        control.width === 0 : parseInt(control.width, 10) === 0)) &&
      !isSelect(modelElement || element);

    const visible = !control || (control.visible !== false);
    const disabledInactiveOrInvisible = disabled ||
      !view.active || !visible || zeroSized;
    const immutable = disabledInactiveOrInvisible || readonly;
    const resetTabindex = disabledInactiveOrInvisible ||
      (readonly && (nodeName(tabindexElement) !== "textarea"));

    if (field)
    {
      const attributeElement = modelElement ?? element;
      const hasReadonly = supportsReadonly(attributeElement);

      if (hasReadonly)
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (attributeElement as any).readOnly = readonly;
      }

      if (modelDisabled == null)
      {
        if (disabled || !hasReadonly && readonly)
        {
          attributeElement.setAttribute("disabled", "disabled");
        }
        else
        {
          attributeElement.removeAttribute("disabled");
        }
      }
      else if (controlDisabled)
      {
        attributeElement.setAttribute("disabled", "disabled");
      }
      // No more cases

      if (immutable && modelAccessor?.requiredValidator)
      {
        modelAccessor.requiredValidator.required = false;
      }
    }

    if (visible && !zeroSized)
    {
      element.classList.remove("coolHidden");
    }
    else
    {
      element.classList.add("coolHidden");
    }

    if (promptElement)
    {
      if (visible)
      {
        promptElement.classList.remove("coolHidden");
      }
      else
      {
        promptElement.classList.add("coolHidden");
      }
    }

    if (promptElement)
    {
      if (control?.caption != null)
      {
        promptElement.textContent = control.caption;
      }

      const color = bgr(control?.promptForegroundColor) ||
        promptElement.getAttribute("coolColor");
      const backgroundColor = bgr(control?.promptBackgroundColor) ||
        promptElement.getAttribute("coolBackground");

      if (color)
      {
        promptElement.style.color = toColor(color);
      }

      if (backgroundColor)
      {
        promptElement.style.backgroundColor = toColor(backgroundColor);
      }
    }

    if (control)
    {
      let foreground = bgr(control.foregroundColor) || video.color;
      let background = bgr(control.backgroundColor) || video.backgroundColor;

      if (video.highlighting === Highlighting.ReverseVideo)
      {
        const color = foreground;

        foreground = background;
        background = color;
      }

      switch(background)
      {
        case -1:
        {
          if (!readonly)
          {
            video.color = "readonly";
          }

          break;
        }
        case -2:
        {
          if (!disabled)
          {
            video.color = "disabled";
          }

          break;
        }
      }

      element.style.color = toColor(foreground);
      element.style.backgroundColor = toColor(background);

      if (control.bitmapBackground)
      {
        element.style.backgroundImage =
          this.toImageUrl(control.bitmapBackground);
      }

      if (control.fontSize)
      {
        element.setAttribute("coolFontSize", control.fontSize);
      }

      if (control.fontStyle)
      {
        element.setAttribute("coolFontStyle", control.fontStyle);
      }

      if (control.fontType)
      {
        element.setAttribute("coolFontType", control.fontType);
      }

      switch(field.coolType)
      {
        case "CHKBOX":
        case "RDBTNOC":
        {
          if (control.caption !== undefined)
          {
            const text = element.querySelector("span,div");

            this.renderCaption(text, control.caption);
          }

          break;
        }
        case "MENUITEM":
        {
          const accesskey = element.getAttribute("coolAccesskey");
          const caption = control.caption;

          if (accesskey || (caption !== undefined))
          {
            const a = element.querySelector("a");

            if (a)
            {
              if (caption !== undefined)
              {
                this.renderCaption(a, caption);
              }

              if (accesskey && !a.querySelector(".accesskey"))
              {
                const span = a.ownerDocument.createElement("span");

                span.className = "accesskey";
                span.textContent = accesskey;
                a.appendChild(span);
              }
            }
          }

          break;
        }
        case "PUSHBTN":
        {
          const accesskey = element.getAttribute("coolAccesskey");
          const caption = control.caption;

          if ((accesskey || (caption !== undefined)) &&
            (nodeName(element) === "button"))
          {
            if (caption !== undefined)
            {
              this.renderCaption(element, caption);
            }

            if (accesskey && !element.querySelector(".accesskey"))
            {
              const span = element.ownerDocument.createElement("span");

              span.className = "accesskey";
              span.textContent = accesskey;
              element.appendChild(span);
            }
          }

          break;
        }
        case "STNDLST":
        {
          tabindexElement = null;

          if (!visible || zeroSized)
          {
            element.parentElement.classList.add("coolHidden");
          }
          else
          {
            element.parentElement.classList.remove("coolHidden");
          }

          if (resetTabindex || (field.tabindex == null))
          {
            element.removeAttribute("tabindex");
          }
          else
          {
            element.setAttribute("tabindex", String(field.tabindex));
          }

          if (resetTabindex && modelElement)
          {
            const row = modelElement.querySelector(
              "tr[tabindex]:not([tabindex='-1']):not([disabled])");

            if (row)
            {
              row.removeAttribute("tabindex");
            }
          }

          break;
        }
        case "TABSET":
        {
          // TODO: check bootstrap.
          tabindexElement = null;

          const tabs = element.querySelectorAll(".uibTab");

          if (tabs && tabs.length)
          {
            for(let i = 0, c = tabs.length; i < c; i++)
            {
              const tabElement = tabs[i];
              const a = tabElement.querySelector("a");
              const heading = a && a.querySelector("uib-tab-heading");
              const index = tabElement.getAttribute("index");
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tab = control && (control as any).tabs &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (control as any).tabs[index];

              if (a)
              {
                a.tabIndex = -1;

                if (heading && tab && (tab.caption !== undefined))
                {
                  this.renderCaption(heading, tab.caption);
                }
              }
            }
          }

          break;
        }
        case "WINLIT":
        {
          if (control.value != null)
          {
            element.textContent = control.value;
          }

          break;
        }
        case "WNGROUP":
        {
          const legend: HTMLElement =
            element.querySelector("fieldset > legend");

          if (legend)
          {
            if (control.caption != null)
            {
              legend.textContent = control.caption;
            }

            const color = bgr(control.foregroundColor) ||
              legend.getAttribute("coolColor") ||
              video.color;

            if (color)
            {
              legend.style.color = toColor(color);
            }
          }

          break;
        }
      }
    }

    if (tabindexElement)
    {
      const tabIndex = resetTabindex ? -1 :
        modelAccessor?.tabIndex ?? field.tabindex;

      if (tabIndex == null)
      {
        tabindexElement.removeAttribute("tabindex");
      }
      else
      {
        tabindexElement.setAttribute("tabindex", String(tabIndex));
      }
    }

    this.setVideo(instance, video, defaultVideo);
  }

  /**
   * Renders caption over element, substitutes '&' as shortcut.
   * @param element - optional caption element.
   * @param caption - a capion string.
   */
  renderCaption(element: Element, caption?: string): void
  {
    const p = caption.indexOf("&");

    if (p === -1)
    {
      element.textContent = caption;
    }
    else
    {
      const pre = escapeText(caption.substring(0, p));
      const shortcut = escapeText(caption[p + 1] || "");
      const post = escapeText(caption.substring(p + 2));

      element.innerHTML =
        `${pre}<u coolShortcut='${shortcut}'>${shortcut}</u>${post}`;
    }
  }

  /**
   * Collects video attributes.
   * @param instance a field or prompt instance.
   * @returns a video attributes, if any.
   */
  getVideo(instance: Field|Prompt): Video | null
  {
    const field = instance.type === "field" ? instance : null;
    const element = instance.element.nativeElement;
    const error = toBoolean(element.getAttribute("coolError")) && true;
    const focused = toBoolean(element.getAttribute("coolFocus")) && true;
    const protection = field &&
      toBoolean(element.getAttribute("coolReadonly")) && true;
    const intensity = element.getAttribute("coolIntensity") as Intensity;
    const color = element.getAttribute("coolColor") ;
    const backgroundColor = element.getAttribute("coolBackground");
    const highlight = element.getAttribute("coolHighlight") as Highlighting;

    if ((error === undefined) &&
      (focused === undefined) &&
      (protection === undefined) &&
      (intensity === undefined) &&
      (color === undefined) &&
      (backgroundColor === undefined) &&
      (highlight === undefined))
    {
      return null;
    }

    const video: Video =
    {
      error,
      focused,
      protected: protection,
      intensity,
      color,
      backgroundColor,
      highlighting: highlight
    };

    return video;
  }

  /**
   * Sets video attribute.
   * @param instance a field or prompt instance to set video attribute.
   * @param video a video attributes, if any.
   * @param defaultVideo optional default video attributes.
   */
  setVideo(
    instance: Field|Prompt,
    video: Video | null,
    defaultVideo?: Video | null): void
  {
    if (!video)
    {
      video = defaultVideo;

      if (!video)
      {
        return;
      }
    }

    const field = (instance.type === "field") && instance;
    const element = instance.element.nativeElement;

    const focused =
      (video === defaultVideo) || (video.focused == null) ?
        defaultVideo?.focused ? 1 : 0 :
        video.focused ? 2 : 0;

    if (video.error)
    {
      element.setAttribute("coolError", "1");
    }
    else
    {
      element.removeAttribute("coolError");
    }

    if (focused)
    {
      element.setAttribute("coolFocus", String(focused));
    }
    else
    {
      element.removeAttribute("coolFocus");
    }

    if (video.intensity)
    {
      element.setAttribute("coolIntensity", video.intensity);
    }
    else
    {
      element.removeAttribute("coolIntensity");
    }

    if (video.color)
    {
      element.setAttribute("coolColor", video.color);
    }
    else
    {
      element.removeAttribute("coolColor");
    }

    if (video.highlighting)
    {
      element.setAttribute("coolHighlight", video.highlighting);
    }
    else
    {
      element.removeAttribute("coolHighlight");
    }

    if (field?.view?.coolProcedure?.type === ProcedureType.Online)
    {
      const protection = video.protected;

      if (protection)
      {
        element.setAttribute("coolReadonly", "1");
      }
      else
      {
        element.removeAttribute("coolReadonly");
      }

      field?.modelAccessor?.model?.valueAccessor?.
        setDisabledState?.(protection);
    }
  }

  /**
   * Creates image url.
   * @param name an image name.
   * @returns an image url.
   */
  toImageUrl(name: string): string
  {
    if (!name)
    {
      return null;
    }

    const p = name.lastIndexOf(".");

    if (p >= 0)
    {
      name = name.substring(p);
    }

    return `assets/images/${name.toLowerCase()}.png`;
  }

  /**
   * Focuses a field.
   * @param field a field to focus.
   * @returns `true` when focus is handled.
   */
  focus(field: Field): boolean
  {
    if (!field)
    {
      return false;
    }

    const activeElement = document.activeElement;

    if (field === field?.view?.dialog.getField(activeElement))
    {
      return;
    }

    let element = field.element.nativeElement;

    try
    {
      switch(field.coolType)
      {
        case "TABSET":
        {
          element = element.querySelector(".uibTab.active a") || element;

          break;
        }
        case "MENUITEM":
        {
          const a = element.querySelector("a");

          if (a && (!activeElement || !a.contains(activeElement)))
          {
            a.focus({ preventScroll : true });
          }

          return;
        }
        case "CHKBOX":
        case "RDBTNOC":
        {
          element =
            field.modelAccessor?.element.nativeElement || element;

          break;
        }
      }

      if (element)
      {
        if (!focusable(element) && !element.hasAttribute("tabindex"))
        {
          element.setAttribute("tabindex", "-1");
        }

        element.focus({ preventScroll : true });

        if (document.activeElement !== element)
        {
          if (document.activeElement)
          {
            (document.activeElement as HTMLElement).blur();
          }

          field.view.element.nativeElement.focus({ preventScroll : true });
        }
        else
        {
          element.dispatchEvent(
            new FocusEvent("focusin", { bubbles: true, cancelable: true }));
        }
      }
    }
    catch(e)
    {
      // Continie.
    }

    return true;
  }
}

const re1 = /&/g;
const re2 = /</g;
const re3 = /"/g;
const re4 = /\r\n|\r|\n/g;

function escapeText(text: string): string
{
  return text.
    replace(re1, "&amp;").
    replace(re2, "&lt;").
    replace(re3, "&quot;").
    replace(re4, "\n");
}
