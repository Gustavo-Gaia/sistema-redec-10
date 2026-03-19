/* app/(sistema)/monitoramento/componentes/MapaMonitoramento.js */

"use client"

import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet"
import { useEffect } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// ========================================
// 🚀 FLY TO ESTAÇÃO
// ========================================
function FlyToEstacao({ estacao }) {
  const map = useMap()

  useEffect(() => {
    if (estacao?.latitude && estacao?.longitude) {
      map.flyTo([estacao.latitude, estacao.longitude], 13, { duration: 1.5 })
    }
  }, [estacao, map])

  return null
}

// ========================================
// 🎯 ÍCONE CUSTOMIZADO (COM PULSO + HOVER)
// ========================================
const criarIconeCustomizado = (cor, status, selecionada) => {

  const tamanho = selecionada ? 45 : 35

  // 🔥 AGORA BASEADO EM STATUS (CORRETO)
  const critico = ["alerta", "transbordo", "extremo"].includes(status)

  return L.divIcon({
    className: `custom-pin ${critico ? "marker-critical-pulse" : ""}`,
    html: `
      <div style="
        position: relative;
        width: ${tamanho}px;
        height: ${tamanho}px;
        color: ${cor};
      ">

        <svg
          width="${tamanho}"
          height="${tamanho}"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.3)); transition: all 0.2s ease;"
        >
          <path 
            d="M12 21C16 17.5 19 14.402 19 11.2C19 7.22355 15.866 4 12 4C8.13401 4 5 7.22355 5 11.2C5 14.402 8 17.5 12 21Z" 
            fill="${cor}" 
            stroke="white" 
            stroke-width="1.5"
          />
          <circle cx="12" cy="11" r="3" fill="white" fill-opacity="0.9"/>
        </svg>

      </div>
    `,
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho],
    tooltipAnchor: [0, -tamanho]
  })
}

// ========================================
// 🌍 MAPA
// ========================================
export default function MapaMonitoramento() {

  const { estacoes, estacaoSelecionada, selecionarEstacao } = useMonitoramento()

  // 🔥 AGORA BASEADO EM STATUS (PADRÃO PROFISSIONAL)
  const coresHex = {
    normal: "#10b981",
    alerta: "#facc15",
    transbordo: "#ef4444",
    extremo: "#9333ea",
    abaixo_regua: "#64748b",
    sem_dado: "#94a3b8",
    sem_cota: "#94a3b8"
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">

      <MapContainer
        center={[-21.75, -41.32]}
        zoom={9}
        className="w-full h-full z-0"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToEstacao estacao={estacaoSelecionada} />

        {estacoes.map((e) => {

          if (!e.latitude || !e.longitude) return null

          const status = e.situacao?.status || "sem_dado"
          const cor = coresHex[status] || "#3b82f6"
          const selecionada = estacaoSelecionada?.id === e.id

          return (
            <Marker
              key={`${e.id}-${e.medicao?.data_hora}`}
              position={[e.latitude, e.longitude]}
              icon={criarIconeCustomizado(cor, status, selecionada)}
              eventHandlers={{
                click: () => selecionarEstacao(e)
              }}
            >

              <Tooltip
                direction="top"
                offset={[0, -8]}
                opacity={1}
                sticky
                className="!bg-transparent !border-none !shadow-none"
              >
                <div className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg min-w-[120px]">

                  {/* NOME */}
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center leading-none">
                    {e.municipio}
                  </div>

                  {/* VALOR */}
                  <div className="text-sm font-black text-slate-900 text-center mt-1">
                    {e.medicao?.abaixo_regua
                      ? "A/R"
                      : `${e.medicao?.nivel?.toFixed(2) || "0.00"} m`}
                  </div>

                  {/* STATUS (aqui pode usar texto tranquilo) */}
                  <div className={`mt-1 text-[9px] font-black uppercase text-center px-2 py-0.5 rounded ${e.situacao.cor} text-white`}>
                    {e.situacao?.texto}
                  </div>

                </div>
              </Tooltip>

            </Marker>
          )
        })}

      </MapContainer>
    </div>
  )
}
