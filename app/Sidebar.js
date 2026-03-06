"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

import {
LayoutDashboard,
Users,
FileText,
Inbox,
Calendar,
Waves,
Package,
Ambulance,
Building,
Landmark,
Settings
} from "lucide-react"

export default function Sidebar(){

const [collapsed,setCollapsed] = useState(false)
const pathname = usePathname()

const menu = [

{icon:LayoutDashboard,label:"Dashboard",link:"/"},
{icon:Users,label:"Equipe REDEC 10",link:"/equipe"},
{icon:FileText,label:"Boletins",link:"/boletins"},
{icon:Inbox,label:"SEI",link:"/sei"},
{icon:Calendar,label:"Agenda de Atividades",link:"/agenda"},
{icon:Waves,label:"Monitoramento de Rios",link:"/rios"},
{icon:Package,label:"Contêiner Humanitário",link:"/container"},
{icon:Ambulance,label:"Controle de Viaturas",link:"/viaturas"},
{icon:Building,label:"Municípios COMDECs",link:"/comdecs"},
{icon:Landmark,label:"Bens Patrimoniais",link:"/patrimonio"},
{icon:Settings,label:"Configurações",link:"/config"}

]

return(

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

{menu.map((item,i)=>{

const Icon=item.icon
const active=pathname===item.link

return(

<a
key={i}
href={item.link}
className={active ? "active" : ""}
>

<Icon size={20}/>

<span>{item.label}</span>

</a>

)

})}

</nav>

</div>

)

}
