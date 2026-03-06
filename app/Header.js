export default function Header() {
  return (
    <header style={{
      background: 'white', 
      padding: '15px 30px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/REDEC_10_NORTE_LOGO.png" alt="Logo" style={{ height: '45px' }} />
        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>
          REDEC 10 <span style={{ color: '#2563eb' }}>NORTE</span>
        </span>
      </div>
      <button style={{
        background: '#ef4444', 
        color: 'white', 
        border: 'none', 
        padding: '8px 20px', 
        borderRadius: '8px', 
        fontWeight: '600',
        cursor: 'pointer'
      }}>Sair</button>
    </header>
  )
}
