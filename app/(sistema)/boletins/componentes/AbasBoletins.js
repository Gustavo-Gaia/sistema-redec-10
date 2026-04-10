/* app/(sistema)/boletins/componentes/AbasBoletins.js */

"use client"

import { FileText, Newspaper, Building2, ShieldCheck } from "lucide-react"

export default function AbasBoletins({ abaAtiva, setAbaAtiva, orgaoAtivo, setOrgaoAtivo }) {
  const abasPrincipais = [
    { id: "sei", label: "Processos SEI", icon: FileText },
    { id: "boletins", label: "Boletins Oficiais", icon: Newspaper },
  ]

  const subAbasOrgaos = [
    { id: "SEDEC", label: "SEDEC", icon: Building2 },
    { id: "DGDEC", label: "DGDEC", icon: ShieldCheck },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Abas Principais (SEI / Boletins) */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner">
        {abasPrincipais.map((aba) => {
          const Icone = aba.icon
          const isActive = abaAtiva === aba.id

          return (
            <button
              key={aba.id}
              onClick={() => {
                setAbaAtiva(aba.id)
                if (aba.id === "boletins") {
                  setOrgaoAtivo("SEDEC")
                }
              }}
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

      {/* Divisor Visual (Opcional, só aparece se for boletins) */}
      {abaAtiva === "boletins" && (
        <div className="hidden sm:block h-8 w-[1px] bg-slate-200 mx-2" />
      )}

      {/* Sub-Abas de Órgãos (Aparecem apenas quando 'boletins' está ativo) */}
      {abaAtiva === "boletins" && (
        <div className="flex p-1 bg-blue-50/50 rounded-2xl w-fit border border-blue-100/50 animate-in fade-in slide-in-from-left-2 duration-300">
          {subAbasOrgaos.map((orgao) => {
            const Icone = orgao.icon
            const isOrgaoActive = orgaoAtivo === orgao.id

            return (
              <button
                key={orgao.id}
                onClick={() => setOrgaoAtivo(orgao.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200
                  ${
                    isOrgaoActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-blue-400 hover:text-blue-600 hover:bg-blue-100/50"
                  }
                `}
              >
                <Icone size={14} />
                {orgao.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
