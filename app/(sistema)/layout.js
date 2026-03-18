/* app/(sistema)/layout.js */

"use client"

import Sidebar from "@/components/Sidebar"
import Image from "next/image"
import { useRouter } from "next/navigation"
import "leaflet/dist/leaflet.css"


export default function SistemaLayout({ children }) {

  const router = useRouter()

  const handleLogout = () => {

    // remove cookie
    document.cookie = "usuario=; path=/; max-age=0"

    // redireciona para login
    router.push("/login")
  }

  return (
    <div className="h-full flex overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Área principal */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-transparent">

        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md m-6 mb-4 p-6 rounded-2xl shadow-sm border border-white/50 flex items-center gap-6">

          <Image
            src="/REDEC_10_NORTE_LOGO.png"
            alt="Logo"
            width={50}
            height={50}
            priority
          />

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Sistema Integrado REDEC 10 - Norte
            </h1>

            <p className="text-slate-700 font-medium">
              Gestão Estratégica em Defesa Civil
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition shadow-md"
          >
            Sair
          </button>

        </header>

        {/* Conteúdo */}
        <main className="flex-1 px-6 pb-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-slate-600 text-sm border-t border-white/30 bg-white/50 backdrop-blur-sm">
          © 2026 | REDEC 10 - Norte | Defesa Civil Estadual
        </footer>

      </div>
    </div>
  )
}
