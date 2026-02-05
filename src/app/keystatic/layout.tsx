import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";
import { fonts } from "@/resources";
import type { Metadata } from "next";
import { AdminToolbar } from "./AdminToolbar";
import "./admin.css";
import "./keystatic-overrides.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Providers } from "@/components";

export const metadata: Metadata = {
  title: "Igrom Dashboard",
  description: "Admin panel for Igrom 3D Environment",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fonts.heading.variable} ${fonts.body.variable} ${fonts.label.variable} ${fonts.code.variable}`}>
      <body style={{ margin: 0 }} suppressHydrationWarning>
        <Providers>
            <ErrorBoundary>
              <AdminToolbar />
              {children}
            </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
