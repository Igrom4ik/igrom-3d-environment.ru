import { describe, it, expect } from "vitest";
import { parseTimeframeToSerialized, formatSerializedToTimeframe } from "../timeframe";

describe("timeframe utils", () => {
  it("parses month-year range with present", () => {
    const val = parseTimeframeToSerialized("Дек 2023 - Наст. время");
    expect(val.present).toBe(true);
    expect(val.start).toBe("01.12.2023");
    expect(val.end).toBeNull();
  });

  it("parses month-year range start-end", () => {
    const val = parseTimeframeToSerialized("Янв 2020 - Мар 2021");
    expect(val.present).toBe(false);
    expect(val.start).toBe("01.01.2020");
    expect(val.end).toBe("01.03.2021");
  });

  it("formats serialized to timeframe string", () => {
    const s = formatSerializedToTimeframe({ start: "01.12.2023", end: null, present: true });
    expect(s).toBe("Дек 2023 - Наст. время");
  });
});
