"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Inbox, Calendar, Waves, Package, Ambulance, Building, Landmark, Settings } from "lucide-react"

export default function Sidebar() {
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
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full flex-shrink-0">
      <div className="p-6 font-bold text-xl text-blue-400">REDEC 10</div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.link
          return (
            <a href={item.link} key={item.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
