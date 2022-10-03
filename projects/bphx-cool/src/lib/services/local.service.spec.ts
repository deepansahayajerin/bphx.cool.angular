import { JsonObject } from "./../../../../../target/classes/projects/bphx-cool/src/lib/api/json";
import { LocalService } from "./local.service";

describe("LocalService", () =>
{
  it("should be created an destoryed", () =>
  {
    const service = new LocalService(document);

    expect(service).toBeTruthy();

    service.ngOnDestroy();
  });

  it("value should be reflected on local storage", () =>
  {
    const service = new LocalService(document);
    const data = service.get("my-value", {} as JsonObject);

    data.x = 5;
    service.save();

    const result = JSON.parse(window.localStorage.getItem("my-value"));

    expect(() => result).toBeTruthy();
    expect(result.x).toBe(5);

    data.x = 7;
    service.save();

    const result2 = JSON.parse(window.localStorage.getItem("my-value"));

    expect(result2).toBeTruthy();
    expect(result2.x).toBe(7);

    service.ngOnDestroy();
  });
});
