import { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
