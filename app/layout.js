import Sidebar from "./Sidebar";
import Header from "./Header";
import "./globals.css";
import { useState } from "react";

export const metadata = {
  title: "SISTEMA INTEGRADO REDEC 10 - Norte",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex bg-slate-100">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="p-6 md:p-10">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
