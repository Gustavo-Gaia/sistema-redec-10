export default function Dashboard() {
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Painel Operacional</h2>
      <div className="cards">
        <div className="card">
          <div className="card-header-top green">Monitoramento de Rios</div>
          <div className="card-body">Nível crítico: 3<br/>Atualização: 10:15</div>
          <a href="/rios" className="card-footer-btn">Saber mais →</a>
        </div>
        {/* Adicione os outros cards seguindo este modelo */}
      </div>
    </div>
  );
}
