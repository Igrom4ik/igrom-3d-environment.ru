import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkPeriodPicker } from "../WorkPeriodPicker";
import { formatRuDate, todayDay } from "@/utils/workPeriod";
import { addDays } from "date-fns";

describe("WorkPeriodPicker", () => {
  it("renders start and end placeholders", () => {
    render(<WorkPeriodPicker aria-label="period" />);
    expect(screen.getByText("Начало")).toBeInTheDocument();
    expect(screen.getByText("Конец")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("selects start and end date via mouse clicks", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<WorkPeriodPicker aria-label="period" onChange={handleChange} />);

    const buttons = screen.getAllByRole("gridcell");
    const firstDay = buttons.find((b) => b.textContent === "5" && b.getAttribute("aria-disabled") !== "true");
    const secondDay = buttons.find((b) => b.textContent === "10" && b.getAttribute("aria-disabled") !== "true");
    expect(firstDay).toBeTruthy();
    expect(secondDay).toBeTruthy();

    await user.click(firstDay as HTMLButtonElement);
    await user.click(secondDay as HTMLButtonElement);

    const startText = screen.getByText("Начало").parentElement?.querySelector("div:last-child")?.textContent;
    const endText = screen.getByText("Конец").parentElement?.querySelector("div:last-child")?.textContent;

    expect(startText).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    expect(endText).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    expect(handleChange).toHaveBeenCalled();
  });

  it("enables present mode and locks end to today", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<WorkPeriodPicker aria-label="period" onChange={handleChange} />);

    const today = todayDay();
    const todayLabel = formatRuDate(today);

    const checkbox = screen.getByRole("checkbox", { name: /по настоящее время/i });
    await user.click(checkbox);

    const endText = screen.getByText("Конец").parentElement?.querySelector("div:last-child")?.textContent;
    expect(endText).toBe(todayLabel);

    const lastCall = handleChange.mock.calls.at(-1)?.[0];
    expect(lastCall.present).toBe(true);
    expect(lastCall.end).toBe(todayLabel);
  });

  it("disables present mode and clears end", async () => {
    const user = userEvent.setup();
    render(<WorkPeriodPicker aria-label="period" />);
    const checkbox = screen.getByRole("checkbox", { name: /по настоящее время/i });
    await user.click(checkbox);
    await user.click(checkbox);
    const endText = screen.getByText("Конец").parentElement?.querySelector("div:last-child")?.textContent;
    expect(endText).toBe("—");
  });

  it("changes month via navigation buttons", async () => {
    const user = userEvent.setup();
    render(<WorkPeriodPicker aria-label="period" />);
    const title = screen.getByText((_, el) => el?.getAttribute("aria-live") === "polite" && el?.getAttribute("role") !== "alert");
    const initial = title.textContent;
    await user.click(screen.getByRole("button", { name: "Следующий месяц" }));
    expect(title.textContent).not.toBe(initial);
  });

  it("prevents selecting end date earlier than start", async () => {
    const user = userEvent.setup();
    render(<WorkPeriodPicker aria-label="period" />);

    const buttons = screen.getAllByRole("gridcell");
    const ten = buttons.find((b) => b.textContent === "10");
    const five = buttons.find((b) => b.textContent === "5");
    expect(ten).toBeTruthy();
    expect(five).toBeTruthy();

    await user.click(ten as HTMLButtonElement);
    expect(five as HTMLElement).toHaveAttribute("aria-disabled", "true");
    await user.click(five as HTMLButtonElement);

    const endText = screen.getByText("Конец").parentElement?.querySelector("div:last-child")?.textContent;
    expect(endText).toBe("—");
  });

  it("supports keyboard navigation and activation", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<WorkPeriodPicker aria-label="period" onChange={handleChange} />);

    const focusCell = screen.getAllByRole("gridcell").find((el) => el.getAttribute("tabindex") === "0") as HTMLButtonElement;
    focusCell.focus();

    await user.keyboard("{ArrowRight}");
    await user.keyboard(" ");

    expect(handleChange).toHaveBeenCalled();
  });

  it("shows validation error for invalid initial range", () => {
    render(<WorkPeriodPicker aria-label="period" value={{ start: "10.01.2025", end: "05.01.2025", present: false }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Конечная дата не может быть раньше начальной");
  });

  it("respects initial serialized value", () => {
    const start = todayDay();
    const end = addDays(start, 10);
    const startStr = formatRuDate(start);
    const endStr = formatRuDate(end);

    render(<WorkPeriodPicker aria-label="period" value={{ start: startStr, end: endStr, present: false }} />);

    expect(screen.getByText(startStr)).toBeInTheDocument();
    expect(screen.getByText(endStr)).toBeInTheDocument();
  });
});
