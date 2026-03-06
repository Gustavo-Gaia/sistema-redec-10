import "./globals.css"
import Sidebar from "./Sidebar"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="h-full flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          <main className="flex-1">{children}</main>
          <footer className="p-6 text-center text-slate-500 text-sm border-t border-slate-200 bg-white/50">
            REDEC 10 - Norte © 2026 | Sistema de Gestão de Defesa Civil
          </footer>
        </div>
      </body>
    </html>
  )
}
