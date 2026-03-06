export default function Dashboard() {

  return (

    <div>

      <h2>Dashboard</h2>

      <div className="cards">

        <div className="card">
          <div className="card-header green">
            Monitoramento dos Rios
          </div>

          <div className="card-body">
            <p>Nível Crítico: 3</p>
            <p>Atualizado: 10:15</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header blue">
            Boletins e SEI
          </div>

          <div className="card-body">
            <p>Pendências: 5</p>
            <p>Último boletim: 24/04/2024</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header orange">
            Equipe REDEC 10
          </div>

          <div className="card-body">
            <p>Membros: 12</p>
            <p>2 em férias</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header red">
            Ocorrências
          </div>

          <div className="card-body">
            <p>Municípios afetados: 5</p>
            <p>Desalojados: 208</p>
          </div>
        </div>

      </div>

    </div>

  );

}
