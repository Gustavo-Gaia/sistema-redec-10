"use client"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, Users, FileText, Inbox, Calendar, Waves, Package, Settings } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      {/* Logotipo na Sidebar */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <Image src="/REDEC_10_NORTE_LOGO.png" alt="Logo" width={32} height={32} />
        <span className="font-bold">REDEC 10</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {[
          { icon: LayoutDashboard, label: "Dashboard", link: "/" },
          { icon: Users, label: "Equipe", link: "/equipe" },
          { icon: FileText, label: "Boletins", link: "/boletins" },
          { icon: Waves, label: "Monitoramento", link: "/rios" }
        ].map((item) => (
          <a href={item.link} key={item.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${pathname === item.link ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <item.icon size={20} /> {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
