import "./globals.css"
import Sidebar from "./Sidebar"
import Image from "next/image"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="h-full flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100">
          {/* Banner Profissional Presente em todas as páginas */}
          <header className="bg-white m-6 p-8 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6">
            <Image src="/REDEC_10_NORTE_LOGO.png" alt="Logo" width={60} height={60} />
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-slate-900">Sistema Integrado REDEC 10 - Norte</h1>
              <p className="text-slate-500 font-medium text-lg">Gestão Estratégica em Defesa Civil</p>
            </div>
            <button className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20">
              Sair
            </button>
          </header>
          
          <main className="flex-1 px-6 pb-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
