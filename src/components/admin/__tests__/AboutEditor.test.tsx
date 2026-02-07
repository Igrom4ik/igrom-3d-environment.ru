import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Geist: () => ({
    style: { fontFamily: "Geist" },
    className: "geist-font",
    variable: "--font-geist",
  }),
  JetBrains_Mono: () => ({
    style: { fontFamily: "JetBrains Mono" },
    className: "jetbrains-mono-font",
    variable: "--font-jetbrains-mono",
  }),
}));

// Mock KeystaticLayout to avoid context issues with Header/Language
vi.mock("@/components/admin/KeystaticLayout", () => ({
    KeystaticLayout: ({ children, customHeaderActions }: { children: React.ReactNode; customHeaderActions?: React.ReactNode }) => (
        <div>
            <div data-testid="header-actions">{customHeaderActions}</div>
            {children}
        </div>
    )
}));

import { AboutEditor } from "../AboutEditor";

// Mock @once-ui-system/core components if necessary, but trying to use real ones first.
// If they use canvas or other browser APIs, I might need to mock them.
// Assuming they are standard React components.

import { Providers } from "@/components/Providers";

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock window.confirm
const confirmMock = vi.fn(() => true);
global.confirm = confirmMock;

const mockData = {
    title: "About Me",
    description: "Bio description",
    avatar: { display: true },
    calendar: { display: true, link: "https://cal.com/me" },
    work: { 
        display: true, 
        title: "Work Experience", 
        experiences: [
            { company: "Company A", timeframe: "2020-2021", role: "Dev", achievements: ["Did stuff"], images: [] }
        ] 
    },
    studies: { display: true, title: "Education", institutions: [] },
    technical: { display: true, title: "Skills", skills: [] },
};

const renderWithProviders = (ui: React.ReactNode) => {
    return render(<Providers>{ui}</Providers>);
};

describe("AboutEditor", () => {
    beforeEach(() => {
        fetchMock.mockReset();
        // Default success response
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });
    });

    it("renders loading state initially", () => {
        fetchMock.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
        renderWithProviders(<AboutEditor />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders form with loaded data", async () => {
        renderWithProviders(<AboutEditor />);
        
        await waitFor(() => {
            expect(screen.getByDisplayValue("About Me")).toBeInTheDocument();
        });

        expect(screen.getByDisplayValue("Bio description")).toBeInTheDocument();
    });

    it("switches tabs correctly", async () => {
        const user = userEvent.setup();
        renderWithProviders(<AboutEditor />);
        
        await waitFor(() => {
            expect(screen.getByText("Опыт работы")).toBeInTheDocument();
        });

        // Click on "Опыт работы" tab
        // Note: SegmentedControl implementation details might vary, finding by text is safest
        await user.click(screen.getByText("Опыт работы"));

        expect(screen.getByDisplayValue("Work Experience")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Company A")).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: /по настоящее время/i })).toBeInTheDocument();
    });

    it("updates general fields", async () => {
        const user = userEvent.setup();
        renderWithProviders(<AboutEditor />);
        
        await waitFor(() => expect(screen.getByDisplayValue("About Me")).toBeInTheDocument());

        const titleInput = screen.getByDisplayValue("About Me");
        await user.clear(titleInput);
        await user.type(titleInput, "New Title");

        expect(titleInput).toHaveValue("New Title");
    });

    it("adds and removes experience items", async () => {
        const user = userEvent.setup();
        renderWithProviders(<AboutEditor />);
        
        await waitFor(() => expect(screen.getByText("Опыт работы")).toBeInTheDocument());
        await user.click(screen.getByText("Опыт работы"));

        // Add item
        const addButton = screen.getByText("Добавить элемент");
        await user.click(addButton);

        const items = screen.getAllByText(/Элемент #/);
        expect(items.length).toBe(2); // 1 initial + 1 added

        // Remove item (first one)
        const deleteButtons = screen.getAllByLabelText("Delete item");
        expect(deleteButtons.length).toBe(2);
        
        await user.click(deleteButtons[0]);

        const itemsAfter = screen.getAllByText(/Элемент #/);
        expect(itemsAfter.length).toBe(1);
    });
    
    it("saves data correctly", async () => {
        const user = userEvent.setup();
        renderWithProviders(<AboutEditor />);
        
        await waitFor(() => expect(screen.getByDisplayValue("About Me")).toBeInTheDocument());

        const titleInput = screen.getByDisplayValue("About Me");
        await user.clear(titleInput);
        await user.type(titleInput, "Updated Title");

        const saveButton = screen.getByTestId("header-actions").querySelector("button");
        expect(saveButton).toBeInTheDocument();
        if (saveButton) await user.click(saveButton);

        expect(fetchMock).toHaveBeenCalledWith("/api/admin/about", expect.objectContaining({
            method: "PUT",
            body: expect.stringContaining("Updated Title"),
        }));
    });
});
