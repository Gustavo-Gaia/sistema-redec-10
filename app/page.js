export default function Dashboard() {

  return (

    <div>

      <h2>Dashboard</h2>

      <div className="cards">

        <div className="card green">
          <h3>Monitoramento dos Rios</h3>
          <p>Nível Crítico: 3</p>
          <p>Atualizado: 10:15</p>
        </div>

        <div className="card blue">
          <h3>Boletins e SEI</h3>
          <p>Pendências: 5</p>
          <p>Último boletim: 24/04/2024</p>
        </div>

        <div className="card orange">
          <h3>Equipe REDEC 10</h3>
          <p>Membros: 12</p>
          <p>2 em férias</p>
        </div>

        <div className="card red">
          <h3>Ocorrências</h3>
          <p>Municípios afetados: 5</p>
          <p>Desalojados: 208</p>
        </div>

      </div>

    </div>

  );
}
