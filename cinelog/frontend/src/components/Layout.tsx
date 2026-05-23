import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { RequireAuth } from "./RequireAuth";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">{children}</main>
      </div>
    </RequireAuth>
  );
}
