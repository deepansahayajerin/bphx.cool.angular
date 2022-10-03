import { DatePipe } from "./date.pipe";
import { Locale } from "../api/locale";

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

describe("DatePipe", () =>
{
  it("formats date with default locale", async () =>
  {
    const pipe = new DatePipe();

    await expect(pipe.transform("2019-05-30", "dd/MM/yyyy")).
      toBe("30/05/2019");
  });

  it("formats date with custom locale", async () =>
  {
    const pipe = new DatePipe(he);

    await expect(pipe.transform("2019-05-30", "dd MMM yyyy")).
      toBe("30 מאי 2019");
  });
});
