import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-slate-100">
      <Link href="/" className="flex items-center gap-3">
        {/* Otimização: next/image faz o lazy loading e redimensionamento automático */}
        <Image 
          src="/REDEC_10_NORTE_LOGO.png" 
          alt="Logo REDEC 10 Norte" 
          width={45} 
          height={45} 
          priority 
        />
        <span className="font-extrabold text-slate-900 text-lg">
          REDEC 10 <span className="text-blue-600">NORTE</span>
        </span>
      </Link>

      <button className="bg-red-500 hover:bg-red-600 transition-colors text-white px-6 py-2 rounded-lg font-semibold text-sm cursor-pointer shadow-md">
        Sair
      </button>
    </header>
  );
}
