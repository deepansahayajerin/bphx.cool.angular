import { MessagesService } from "./messages.service";

describe("MessagesService", () =>
{
  it("returns messages", () =>
  {
    const service = new MessagesService();

    for(const name in service.resources.DEFAULT)
    {
      expect(service.getMessage(name)).
        toBe(service.resources.DEFAULT[name]);
    }

    const result = service.format("Invalid value {0}.", 3.7);

    expect(result).toBe("Invalid value 3.7.");
  });
});
