import { Locale } from "../locale";
import { formatDate } from "./format-date";

type Params = Parameters<typeof formatDate>;
type Result = ReturnType<typeof formatDate>;

const he: Locale =
{
  shortMonths:
  [
    "ינו", "פבר", "מרץ",
    "אפר", "מאי", "יונ",
    "יול", "אוג", "ספט",
    "אוק", "נוב", "דצמ"
  ]
};

const data: [Params, Result][] =
[
  [[ "2019-05-30", "dd/MM/yyyy" ], "30/05/2019"],
  [[ "2019-05-30", "dd-MMM-yyyy" ], "30-May-2019"],
  [[ "2019-05-30", "dd MMM yyyy", true, he ], "30 מאי 2019"],
  [[ "13:45:00", "HH:mm" ], "13:45"],
  [[ "13:45:00", "hh:mm" ], "01:45"],
  [[ "00:00:00", "HH:mm", true ], ""],
  [[ "2020-12-15T08:03:14.000009", "yyyy-MM-dd-HH.mm.ss.zzzzzz", true], "2020-12-15-08.03.14.000009"],
  [[ "2020-12-15T08:03:14.00009", "yyyy-MM-dd-HH.mm.ss.zzzzzz", true], "2020-12-15-08.03.14.000009"],
  [[ "2020-12-15T08:03:14.00009", "yyyy-MM-dd-HH.mm.ss.zzzzz", true], "2020-12-15-08.03.14.00009"],
  [[ "2002-05-12", "MM/dd"], "05/12"]
];

describe("formatDate", () =>
{
  it("formats according to patterns", () =>
  {
    data.forEach(item =>
    {
      expect(formatDate(...item[0])).toBe(item[1]);
    });
  });
});
