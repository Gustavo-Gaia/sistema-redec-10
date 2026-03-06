import "./globals.css"
import Sidebar from "./Sidebar"
import Image from "next/image"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="h-full flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50">
          {/* Banner Único e Profissional */}
          <header className="bg-white m-6 mb-2 p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
            <Image src="/REDEC_10_NORTE_LOGO.png" alt="Logo" width={50} height={50} />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">Sistema Integrado REDEC 10 - Norte</h1>
              <p className="text-slate-500 font-medium">Gestão Estratégica em Defesa Civil</p>
            </div>
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition">Sair</button>
          </header>
          
          <main className="flex-1 px-6">{children}</main>

          {/* Rodapé Profissional */}
          <footer className="p-6 text-center text-slate-400 text-sm">
            © 2026 | REDEC 10 - Norte | Defesa Civil Estadual
          </footer>
        </div>
      </body>
    </html>
  )
}
