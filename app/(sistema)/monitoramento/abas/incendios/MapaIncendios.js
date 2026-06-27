/* app/(sistema)/monitoramento/abas/incendios/MapaIncendios.js */

"use client"

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet"

import {
  useEffect,
  useState
} from "react"

import L from "leaflet"

import "leaflet/dist/leaflet.css"

import {
  useMonitoramentoIncendios
} from "./MonitoramentoIncendiosContext"

function BotaoReset({ geoArea }) {

  const map = useMap()

  function handleReset() {

    if (geoArea) {

      const layer =
        L.geoJSON(geoArea)

      map.fitBounds(
        layer.getBounds(),
        {
          padding: [40, 40],
          duration: 1.5
        }
      )

      return
    }

    map.flyTo(
      [-21.75, -41.32],
      9,
      {
        duration: 1.5
      }
    )
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
        className="
          bg-white
          hover:bg-slate-50
          text-slate-700
          w-9
          h-9
          flex
          items-center
          justify-center
          transition-colors
          rounded-md
          shadow
        "
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

  const [geoArea, setGeoArea] =
    useState(null)

  const {
    ocorrenciasFiltradas,
    filtros
  } = useMonitoramentoIncendios()

  useEffect(() => {

    fetch(
      "/geo/area_redec_norte.geojson"
    )
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

    <div
      className="
        h-[700px]
        rounded-2xl
        overflow-hidden
        border
        border-slate-200
      "
    >

      <MapContainer
        center={[-21.75, -41.32]}
        zoom={9}
        className="w-full h-full"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap"
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
                onEachFeature={(
                  feature,
                  layer
                ) => {

                  const nome =
                    feature.properties?.nome ||
                    feature.properties?.name

                  if (nome) {

                    layer.bindTooltip(
                      `<b>${nome}</b>`,
                      {
                        sticky: true
                      }
                    )
                  }
                }}
              />
            </LayersControl.Overlay>
          )}

        </LayersControl>

        {/* ===========================
            OCORRÊNCIAS REAIS
        =========================== */}

        {ocorrenciasFiltradas.map(
          (o) => {

            if (
              !o.latitude ||
              !o.longitude
            ) {
              return null
            }

            return (
              <CircleMarker
                key={o.id}
                center={[
                  Number(o.latitude),
                  Number(o.longitude)
                ]}
                radius={5}
                pathOptions={{
                  color: "#991b1b",
                  fillColor: "#ef4444",
                  fillOpacity: 0.8,
                  weight: 1
                }}
              >

                <Popup>

                  <div className="space-y-2 min-w-[220px]">

                    <div className="font-bold text-red-700">
                      🔥 Fogo em Vegetação
                    </div>

                    <div>
                      <strong>Município:</strong>
                      <br />
                      {o.municipio_nome}
                    </div>

                    <div>
                      <strong>Bairro:</strong>
                      <br />
                      {o.bairro || "-"}
                    </div>

                    <div>
                      <strong>Endereço:</strong>
                      <br />
                      {o.endereco || "-"}
                    </div>

                    <div>
                      <strong>Data:</strong>
                      <br />
                      {new Date(
                        o.data_ocorrencia
                      ).toLocaleString(
                        "pt-BR"
                      )}
                    </div>

                    <div>
                      <strong>Subtipo:</strong>
                      <br />
                      {o.subtipo || "-"}
                    </div>

                  </div>

                </Popup>

              </CircleMarker>
            )
          }
        )}

      </MapContainer>

    </div>
  )
}
