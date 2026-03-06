import "./globals.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

export const metadata = {
  title: "Sistema Integrado REDEC 10 - Norte",
  description: "Sistema institucional da Defesa Civil",
};

export default function RootLayout({ children }) {
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
              <span>REDEC 10 • v1.0</span>
              <span>© 2026</span>
            </footer>

          </div>

        </div>

      </body>
    </html>
  );
}
