/* app/(sistema)/boletins/componentes/AbasBoletins.js */

"use client"

import { FileText, Newspaper } from "lucide-react"

export default function AbasBoletins({ abaAtiva, setAbaAtiva }) {
  const abas = [
    { id: "sei", label: "Processos SEI", icon: FileText },
    { id: "boletins", label: "Boletins Oficiais", icon: Newspaper },
  ]

  return (
    <div className="flex p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner">
      {abas.map((aba) => {
        const Icone = aba.icon
        const isActive = abaAtiva === aba.id

        return (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
              ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }
            `}
          >
            <Icone size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
            {aba.label}
          </button>
        )
      })}
    </div>
  )
}
