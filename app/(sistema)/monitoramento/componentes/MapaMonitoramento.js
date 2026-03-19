/* app/(sistema)/monitoramento/componentes/MapaMonitoramento.js */

"use client"

import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet"
import { useEffect } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Componente para mover a câmera
function FlyToEstacao({ estacao }) {
  const map = useMap()
  useEffect(() => {
    if (estacao?.latitude && estacao?.longitude) {
      map.flyTo([estacao.latitude, estacao.longitude], 13, { duration: 1.5 })
    }
  }, [estacao, map])
  return null
}

// Função para criar o ícone personalizado (Estilo Gota/Pin)
const criarIconeCustomizado = (cor, selecionada) => {
  const tamanho = selecionada ? 45 : 35;
  
  return L.divIcon({
    className: "custom-pin",
    html: `
      <svg width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 2px rgba(0,0,0,0.3));">
        <path d="M12 21C16 17.5 19 14.402 19 11.2C19 7.22355 15.866 4 12 4C8.13401 4 5 7.22355 5 11.2C5 14.402 8 17.5 12 21Z" fill="${cor}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="11" r="3" fill="white" fill-opacity="0.8"/>
      </svg>
    `,
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho], // Garante que a ponta da gota aponte para a coordenada
    tooltipAnchor: [0, -tamanho] // Tooltip aparece acima do pin
  })
}

export default function MapaMonitoramento() {
  const { estacoes, estacaoSelecionada, selecionarEstacao } = useMonitoramento()

  // Cores seguindo o padrão do seu Card
  const coresHex = {
    "Normal": "#10b981",
    "Alerta": "#facc15",
    "Transbordo": "#ef4444",
    "Extremo": "#9333ea",
    "Abaixo da régua": "#64748b",
    "Sem dados": "#94a3b8"
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer
        center={[-21.75, -41.32]} // Centralizado na região Norte Fluminense
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

          const cor = coresHex[e.situacao?.texto] || "#3b82f6"
          const selecionada = estacaoSelecionada?.id === e.id

          return (
            <Marker
              key={`${e.id}-${e.medicao?.data_hora}`} // 🔥 KEY DINÂMICA: Isso força o refresh quando a medição muda!
              position={[e.latitude, e.longitude]}
              icon={criarIconeCustomizado(cor, selecionada)}
              eventHandlers={{
                click: () => selecionarEstacao(e)
              }}
            >
              {/* Tooltip estilo SACE/CPRM (aparece no hover) */}
              <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky>
                <div className="flex flex-col p-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 leading-none">
                    {e.municipio}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {e.medicao?.abaixo_regua ? "Abaixo da Régua" : `${e.medicao?.nivel?.toFixed(2) || "0.00"} m`}
                  </span>
                  <span className={`text-[9px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${e.situacao.cor} text-white text-center`}>
                    {e.situacao.texto}
                  </span>
                </div>
              </Tooltip>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
