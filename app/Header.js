import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Image src="/REDEC_10_NORTE_LOGO.png" alt="Logo" width={40} height={40} />
        <span className="font-bold text-slate-800">REDEC 10 NORTE</span>
      </div>
      <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition">
        Sair
      </button>
    </header>
  )
}
