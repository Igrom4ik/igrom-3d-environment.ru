import { fonts } from "@/resources";
import type { Metadata } from "next";
import { AdminToolbar } from "./AdminToolbar";
import "./admin.css";

export const metadata: Metadata = {
  title: "Igrom Dashboard",
  description: "Admin panel for Igrom 3D Environment",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fonts.heading.variable} ${fonts.body.variable} ${fonts.label.variable} ${fonts.code.variable}`}>
      <body style={{ margin: 0 }}>
        <AdminToolbar />
        {children}
      </body>
    </html>
  );
}
