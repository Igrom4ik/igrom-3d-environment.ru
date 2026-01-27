import { fonts } from "@/resources";
import type { Metadata } from "next";
import { AdminToolbar } from "./AdminToolbar";
import "./admin.css";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Igrom Dashboard",
  description: "Admin panel for Igrom 3D Environment",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fonts.heading.variable} ${fonts.body.variable} ${fonts.label.variable} ${fonts.code.variable}`}>
      <body style={{ margin: 0 }} suppressHydrationWarning>
        <ErrorBoundary>
          <AdminToolbar />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
