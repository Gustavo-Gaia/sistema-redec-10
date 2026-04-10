/* app/(sistema)/boletins/componentes/Filtros.js */

"use client"

import { Search, Calendar, Star, X } from "lucide-react"

export default function Filtros({ filtros, setFiltros, abaAtiva, anosDisponiveis }) {
  
  const anoAtual = new Date().getFullYear().toString()

  const limparFiltros = () => {
    // Busca o ano mais recente disponível para não deixar o filtro vazio após limpar
    const anoParaReset = anosDisponiveis.includes(anoAtual) 
      ? anoAtual 
      : (anosDisponiveis[0] || anoAtual)

    setFiltros({ 
      busca: "", 
      ano: anoParaReset, 
      especial: false 
    })
  }

  return (
    <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center gap-4">
      
      {/* Busca por Texto */}
      <div className="relative flex-1 min-w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={abaAtiva === "sei" ? "Buscar por Nº SEI ou Assunto..." : "Buscar por Nº Boletim ou Assunto..."}
          value={filtros.busca}
          onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-medium"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        
        {/* Filtro de Ano Dinâmico */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <Calendar size={16} className="text-slate-400" />
          <select
            value={filtros.ano}
            onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
            className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer min-w-[70px]"
          >
            {anosDisponiveis.length === 0 ? (
              <option value={anoAtual}>{anoAtual}</option>
            ) : (
              anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))
            )}
          </select>
        </div>

        {/* Toggle Acompanhamento Especial */}
        <button
          type="button"
          onClick={() => setFiltros({ ...filtros, especial: !filtros.especial })}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm
            ${filtros.especial 
              ? "bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-100" 
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}
          `}
        >
          <Star size={16} className={filtros.especial ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
          Especiais
        </button>

        {/* Botão Limpar */}
        {(filtros.busca || filtros.especial) && (
          <button
            type="button"
            onClick={limparFiltros}
            className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-xs font-bold"
            title="Limpar Filtros"
          >
            <X size={18} />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>
    </div>
  )
}
