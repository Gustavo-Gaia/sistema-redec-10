export default function Dashboard(){

return(

<div>

<h2>Painel Operacional</h2>

<div className="cards">

<a className="card" href="/rios">

<div className="card-header green">
Monitoramento de Rios
</div>

<div className="card-body">
<p>Nível crítico: 3</p>
<p>Atualização: 10:15</p>
</div>

</a>


<a className="card" href="/boletins">

<div className="card-header blue">
Boletins e SEI
</div>

<div className="card-body">
<p>Pendências: 5</p>
<p>Último boletim: 24/04</p>
</div>

</a>


<a className="card" href="/equipe">

<div className="card-header orange">
Equipe REDEC 10
</div>

<div className="card-body">
<p>Servidores: 12</p>
<p>Em campo: 4</p>
</div>

</a>


<a className="card" href="/ocorrencias">

<div className="card-header red">
Ocorrências
</div>

<div className="card-body">
<p>Municípios afetados: 5</p>
<p>Desalojados: 208</p>
</div>

</a>

</div>

</div>

)

}
