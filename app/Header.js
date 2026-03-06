export default function Header({ isAuthenticated = true }) {
  return (
    <header className="header-integrado">
      <div className="brand-area">
        <img src="/REDEC_10_NORTE_LOGO.png" alt="Logo" style={{ height: '40px' }} />
        <div className="brand-text">
          <h1>Sistema Integrado REDEC 10 - Norte</h1>
          <p>Defesa Civil - Governo do Estado</p>
        </div>
      </div>

      <button className="auth-btn">
        {isAuthenticated ? "Sair" : "Login"}
      </button>
    </header>
  )
}
