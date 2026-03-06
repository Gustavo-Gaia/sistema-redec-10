export default function Header() {
  return (
    <header className="header-integrado">
      <div className="brand-area">
        <img src="/REDEC_10_NORTE_LOGO.png" alt="Logo" className="header-logo" />
        <div className="brand-text">
          <h1>Sistema Integrado REDEC 10 - Norte</h1>
          <p>Defesa Civil - Governo do Estado</p>
        </div>
      </div>
      <button className="auth-btn" style={{background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer'}}>
        Sair
      </button>
    </header>
  );
}
