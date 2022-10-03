import { JsonObject } from "../api/json";
import { SessionService } from "./session.service";

describe("SessionService", () =>
{
  it("should be created an destoryed", () =>
  {
    const service = new SessionService(document);

    expect(service).toBeTruthy();

    service.ngOnDestroy();
  });

  it("value should be reflected on session storage", () =>
  {
    const service = new SessionService(document);
    const data = service.get("my-session", {} as JsonObject);

    data.y = 1;
    service.save();

    const result = JSON.parse(window.sessionStorage.getItem("my-session"));

    expect(() => result).toBeTruthy();
    expect(result.y).toBe(1);

    data.y = 2;
    service.save();

    const result2 = JSON.parse(window.sessionStorage.getItem("my-session"));

    expect(result2).toBeTruthy();
    expect(result2.y).toBe(2);

    service.ngOnDestroy();
  });
});
