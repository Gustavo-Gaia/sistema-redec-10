export default function Layout({ children }) {
  return (
    <html>
      <body>
        <div className="layout">
          <Sidebar />
          <div className="content">
            <Header /> {/* O cabeçalho fica aqui, acima do conteúdo */}
            <main className="main">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
