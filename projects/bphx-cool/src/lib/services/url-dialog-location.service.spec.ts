import { Location } from "@angular/common";
import { TestBed } from "@angular/core/testing";

import { UrlDialogLocationService } from "./url-dialog-location.service";
import { InitAction } from "../api/dialog/init-action";
import { RequestType } from "../api/client/request-type";
import { DIALOG_LOCATION_ACCESSOR } from "../api/dialog/dialog-location";

class TestLocation
{
  currentPath: string;

  path(includeHash?: boolean): string
  {
    return this.currentPath || "";
  }

  replaceState(path: string, query?: string, state?: any)
  {
    this.currentPath = path || "";
  }
}

describe("UrlDialogLocationService", () =>
{
  beforeEach(() => TestBed.configureTestingModule(
    {
      providers:
        [
          { provide: Location, useClass: TestLocation },
          { provide: DIALOG_LOCATION_ACCESSOR, useClass: UrlDialogLocationService }
        ]
    }));

  it("starts by default", () =>
  {
    const service = TestBed.inject(DIALOG_LOCATION_ACCESSOR);

    expect(service).toBeTruthy();

    const init1 = service.initState();

    expect(init1).toEqual({ action: RequestType.Start } as InitAction);
  });

  it("starts if explicitly requested", () =>
  {
    const location = TestBed.inject(Location) as any as TestLocation;

    location.currentPath = "start";

    const service =
      TestBed.inject(DIALOG_LOCATION_ACCESSOR);

    expect(service).toBeTruthy();

    const init1 = service.initState();

    expect(init1).toEqual({ action: RequestType.Start } as InitAction);
  });

  it("starts a procedure if explicitly requested", () =>
  {
    const location = TestBed.inject(Location) as any as TestLocation;

    location.currentPath = "start/MyProcedure";

    const service = TestBed.inject(DIALOG_LOCATION_ACCESSOR);

    expect(service).toBeTruthy();

    const init1 = service.initState();

    expect(init1).toEqual(
    {
      action: RequestType.Start,
      procedure: "MyProcedure"
    } as InitAction);
  });

  it("gets state if there is an index", () =>
  {
    const location = TestBed.inject(Location) as any as TestLocation;

    location.currentPath = "3";

    const service = TestBed.inject(DIALOG_LOCATION_ACCESSOR);

    expect(service).toBeTruthy();

    const init1 = service.initState();

    expect(init1).toEqual(
    {
      action: RequestType.Get,
      index: 3
    } as InitAction);
  });

  it("forks state", () =>
  {
    const location = TestBed.inject(Location) as any as TestLocation;

    location.currentPath = "5/fork";

    const service = TestBed.inject(DIALOG_LOCATION_ACCESSOR);

    expect(service).toBeTruthy();

    const init1 = service.initState();

    expect(init1).toEqual(
    {
      action: RequestType.Fork,
      index: 5
    } as InitAction);
  });

  it("sets index", () =>
  {
    const location = TestBed.inject(Location) as any as TestLocation;

    location.currentPath = "start";

    const service = TestBed.inject(DIALOG_LOCATION_ACCESSOR);

    expect(service).toBeTruthy();

    service.setIndex(7);

    expect(location.currentPath).toEqual("7");
  });
});
