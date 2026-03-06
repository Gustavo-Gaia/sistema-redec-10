"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, Users, FileText, Inbox, Calendar, 
  Waves, Package, Ambulance, Building, Landmark, Settings, Menu, X 
} from "lucide-react"

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", link: "/" },
    { icon: Users, label: "Equipe REDEC 10", link: "/equipe" },
    { icon: FileText, label: "Boletins", link: "/boletins" },
    { icon: Inbox, label: "SEI", link: "/sei" },
    { icon: Calendar, label: "Agenda", link: "/agenda" },
    { icon: Waves, label: "Monitoramento", link: "/rios" },
    { icon: Package, label: "Contêiner", link: "/container" },
    { icon: Ambulance, label: "Viaturas", link: "/viaturas" },
    { icon: Building, label: "Municípios", link: "/comdecs" },
    { icon: Landmark, label: "Patrimônio", link: "/patrimonio" },
    { icon: Settings, label: "Configurações", link: "/config" }
  ]

  return (
    <>
      {/* BOTÃO MOBILE (Aparece apenas em telas pequenas) */}
      <button 
        className="mobile-toggle" 
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "active" : ""}`}>
        
        <div className="sidebar-top">
          {!collapsed && <span className="sidebar-title">REDEC 10</span>}
          <button 
            className="toggle-btn" 
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "➜" : "⬅"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, i) => {
            const Icon = item.icon
            const isActive = pathname === item.link

            return (
              <a 
                key={i} 
                href={item.link} 
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)} // Fecha ao clicar no mobile
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {!collapsed && <span>{item.label}</span>}
              </a>
            )
          })}
        </nav>
      </aside>

      {/* OVERLAY PARA MOBILE */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>}
    </>
  )
}
