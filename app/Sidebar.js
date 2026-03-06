"use client"

import { useState } from "react"
import { FaTachometerAlt, FaUsers, FaFileAlt, FaCalendarAlt, FaWater } from "react-icons/fa"

export default function Sidebar(){

const [collapsed,setCollapsed] = useState(false)

return(

<div className={`sidebar ${collapsed ? "collapsed":""}`}>

<div className="logo">

<img src="/REDEC_10_NORTE_LOGO.png" width="40"/>

{!collapsed && <span>Sistema REDEC 10</span>}

<button onClick={()=>setCollapsed(!collapsed)}>
☰
</button>

</div>

<nav>

<a>
<FaTachometerAlt/>
{!collapsed && "Dashboard"}
</a>

<a>
<FaUsers/>
{!collapsed && "Equipe REDEC 10"}
</a>

<a>
<FaFileAlt/>
{!collapsed && "Boletins"}
</a>

<a>
<FaCalendarAlt/>
{!collapsed && "Agenda"}
</a>

<a>
<FaWater/>
{!collapsed && "Monitoramento de Rios"}
</a>

</nav>

</div>

)

}
