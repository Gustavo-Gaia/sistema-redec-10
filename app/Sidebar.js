"use client";

import { useState } from "react";
import {
Home,
Users,
FileText,
Calendar,
Truck,
Box,
Building,
Settings,
Activity
} from "lucide-react";

export default function Sidebar(){

const [collapsed,setCollapsed]=useState(false);

return(

<div className={`sidebar ${collapsed ? "collapsed":""}`}>

<div>

<div className="sidebar-title">
Sistema REDEC 10 - Norte
</div>

<nav>

<a href="#"><Home size={18}/> <span>Dashboard</span></a>

<a href="#"><Users size={18}/> <span>Equipe REDEC 10</span></a>

<a href="#"><FileText size={18}/> <span>Boletins</span></a>

<a href="#"><Activity size={18}/> <span>SEI</span></a>

<a href="#"><Calendar size={18}/> <span>Agenda</span></a>

<a href="#"><Activity size={18}/> <span>Monitoramento de Rios</span></a>

<a href="#"><Box size={18}/> <span>Contêiner</span></a>

<a href="#"><Truck size={18}/> <span>Viaturas</span></a>

<a href="#"><Building size={18}/> <span>COMDECs</span></a>

<a href="#"><Box size={18}/> <span>Bens Patrimoniais</span></a>

<a href="#"><Settings size={18}/> <span>Configurações</span></a>

</nav>

</div>

<button
onClick={()=>setCollapsed(!collapsed)}
style={{
marginTop:"20px",
padding:"8px",
borderRadius:"8px",
border:"none",
cursor:"pointer"
}}

>

{collapsed ? "➡" : "⬅"} </button>

</div>

)

}
