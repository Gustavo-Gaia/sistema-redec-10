/* app/(sistema)/monitoramento/componentes/MapaMonitoramento.js */

"use client"

import { MapContainer, TileLayer, Marker, Tooltip, useMap, GeoJSON, LayersControl } from "react-leaflet"
import { useEffect, useState } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Maximize } from "lucide-react"

// ========================================
// 🚀 COMPONENTE PARA RESETAR VISUALIZAÇÃO
// ========================================
function BotaoReset({ geoArea }) {
  const map = useMap()

  const handleReset = () => {
    if (geoArea) {
      const layer = L.geoJSON(geoArea)
      map.fitBounds(layer.getBounds(), { padding: [40, 40], duration: 1.5 })
    } else {
      map.flyTo([-21.75, -41.32], 9, { duration: 1.5 })
    }
  }

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: "80px", marginLeft: "10px" }}>
      <div className="leaflet-control leaflet-bar border-none shadow-md">
        <button
          onClick={handleReset}
          className="bg-white hover:bg-slate-50 text-slate-700 w-9 h-9 flex items-center justify-center transition-colors rounded-md"
          title="Resetar para visão geral da REDEC"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <Maximize size={18} />
        </button>
      </div>
    </div>
  )
}

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
  
  // Estados para as camadas geográficas
  const [geoRios, setGeoRios] = useState(null)
  const [geoLagoas, setGeoLagoas] = useState(null)
  const [geoArea, setGeoArea] = useState(null)

  // 🔥 CARREGAMENTO DOS ARQUIVOS GEOJSON
  useEffect(() => {
    fetch("/geo/rios_monitorados.geojson")
      .then(res => res.json())
      .then(data => setGeoRios(data))
      .catch(err => console.error("Erro ao carregar rios:", err))

    fetch("/geo/lagoas_monitoradas.geojson")
      .then(res => res.json())
      .then(data => setGeoLagoas(data))
      .catch(err => console.error("Erro ao carregar lagoas:", err))

    fetch("/geo/area_redec_norte.geojson")
      .then(res => res.json())
      .then(data => setGeoArea(data))
      .catch(err => console.error("Erro ao carregar área REDEC:", err))
  }, [])

  // 🎨 ESTILOS DAS CAMADAS
  const estiloRios = {
    color: "#2c7fb8",
    weight: 3,
    opacity: 0.8
  }

  const estiloLagoas = {
    fillColor: "#74add1",
    color: "#2c7fb8",
    weight: 2,
    fillOpacity: 0.5
  }

  const estiloArea = {
    color: "#475569",      // Cinza chumbo para a borda (Slate-600)
    weight: 2,
    fillColor: "#64748b",  // Um tom de azul acinzentado (Slate-500)
    fillOpacity: 0.15,     // Aumentamos de 0.02 para 0.15 para ficar visível
    dashArray: "8, 8",     // Mantém o tracejado profissional
    interactive: true
  }

  const coresHex = {
    normal: "#10b981",
    alerta: "#facc15",
    transbordo: "#ef4444",
    extremo: "#a21caf",
    abaixo_regua: "#64748b",
    sem_dado: "#94a3b8",
    sem_cota: "#94a3b8"
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
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
        <BotaoReset geoArea={geoArea} />

        {/* 🛠️ CONTROLE DE CAMADAS */}
        <LayersControl position="topright" collapsed={true}>
          
          {/* CAMADA ÁREA REDEC NORTE */}
          {geoArea && (
            <LayersControl.Overlay checked name="📍 Área REDEC Norte">
              <GeoJSON 
                data={geoArea} 
                style={estiloArea}
                onEachFeature={(feature, layer) => {
                  if (feature.properties?.name) {
                    layer.bindTooltip(`<b>Município:</b> ${feature.properties.name}`, { sticky: true })
                  }
                }}
              />
            </LayersControl.Overlay>
          )}

          {/* CAMADA DE LAGOAS */}
          {geoLagoas && (
            <LayersControl.Overlay checked name="🟦 Lagoas Monitoradas">
              <GeoJSON 
                data={geoLagoas} 
                style={estiloLagoas}
                onEachFeature={(feature, layer) => {
                  if (feature.properties?.name) {
                    layer.bindTooltip(`<b>Lagoa:</b> ${feature.properties.name}`, { sticky: true })
                  }
                }}
              />
            </LayersControl.Overlay>
          )}

          {/* CAMADA DE RIOS */}
          {geoRios && (
            <LayersControl.Overlay checked name="🌊 Rios Monitorados">
              <GeoJSON 
                data={geoRios} 
                style={estiloRios}
                onEachFeature={(feature, layer) => {
                  if (feature.properties?.name) {
                    layer.bindTooltip(`<b>Rio:</b> ${feature.properties.name}`, { sticky: true })
                  }
                }}
              />
            </LayersControl.Overlay>
          )}

        </LayersControl>

        {/* 📍 MARCADORES DAS ESTAÇÕES */}
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
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center leading-none">
                    {e.municipio}
                  </div>
                  <div className="text-sm font-black text-slate-900 text-center mt-1">
                    {e.medicao?.abaixo_regua
                      ? "A/R"
                      : `${e.medicao?.nivel?.toFixed(2) || "0.00"} m`}
                  </div>
                  <div className={`mt-1 text-[9px] font-black uppercase text-center px-2 py-0.5 rounded ${e.situacao?.cor || 'bg-slate-500'} text-white`}>
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
