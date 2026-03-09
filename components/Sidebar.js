/* components/Sidebar.js */

"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Waves,
  Package,
  Ambulance,
  Building,
  Landmark,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export default function Sidebar() {

  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
    { icon: Users, label: "Equipe REDEC 10", link: "/equipe" },
    { icon: FileText, label: "Boletins", link: "/boletins" },
    { icon: Calendar, label: "Agenda", link: "/agenda" },
    { icon: Waves, label: "Monitoramento", link: "/monitoramento" },
    { icon: Package, label: "Contêiner", link: "/container" },
    { icon: Ambulance, label: "Viaturas", link: "/viaturas" },
    { icon: Building, label: "Municípios", link: "/municipios" },
    { icon: Landmark, label: "Patrimônio", link: "/patrimonio" },
    { icon: Settings, label: "Configurações", link: "/configuracoes" }
  ]

  return (
    <aside className={`bg-slate-900 text-white h-screen flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>

      {/* Botão colapsar */}
      <div className="p-6 flex items-center justify-end border-b border-slate-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

        {menuItems.map((item) => {

          const Icon = item.icon
          const isActive = pathname === item.link

          return (
            <Link
              key={item.label}
              href={item.link}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
              ${isActive ? "bg-blue-600" : "hover:bg-slate-800"}`}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

      </nav>

      {/* Rodapé */}
      {!collapsed && (
        <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
          REDEC 10 • v1.0
        </div>
      )}

    </aside>
  )
}
