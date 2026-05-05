/* app/(sistema)/municipios/componentes/ListaMunicipios.js */

"use client"

import { MapPin, Users, AlertTriangle, Building2, Phone } from "lucide-react"

export default function ListaMunicipios({
  municipios = [],
  eventos = [],
  eventosMunicipios = [],
  getEventosDoMunicipio,
  onSelect
}) {

  function getResumoEventos(municipioId) {
    const eventosMunicipio = getEventosDoMunicipio(municipioId)

    if (!eventosMunicipio.length) {
      return {
        label: "Sem eventos",
        cor: "bg-green-500",
        corFundo: "bg-green-50",
        texto: "text-green-700"
      }
    }

    const ativos = eventosMunicipio.filter(e => e.status === "ATIVO")

    if (ativos.length > 0) {
      return {
        label: "Em anormalidade",
        cor: "bg-red-500",
        corFundo: "bg-red-50",
        texto: "text-red-700"
      }
    }

    return {
      label: "Com histórico",
      cor: "bg-amber-500",
      corFundo: "bg-amber-50",
      texto: "text-amber-700"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {municipios.length === 0 && (
        <div className="col-span-full text-center py-16">
          <Building2 size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-xs text-slate-400 font-bold uppercase">
            Nenhum município cadastrado
          </p>
        </div>
      )}

      {municipios.map((m) => {
        const status = getResumoEventos(m.id)
        const eventosDoMunicipio = getEventosDoMunicipio(m.id)

        return (
          <div
            key={m.id}
            onClick={() => onSelect(m)}
            className="group relative bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
          >

            {/* STATUS BAR */}
            <div className={`absolute top-0 left-0 w-full h-1 ${status.cor}`} />

            {/* HEADER */}
            <div className={`p-5 pb-4 ${status.corFundo}`}>
              <div className="flex items-start justify-between gap-3">
                
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase leading-tight">
                    {m.nome}
                  </h2>

                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    Município
                  </p>
                </div>

                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${status.cor} text-white`}>
                  {status.label}
                </div>

              </div>
            </div>

            {/* CONTEÚDO */}
            <div className="p-5 space-y-4">

              {/* PREFEITO */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Prefeito</p>
                  <p className="text-sm font-bold text-slate-700 uppercase">
                    {m.prefeito || "-"}
                  </p>
                </div>

                {m.prefeito_contato && (
                  <Phone size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                )}
              </div>

              {/* DEFESA CIVIL */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Sec. Defesa Civil</p>
                  <p className="text-sm font-bold text-slate-700 uppercase">
                    {m.secretario_dc || "-"}
                  </p>
                </div>

                {m.secretario_dc_contato && (
                  <Phone size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                )}
              </div>

              {/* EVENTOS */}
              <div className="pt-3 border-t">

                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    Eventos registrados
                  </p>

                  <span className="text-xs font-black text-slate-700">
                    {eventosDoMunicipio.length}
                  </span>
                </div>

                {eventosDoMunicipio.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    Nenhuma ocorrência registrada
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {eventosDoMunicipio.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className="text-[9px] px-2 py-1 bg-slate-100 rounded-full font-bold text-slate-600"
                      >
                        {e.tipo || "Evento"}
                      </span>
                    ))}

                    {eventosDoMunicipio.length > 3 && (
                      <span className="text-[9px] px-2 py-1 bg-slate-200 rounded-full font-bold text-slate-600">
                        +{eventosDoMunicipio.length - 3}
                      </span>
                    )}
                  </div>
                )}

              </div>

            </div>

            {/* HOVER EFFECT */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-[2rem] transition-all pointer-events-none" />

          </div>
        )
      })}

    </div>
  )
}
