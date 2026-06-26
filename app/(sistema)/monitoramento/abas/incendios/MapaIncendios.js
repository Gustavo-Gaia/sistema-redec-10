/* app/(sistema)/monitoramento/abas/incendios/MapaIncendios.js */

"use client"

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  useMap
} from "react-leaflet"

import { useEffect, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

function BotaoReset({ geoArea }) {
  const map = useMap()

  const handleReset = () => {
    if (geoArea) {
      const layer = L.geoJSON(geoArea)

      map.fitBounds(
        layer.getBounds(),
        {
          padding: [40, 40],
          duration: 1.5
        }
      )
    } else {
      map.flyTo(
        [-21.75, -41.32],
        9,
        { duration: 1.5 }
      )
    }
  }

  return (
    <div
      className="leaflet-top leaflet-left"
      style={{
        marginTop: "80px",
        marginLeft: "10px"
      }}
    >
      <button
        onClick={handleReset}
        className="bg-white hover:bg-slate-50 text-slate-700 w-9 h-9 flex items-center justify-center transition-colors rounded-md shadow"
        title="Resetar visão da REDEC"
        style={{
          border: "none",
          cursor: "pointer"
        }}
      >
        ⟳
      </button>
    </div>
  )
}

export default function MapaIncendios() {

  const [geoArea, setGeoArea] = useState(null)

  useEffect(() => {
    fetch("/geo/area_redec_norte.geojson")
      .then(res => res.json())
      .then(data => setGeoArea(data))
  }, [])

  const estiloArea = {
    color: "#dc2626",
    weight: 2,
    fillColor: "#ef4444",
    fillOpacity: 0.08,
    dashArray: "8,8"
  }

  return (
    <div className="w-full h-[650px] rounded-3xl overflow-hidden border border-slate-200">

      <MapContainer
        center={[-21.75, -41.32]}
        zoom={9}
        className="w-full h-full"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BotaoReset geoArea={geoArea} />

        <LayersControl
          position="topright"
          collapsed={false}
        >

          {geoArea && (
            <LayersControl.Overlay
              checked
              name="Área REDEC 10"
            >
              <GeoJSON
                data={geoArea}
                style={estiloArea}
                onEachFeature={(feature, layer) => {

                  const nome =
                    feature.properties?.nome ||
                    feature.properties?.name

                  if (nome) {
                    layer.bindTooltip(
                      `<b>${nome}</b>`,
                      { sticky: true }
                    )
                  }
                }}
              />
            </LayersControl.Overlay>
          )}

        </LayersControl>

      </MapContainer>

    </div>
  )
}
