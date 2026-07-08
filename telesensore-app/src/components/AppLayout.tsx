import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ToastStack } from "./Toast";
import "../styles/globals.css";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-viewport">
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <main className="app-content">{children}</main>
        </div>
      </div>
      <ToastStack />
    </div>
  );
}
