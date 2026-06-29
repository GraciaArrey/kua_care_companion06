import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPlace = {
  id: string;
  name: string;
  category: string;
  note?: string | null;
  noteFr?: string | null;
  address?: string | null;
  phone?: string | null;
  sourceLabel?: string | null;
  sourceLabelFr?: string | null;
  sourceUrl?: string | null;
  verified?: boolean | null;
  lat: number;
  lng: number;
};

const COLORS: Record<string, string> = {
  Schools: "#0ea5e9",
  "Parent groups": "#22c55e",
  Emergency: "#ef4444",
  Therapists: "#a855f7",
  Other: "#f59e0b",
};

function pinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <defs><filter id="s" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter></defs>
      <path filter="url(#s)" fill="${color}" stroke="white" stroke-width="2"
        d="M17 2C9 2 3 8 3 16c0 11 14 26 14 26s14-15 14-26C31 8 25 2 17 2z"/>
      <circle cx="17" cy="16" r="5.5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "kua-pin",
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -36],
  });
}

const userIcon = L.divIcon({
  html: `<span style="display:block;width:18px;height:18px;border-radius:50%;
    background:#3b82f6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.35)"></span>`,
  className: "kua-me",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

type Props = {
  center: [number, number];
  userLocation: [number, number] | null;
  places: MapPlace[];
  onMapClick?: (lat: number, lng: number) => void;
  focusId?: string | null;
};

export default function LeafletMap({ center, userLocation, places, onMapClick, focusId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    if (onMapClick) {
      map.on("click", (e) => onMapClick(e.latlng.lat, e.latlng.lng));
    }
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current) mapRef.current.setView(center, mapRef.current.getZoom() || 13);
  }, [center[0], center[1]]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markersRef.current = {};

    if (userLocation) {
      L.marker(userLocation, { icon: userIcon }).addTo(layer).bindPopup("You are here");
    }

    places.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: pinIcon(COLORS[p.category] || COLORS.Other) }).addTo(layer);
      const dirHref = `https://www.openstreetmap.org/directions?from=${userLocation ? `${userLocation[0]},${userLocation[1]}` : ""}&to=${p.lat},${p.lng}`;
      m.bindPopup(`
        <div style="min-width:180px;font-family:inherit">
          <div style="font-weight:700;margin-bottom:2px">${escapeHtml(p.name)}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px">${escapeHtml(p.category)}</div>
          ${p.note ? `<div style="font-size:12px;margin-bottom:6px">${escapeHtml(p.note)}</div>` : ""}
          ${p.address ? `<div style="font-size:11px;color:#64748b;margin-bottom:6px">${escapeHtml(p.address)}</div>` : ""}
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${p.phone ? `<a href="tel:${escapeHtml(p.phone)}" style="font-size:11px;font-weight:600;color:#0ea5e9">Call</a>` : ""}
            <a href="${dirHref}" target="_blank" rel="noreferrer" style="font-size:11px;font-weight:600;color:#0ea5e9">Directions</a>
            ${p.sourceUrl ? `<a href="${escapeHtml(p.sourceUrl)}" target="_blank" rel="noreferrer" style="font-size:11px;font-weight:600;color:#0ea5e9">Source</a>` : ""}
          </div>
        </div>`);
      markersRef.current[p.id] = m;
    });
  }, [places, userLocation]);

  useEffect(() => {
    if (!focusId) return;
    const m = markersRef.current[focusId];
    const map = mapRef.current;
    if (m && map) {
      map.setView(m.getLatLng(), Math.max(map.getZoom(), 15), { animate: true });
      m.openPopup();
    }
  }, [focusId]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
