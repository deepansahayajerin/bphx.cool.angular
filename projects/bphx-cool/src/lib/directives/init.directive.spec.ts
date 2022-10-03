import { EventEmitter } from "@angular/core";
import { InitDirective } from "./init.directive";
import { View } from "../api/dialog/view";

describe("InitDirective", () =>
{
  it("recalculates data", async () =>
  {
    const view = { coolProcedure: {}, update: new EventEmitter<View>() };
    const init = new InitDirective(view as View);
    let i = 0;

    init.init.subscribe(() => ++i);
    init.ngOnInit();

    await new Promise(resolve => window.setTimeout(resolve, 100));
    await expect(i).toBe(1);


    init.update(true);

    await new Promise(resolve => window.setTimeout(resolve, 100));
    await expect(i).toBe(2);

    view.coolProcedure = {};
    view.update.emit(view as View);

    await new Promise(resolve => window.setTimeout(resolve, 100));
    await expect(i).toBe(3);
  });
});
