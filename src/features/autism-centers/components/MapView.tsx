import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { CAMEROON_BOUNDS, CAMEROON_CENTER, CATEGORY_COLORS, type AutismCenter } from "../types";

type Props = {
  centers: AutismCenter[];
  selectedId: string | null;
  onSelect: (center: AutismCenter) => void;
  theme?: "light" | "dark";
  userLocation?: [number, number] | null;
};

const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function pinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 34 44" aria-hidden="true">
      <path fill="${color}" stroke="white" stroke-width="2"
        d="M17 2C9 2 3 8 3 16c0 11 14 26 14 26s14-15 14-26C31 8 25 2 17 2z"/>
      <circle cx="17" cy="16" r="5.5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "autism-center-pin",
    iconSize: [32, 42],
    iconAnchor: [16, 40],
    popupAnchor: [0, -34],
  });
}

const userIcon = L.divIcon({
  html: `<span style="display:block;width:18px;height:18px;border-radius:50%;
    background:#3b82f6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.35)"></span>`,
  className: "autism-center-user-pin",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/**
 * Pure map rendering layer. Receives data via props; never queries Supabase.
 */
export default function MapView({ centers, selectedId, onSelect, theme = "light", userLocation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterRef = useRef<any>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      maxBounds: CAMEROON_BOUNDS,
      maxBoundsViscosity: 0.6,
      minZoom: 5,
    }).setView(CAMEROON_CENTER, 6);

    tileLayerRef.current = L.tileLayer(TILE_URLS[theme], {
      attribution: "&copy; OpenStreetMap, &copy; CARTO",
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clusterRef.current = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
    });
    map.addLayer(clusterRef.current);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      clusterRef.current = null;
      markersRef.current = {};
      userMarkerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Swap tile theme
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;
    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(TILE_URLS[theme], {
      attribution: "&copy; OpenStreetMap, &copy; CARTO",
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
  }, [theme]);

  // Render markers
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    markersRef.current = {};

    centers.forEach((c) => {
      const m = L.marker([c.latitude, c.longitude], {
        icon: pinIcon(CATEGORY_COLORS[c.category] ?? "#0ea5e9"),
        title: c.name,
        keyboard: true,
        alt: c.name,
      });
      m.on("click", () => onSelectRef.current(c));
      cluster.addLayer(m);
      markersRef.current[c.id] = m;
    });
  }, [centers]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userLocation) {
      userMarkerRef.current = L.marker(userLocation, { icon: userIcon }).addTo(map);
    }
  }, [userLocation]);

  // Focus selection
  useEffect(() => {
    if (!selectedId) return;
    const map = mapRef.current;
    const cluster = clusterRef.current;
    const marker = markersRef.current[selectedId];
    if (!map || !cluster || !marker) return;
    cluster.zoomToShowLayer(marker, () => {
      map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14), { animate: true });
    });
  }, [selectedId]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Map of verified autism support centers in Cameroon" role="application" />;
}
