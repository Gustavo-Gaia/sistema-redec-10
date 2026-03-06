import "./globals.css"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="h-full flex overflow-hidden bg-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          <footer className="p-4 text-center text-xs text-slate-500 border-t bg-white">
            REDEC 10 - Norte © 2026 | Sistema de Gestão de Defesa Civil
          </footer>
        </div>
      </body>
    </html>
  )
}
