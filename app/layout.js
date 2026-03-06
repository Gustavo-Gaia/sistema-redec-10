import "./globals.css"
import Sidebar from "./Sidebar"
import Header from "./Header"

export const metadata = {
  title: "Sistema Integrado REDEC 10 - Norte",
  description: "Painel de Controle Defesa Civil",
}

export default function Layout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="layout">
          <Sidebar />
          <div className="content">
            <Header />
            <main className="main">
              {children}
            </main>
            <footer className="footer">
              <p>REDEC 10 - Norte © 2026 | Sistema de Gestão de Defesa Civil</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
