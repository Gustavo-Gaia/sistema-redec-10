import "./globals.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="layout">
          <Sidebar />
          <div className="content">
            <Header />
            <main className="main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
