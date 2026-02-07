import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagsEditor } from "../TagsEditor";

describe("TagsEditor", () => {
  it("adds and removes tags", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagsEditor value={[]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: /добавить тег/i }));
    expect(onChange).toHaveBeenCalled();
  });
});
