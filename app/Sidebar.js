"use client"

import { useState } from "react"

export default function Sidebar() {

const [collapsed,setCollapsed] = useState(false)

return (

<div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

<div className="sidebar-top">

<span className="sidebar-title">
Sistema REDEC 10
</span>

<button 
className="toggle-btn"
onClick={()=>setCollapsed(!collapsed)}
>
{collapsed ? "➜" : "⬅"}
</button>

</div>

<nav>

<a href="/">
<span className="icon">📊</span>
<span>Dashboard</span>
</a>

<a href="#">
<span className="icon">👥</span>
<span>Equipe REDEC 10</span>
</a>

<a href="#">
<span className="icon">📄</span>
<span>Boletins</span>
</a>

<a href="#">
<span className="icon">📥</span>
<span>SEI</span>
</a>

<a href="#">
<span className="icon">📅</span>
<span>Agenda</span>
</a>

<a href="#">
<span className="icon">🌊</span>
<span>Monitoramento de Rios</span>
</a>

<a href="#">
<span className="icon">📦</span>
<span>Contêiner Humanitário</span>
</a>

<a href="#">
<span className="icon">🚑</span>
<span>Controle de Viaturas</span>
</a>

<a href="#">
<span className="icon">🏛</span>
<span>Municípios COMDECs</span>
</a>

<a href="#">
<span className="icon">🏗</span>
<span>Bens Patrimoniais</span>
</a>

<a href="#">
<span className="icon">⚙</span>
<span>Configurações</span>
</a>

</nav>

</div>

)

}
