"use client";

import { useState } from "react";

export default function Sidebar(){

const [collapsed,setCollapsed] = useState(false);

return(

<div className={`sidebar ${collapsed ? "collapsed":""}`}>

<div className="sidebar-top">

<div className="sidebar-title">
Sistema REDEC 10
</div>

<button
className="toggle-btn"
onClick={()=>setCollapsed(!collapsed)}
>
{collapsed ? "➤" : "◀"}
</button>

</div>

<nav>

<a href="#">
🏠 <span>Dashboard</span>
</a>

<a href="#">
👥 <span>Equipe REDEC 10</span>
</a>

<a href="#">
📄 <span>Boletins</span>
</a>

<a href="#">
📡 <span>SEI</span>
</a>

<a href="#">
📅 <span>Agenda</span>
</a>

<a href="#">
🌊 <span>Monitoramento de Rios</span>
</a>

<a href="#">
📦 <span>Contêiner</span>
</a>

<a href="#">
🚗 <span>Viaturas</span>
</a>

<a href="#">
🏙 <span>COMDECs</span>
</a>

<a href="#">
🏛 <span>Bens Patrimoniais</span>
</a>

<a href="#">
⚙ <span>Configurações</span>
</a>

</nav>

</div>

)

}
