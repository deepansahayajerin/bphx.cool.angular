import { Locale } from "../locale";
import { toDateString } from "../utils";
import { parseDate } from "./parse-date";

type Params = Parameters<typeof parseDate>;
type Result = ReturnType<typeof parseDate>;

const ru: Locale =
{
  shortMonths:
  [
    "Янв", "Фев", "Мар",
    "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен",
    "Окт", "Ноя", "Дек"
  ]
};

const locale: Locale =
{
  centuryOffset: 1970
};

const data: [Params, Result][] =
[
  [[ "30/05/2019", "dd/MM/yyyy" ], "2019-05-30"],
  [[ "30 Май 2019", "dd MMM yyyy", true, ru ], "2019-05-30"],
  [[ "13:45", "HH:mm" ], "13:45:00"],
  [[ "01:45", "HH:mm" ], "01:45:00"],
  [[ "", "HH:mm", true ], null],
  [[ "0145", "HHmm" ], "01:45:00"],
  [[ "145", "HHmm" ], undefined],
  [[ "041620", "MMddyy", true, locale], "2020-04-16"],
  [[ "2020-12-15-08.03.14.000009", "yyyy-MM-dd-HH.mm.ss.zzzzzz", true], "2020-12-15T08:03:14.000009"],
  [[ "2020-12-15-08.03.14.00009", "yyyy-MM-dd-HH.mm.ss.zzzzz", true], "2020-12-15T08:03:14.00009"],
  [[ "2020-12-15-08.03.14.00009", "yyyy-MM-dd-HH.mm.ss.zzzzz", true], "2020-12-15T08:03:14.00009"],
  [[ "05/12", "MM/dd"], toDateString({ year: new Date().getUTCFullYear(), month: 5, day: 12})]
];

describe("parseDate", () =>
{
  it("parses according to patterns", () =>
  {
    data.forEach(item =>
    {
      expect(parseDate(...item[0])).toBe(item[1]);
    });
  });
});
