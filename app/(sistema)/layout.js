/* app/(sistema)/layout.js */

import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"

export default function SistemaLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Área principal */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-transparent">

        {/* Header do sistema */}
        <Header />

        {/* Conteúdo das páginas */}
        <main className="flex-1 px-6 py-6">
          {children}
        </main>

        {/* Rodapé */}
        <footer className="px-6 py-4 text-center text-sm text-slate-600 border-t border-white/30 bg-white/50 backdrop-blur-sm">
          © 2026 | REDEC 10 - Norte | Defesa Civil Estadual
        </footer>

      </div>

    </div>
  )
}
