import "./globals.css";
import Sidebar from "./Sidebar";

export const metadata = {
  title: "Sistema Integrado REDEC 10 - Norte",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
