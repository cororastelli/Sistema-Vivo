"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import type { SpaceRecord } from "@/lib/system-vivo-types";

function FitVisibleSpaces({ spaces }: { spaces: SpaceRecord[] }) {
  const map = useMap();
  useEffect(() => {
    const points = spaces
      .filter((space) => space.latitude != null && space.longitude != null)
      .map((space) => [space.latitude as number, space.longitude as number] as [number, number]);
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 16, { animate: true });
    else map.fitBounds(latLngBounds(points), { padding: [32, 32], maxZoom: 15, animate: true });
  }, [map, spaces]);
  return null;
}

export function CabaMap({ spaces, selectedId, relatedIds = [], onSelect }: { spaces: SpaceRecord[]; selectedId: string; relatedIds?: string[]; onSelect: (id: string) => void }) {
  const located = spaces.filter((space) => space.latitude != null && space.longitude != null);
  return (
    <div className="sv-map-wrap">
      <MapContainer center={[-34.615, -58.445]} zoom={11} minZoom={10} maxZoom={18} scrollWheelZoom preferCanvas className="sv-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitVisibleSpaces spaces={located} />
        {located.map((space) => {
          const selected = space.id === selectedId;
          const related = relatedIds.includes(space.id);
          return (
            <CircleMarker
              key={space.id}
              center={[space.latitude as number, space.longitude as number]}
              radius={selected ? 9 : related ? 7 : space.status === "case-study" ? 7 : 4}
              pathOptions={{
                color: selected ? "#101411" : related ? "#ff9b5e" : space.status === "case-study" ? "#101411" : "#64702f",
                weight: selected ? 3 : related ? 2 : 1,
                fillColor: selected ? "#d7fb43" : related ? "#ff744f" : space.status === "case-study" ? "#d7fb43" : "#c9ea45",
                fillOpacity: selected || related ? 1 : 0.68,
              }}
              eventHandlers={{ click: () => onSelect(space.id) }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <div className="sv-map-tooltip"><strong>{space.name}</strong><span>{space.neighborhood} · Comuna {space.commune}</span><small>{space.type}</small></div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="sv-map-legend"><span><i className="case" /> Caso activo</span>{relatedIds.length > 0 && <span><i className="related" /> Caso vinculado</span>}<span><i /> Registro oficial</span><b>{located.length.toLocaleString("es-AR")} visibles</b></div>
      <p className="sv-map-method">Los puntos usan el centro aproximado calculado a partir de cada geometría oficial. El polígono completo se incorporará en una próxima capa cartográfica.</p>
    </div>
  );
}
