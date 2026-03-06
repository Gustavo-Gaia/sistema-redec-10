export default function Dashboard() {

return (

```
<div>

  <h2>Dashboard</h2>

  <div className="cards">

    {/* CARD 1 */}

    <div className="card">
      <div className="card-header green">
        💧 Monitoramento dos Rios
      </div>

      <div className="card-body">
        <p>Nível Crítico: 3</p>
        <p>Atualizado: 10:15</p>
      </div>
    </div>


    {/* CARD 2 */}

    <div className="card">
      <div className="card-header blue">
        📄 Boletins e SEI
      </div>

      <div className="card-body">
        <p>Pendências: 5</p>
        <p>Último boletim: 24/04/2024</p>
      </div>
    </div>


    {/* CARD 3 */}

    <div className="card">
      <div className="card-header orange">
        👥 Equipe REDEC 10
      </div>

      <div className="card-body">
        <p>Membros: 12</p>
        <p>2 em férias</p>
      </div>
    </div>


    {/* CARD 4 */}

    <div className="card">
      <div className="card-header red">
        ⚠️ Ocorrências
      </div>

      <div className="card-body">
        <p>Municípios afetados: 5</p>
        <p>Desalojados: 208</p>
      </div>
    </div>

  </div>


  {/* SEGUNDA LINHA DE BOTÕES */}

  <div className="quick-grid">

    <div className="quick-card">📅 Agenda</div>

    <div className="quick-card">📦 Contêiner</div>

    <div className="quick-card">📊 COMDECs</div>

    <div className="quick-card">📄 SEI</div>

    <div className="quick-card">🚑 Viaturas</div>

    <div className="quick-card">🏛️ Bens</div>

    <div className="quick-card">👥 Equipe</div>

    <div className="quick-card">⚙️ Configurações</div>

  </div>

</div>
```

);

}
