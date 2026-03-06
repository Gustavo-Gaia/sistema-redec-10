export default function Layout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-slate-100 h-screen flex overflow-hidden">
        {/* Sidebar com largura fixa */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Container principal que ocupa o resto do espaço */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          <Header />
          <main className="p-6 flex-1">
            {children}
          </main>
          <footer className="p-4 text-center text-sm text-slate-500 border-t border-slate-200">
            REDEC 10 - Norte © 2026 | Sistema de Gestão de Defesa Civil
          </footer>
        </div>
      </body>
    </html>
  )
}
