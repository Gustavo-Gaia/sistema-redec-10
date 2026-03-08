/* app/Header.js */

import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-slate-200 z-10">
      <div className="flex items-center gap-3">
        {/* Usando Image do Next para performance */}
        <Image src="/REDEC_10_NORTE_LOGO.png" alt="Logo" width={32} height={32} />
        <span className="font-bold text-slate-800 tracking-tight">REDEC 10 NORTE</span>
      </div>
      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all">
        Sair
      </button>
    </header>
  )
}
