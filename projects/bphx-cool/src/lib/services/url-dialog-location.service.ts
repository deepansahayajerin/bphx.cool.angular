import { HttpParams } from "@angular/common/http";
import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { InitAction } from "../api/dialog/init-action";
import { DialogLocation } from "../api/dialog/dialog-location";
import { RequestType } from "../api/client/request-type";

/**
 * Dialog location based on browser's url location.
 */
@Injectable()
export class UrlDialogLocationService implements DialogLocation
{
  /**
   * Sets dialog to auto start when no parameters are passed.
   * `true` by default.
   */
  autoStart = true;

  /**
   * Creates `UrlDialogLocationService` instance.
   * @param location a `Location` instance.
   */
  constructor(public location: Location)
  {
  }

  initState(): InitAction
  {
    const init: InitAction = {};
    let part = 0;
    let isProcedure = true;

    let path = this.location.path();
    const paramsIndex = path.lastIndexOf("?");

    const params = new HttpParams(
    {
      fromString: paramsIndex >= 0 ? path.slice(paramsIndex + 1) : ""
    });

    if (paramsIndex >= 0)
    {
      path = path.slice(0, paramsIndex);
    }

    path.split("/").forEach(item =>
    {
      if (!item)
      {
        return;
      }

      item = decodeURIComponent(item);

      switch(part)
      {
        case 0:
        {
          ++part;

          const index = parseInt(item, 10);

          if (index === index)
          {
            init.index = index;

            return;
          }
        }
        // falls through
        case 1:
        {
          ++part;

          switch(item)
          {
            case "exec":
            {
              init.restart = false;
            }
            // eslint-disable-next-line no-fallthrough
            case "start":
            {
              init.action = RequestType.Start;

              break;
            }
            case "execTran":
            {
              init.restart = false;
            }
            // eslint-disable-next-line no-fallthrough
            case "startTran":
            {
              init.action = RequestType.Start;
              init.displayFirst = false;
              isProcedure = false;

              break;
            }
            case "fork":
            {
              init.action = RequestType.Fork;

              break;
            }
          }

          return;
        }
        case 2:
        {
          ++part;

          if (isProcedure)
          {
            init.procedure = item;
          }
          else
          {
            init.commandLine = item;
          }

          return;
        }
      }
    });

    if (!init.action)
    {
      init.action = init.index != null ? RequestType.Get :
        this.autoStart ? RequestType.Start : null;
    }

    const param = params.get("in");

    if (param)
    {
      try
      {
        init.in = JSON.parse(param);
      }
      catch(e)
      {
        // continue without params
      }
    }

    for(const key of params.keys())
    {
      if (key !== "in")
      {
        if (!init.params)
        {
          init.params = {};
        }

        init.params[key] = params.getAll(key);
      }
    }

    return init;

    // var param = this.location.$location.search().in;
    //
    // self.$location.search("in", null);
    //
    // if (param)
    // {
    //   var input;
    //
    //   try
    //   {
    //     input = JSON.parse(param);
    //   }
    //   catch(e)
    //   {
    //     // continue without params
    //   }
    //
    //   if (input)
    //   {
    //     promise.then(
    //       function()
    //       {
    //         var procedure = self.procedures[0];
    //
    //         if (procedure)
    //         {
    //           if (procedure.in)
    //           {
    //             angular.merge(procedure.in, input);
    //           }
    //           else
    //           {
    //             procedure.in = input;
    //           }
    //         }
    //       });
    //   }
    // }
  }

  setIndex(index: number): void
  {
    this.location.replaceState(String(index));
  }
}
