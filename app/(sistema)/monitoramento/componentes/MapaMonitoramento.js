/* app/(sistema)/monitoramento/componentes/MapaMonitoramento.js */

"use client"

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import { useEffect } from "react"
import { useMonitoramento } from "../MonitoramentoContext"

// ===============================
// CONTROLADOR DE FOCO (flyTo)
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
// MAPA PRINCIPAL
// ===============================

export default function MapaMonitoramento() {

  const {
    estacoes,
    estacaoSelecionada,
    setEstacaoSelecionada
  } = useMonitoramento()

  return (

    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200">

      <MapContainer
        center={[-22.9, -43.2]} // RJ padrão (ajustamos depois se quiser)
        zoom={8}
        className="w-full h-full"
      >

        {/* BASE MAP */}
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* FLY TO */}
        <FlyToEstacao estacao={estacaoSelecionada} />

        {/* MARKERS */}
        {estacoes.map((e) => {

          if (!e.latitude || !e.longitude) return null

          const cor = e.situacao?.cor?.includes("red")
            ? "#ef4444"
            : e.situacao?.cor?.includes("yellow")
            ? "#eab308"
            : "#22c55e"

          return (
            <CircleMarker
              key={e.id}
              center={[e.latitude, e.longitude]}
              radius={10}
              pathOptions={{
                color: cor,
                fillColor: cor,
                fillOpacity: 0.8
              }}
              eventHandlers={{
                click: () => setEstacaoSelecionada(e)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{e.nome || "Estação"}</strong>
                  <br />
                  {e.municipio}
                  <br />
                  {e.medicao?.nivel
                    ? `${Number(e.medicao.nivel).toFixed(2)} m`
                    : "Sem dados"}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

      </MapContainer>

    </div>
  )
}

