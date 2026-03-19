/* app/(sistema)/monitoramento/componentes/MapaMonitoramento.js */

"use client"

import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet"
import { useEffect } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Componente para mover a câmera suavemente quando uma estação é selecionada
function FlyToEstacao({ estacao }) {
  const map = useMap()
  useEffect(() => {
    if (estacao?.latitude && estacao?.longitude) {
      map.flyTo([estacao.latitude, estacao.longitude], 13, {
        duration: 1.5,
        easeLinearity: 0.25
      })
    }
  }, [estacao, map])
  return null
}

// Função para criar o pin estilo gota (SACE/CPRM Style)
const criarIconeCustomizado = (cor, selecionada) => {
  const tamanho = selecionada ? 48 : 36;
  
  return L.divIcon({
    className: "custom-pin",
    html: `
      <svg width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.4));">
        <path d="M12 21C16 17.5 19 14.402 19 11.2C19 7.22355 15.866 4 12 4C8.13401 4 5 7.22355 5 11.2C5 14.402 8 17.5 12 21Z" 
          fill="${cor}" 
          stroke="white" 
          stroke-width="${selecionada ? '2' : '1.5'}"
        />
        <circle cx="12" cy="11" r="3" fill="white" fill-opacity="0.9"/>
      </svg>
    `,
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho], 
    tooltipAnchor: [0, -tamanho] 
  })
}

export default function MapaMonitoramento() {
  const { estacoes, estacaoSelecionada, selecionarEstacao } = useMonitoramento()

  // Cores Hex sincronizadas com as classes bg-xxx-500 do Tailwind
  const coresHex = {
    "Normal": "#22c55e",       // green-500
    "Alerta": "#eab308",       // yellow-500
    "Transbordo": "#ef4444",   // red-500
    "Extremo": "#9333ea",      // purple-600
    "Abaixo da régua": "#64748b", // slate-500
    "Sem dados": "#94a3b8"     // gray-400
  }

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative">
      <MapContainer
        center={[-21.75, -41.32]} 
        zoom={9}
        zoomControl={false} // Desativado para deixar o visual mais limpo
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToEstacao estacao={estacaoSelecionada} />

        {estacoes.map((e) => {
          if (!e.latitude || !e.longitude) return null

          const situacao = e.situacao || { texto: "Sem dados", cor: "bg-slate-400" }
          const cor = coresHex[situacao.texto] || "#3b82f6"
          const selecionada = estacaoSelecionada?.id === e.id

          // Tratamento de exibição do nível para o Tooltip
          const nivelTexto = e.medicao?.abaixo_regua 
            ? "Abaixo da Régua" 
            : e.medicao?.nivel != null 
              ? `${Number(e.medicao.nivel).toFixed(2)} m` 
              : "Sem leitura"

          return (
            <Marker
              key={`${e.id}-${e.medicao?.data_hora || 'offline'}`}
              position={[e.latitude, e.longitude]}
              icon={criarIconeCustomizado(cor, selecionada)}
              eventHandlers={{
                click: () => selecionarEstacao(e)
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky>
                <div className="flex flex-col p-1 min-w-[120px]">
                  <header className="flex flex-col mb-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 leading-none">
                      {e.municipio}
                    </span>
                    <span className="text-sm font-black text-slate-800 tracking-tight">
                      {nivelTexto}
                    </span>
                  </header>

                  <div className={`text-[9px] font-black uppercase px-2 py-1 rounded-full text-white text-center shadow-sm ${situacao.cor}`}>
                    {situacao.texto}
                  </div>

                  {selecionada && (
                    <div className="mt-2 text-[8px] text-blue-600 font-bold text-center uppercase tracking-tighter">
                      Estação Selecionada
                    </div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Legenda Flutuante (Opcional, mas profissional) */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl hidden md:block">
        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Legenda de Risco</h4>
        <div className="space-y-2">
          {Object.entries(coresHex).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-slate-600 uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
