import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="p-4">{children}</div>
    </div>
  );
}