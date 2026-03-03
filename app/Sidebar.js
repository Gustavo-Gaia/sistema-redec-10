"use client";
import { useState } from "react";
import Image from "next/image";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  const menuItems = [
    "Dashboard",
    "Equipe REDEC 10",
    "Boletins",
    "SEI",
    "Agenda de Atividades",
    "Monitoramento de Rios",
    "Contêiner Humanitário",
    "Controle de Viaturas",
    "Municípios COMDECs",
    "Bens Patrimoniais",
    "Configurações",
  ];

  return (
    <div
      className={`${
        open ? "w-72" : "w-20"
      } transition-all duration-300 bg-gradient-to-b from-[#0f172a] via-[#0b3b75] to-[#0e4c92] text-white min-h-screen p-4 flex flex-col`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="mb-6 text-sm bg-white/10 p-2 rounded-lg"
      >
        ☰
      </button>

      <div className="flex items-center gap-3 mb-8">
        <Image
          src="/REDEC_10_NORTE_LOGO.png"
          width={40}
          height={40}
          alt="Logo"
        />
        {open && (
          <h2 className="text-sm font-bold leading-tight">
            SISTEMA INTEGRADO <br /> REDEC 10 - Norte
          </h2>
        )}
      </div>

      <nav className="space-y-2 text-sm">
        {menuItems.map((item) => (
          <a
            key={item}
            className="block p-3 rounded-lg hover:bg-white/10 transition"
          >
            {open ? item : "•"}
          </a>
        ))}
      </nav>
    </div>
  );
}
