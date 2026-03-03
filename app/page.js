export default function Home() {
  return (
    <div>
      <h1>Dashboard</h1>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header green">
            Monitoramento dos Rios
          </div>
          <div className="card-body">
            Nível Crítico: 3 <br />
            Atualizado: 10:15
          </div>
        </div>

        <div className="card">
          <div className="card-header blue">
            Boletins e SEI
          </div>
          <div className="card-body">
            Pendências: 5 <br />
            Último boletim: 24/04/2024
          </div>
        </div>

        <div className="card">
          <div className="card-header orange">
            Equipe REDEC 10
          </div>
          <div className="card-body">
            Membros: 12 <br />
            2 em férias
          </div>
        </div>

        <div className="card">
          <div className="card-header red">
            Ocorrências
          </div>
          <div className="card-body">
            Municípios afetados: 5 <br />
            Desalojados: 208
          </div>
        </div>
      </div>
    </div>
  );
}
