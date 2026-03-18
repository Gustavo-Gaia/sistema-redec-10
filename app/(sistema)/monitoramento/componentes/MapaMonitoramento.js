/* app/(sistema)/monitoramento/componentes/MapaMonitoramento.js */

"use client"

import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet"
import { useEffect } from "react"
import { useMonitoramento } from "../MonitoramentoContext"

// ===============================
// FLY TO
// ===============================

function FlyToEstacao({ estacao }) {
  const map = useMap()

  useEffect(() => {
    if (!estacao?.latitude) return

    map.flyTo(
      [estacao.latitude, estacao.longitude],
      13,
      { duration: 1.5 }
    )
  }, [estacao, map])

  return null
}

// ===============================
// COR POR STATUS
// ===============================

function getCor(situacao) {
  switch (situacao?.texto) {
    case "Normal":
      return "#22c55e"
    case "Alerta":
      return "#eab308"
    case "Transbordo":
      return "#ef4444"
    case "Extremo":
      return "#9333ea"
    default:
      return "#3b82f6"
  }
}

// ===============================
// MAPA
// ===============================

export default function MapaMonitoramento() {

  const {
    estacoes,
    estacaoSelecionada,
    selecionarEstacao
  } = useMonitoramento()

  return (

    <div className="w-full h-full rounded-2xl overflow-hidden">

      <MapContainer
        center={[-22.9, -43.2]}
        zoom={8}
        className="w-full h-full z-0"
      >

        {/* BASE MAP */}
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* FLY TO */}
        <FlyToEstacao estacao={estacaoSelecionada} />

        {/* MARCADORES */}
        {estacoes.map((e) => {

          if (!e.latitude || !e.longitude) return null

          const cor = getCor(e.situacao)
          const selecionada = estacaoSelecionada?.id === e.id

          return (
            <CircleMarker
              key={e.id}
              center={[e.latitude, e.longitude]}
              radius={selecionada ? 14 : 10}
              pathOptions={{
                color: cor,
                fillColor: cor,
                fillOpacity: 0.9,
                weight: selecionada ? 3 : 1
              }}
              eventHandlers={{
                click: () => selecionarEstacao(e)
              }}
            />
          )
        })}

      </MapContainer>

    </div>
  )
}

