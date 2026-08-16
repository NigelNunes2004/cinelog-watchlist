import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { AntigravityField } from "./AntigravityField";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AntigravityField />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
