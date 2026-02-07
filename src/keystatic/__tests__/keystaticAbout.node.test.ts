import { describe, expect, it } from "vitest";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../../keystatic.config";
import { GET } from "@/app/api/keystatic/singleton/[singleton]/route";

describe("Keystatic about singleton", () => {
  it("reader can load about and calendar.link exists", async () => {
    const reader = createReader(process.cwd(), keystaticConfig);
    const about = await reader.singletons.about.read();
    expect(about).toBeTruthy();
    expect(typeof about?.calendar?.link).toBe("string");
  });

  it("API /api/keystatic/singleton/about returns JSON entry", async () => {
    const res = await GET(new Request("http://localhost/api/keystatic/singleton/about") as any, {
      params: Promise.resolve({ singleton: "about" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toBeTruthy();
    expect(typeof json.calendar?.link).toBe("string");
  });
});
