/* app/dashboard/layout.js */

import "./globals.css"
import Sidebar from "./Sidebar"
import Image from "next/image"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="h-full flex overflow-hidden">
        {/* Sidebar fixa */}
        <Sidebar />
        
        {/* Container Principal: Fundo transparente para permitir que o bg.jpg do globals.css apareça */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-transparent">
          
          {/* Banner Profissional Único */}
          <header className="bg-white/70 backdrop-blur-md m-6 mb-4 p-6 rounded-2xl shadow-sm border border-white/50 flex items-center gap-6">
            <Image src="/REDEC_10_NORTE_LOGO.png" alt="Logo" width={50} height={50} priority />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">Sistema Integrado REDEC 10 - Norte</h1>
              <p className="text-slate-700 font-medium">Gestão Estratégica em Defesa Civil</p>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition shadow-md">
              Sair
            </button>
          </header>
          
          {/* Conteúdo das páginas */}
          <main className="flex-1 px-6 pb-10">{children}</main>

          {/* Rodapé Profissional */}
          <footer className="p-6 text-center text-slate-600 text-sm border-t border-white/30 bg-white/50 backdrop-blur-sm">
            © 2026 | REDEC 10 - Norte | Defesa Civil Estadual
          </footer>
        </div>
      </body>
    </html>
  )
}

