import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ScheduleItem } from '../types';
import { CATEGORY_THEMES, DAY_COLORS } from '../utils/categoryTheme';
import { Crosshair, Maximize2, ZoomIn, ZoomOut, Layers, AlertCircle } from 'lucide-react';

interface TravelMapProps {
  spots: ScheduleItem[];
  selectedSpotId: string | null;
  onSelectSpot: (id: string) => void;
  currentDay: number | 'all';
}

export const TravelMap: React.FC<TravelMapProps> = ({
  spots,
  selectedSpotId,
  onSelectSpot,
  currentDay,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [tileType, setTileType] = useState<'osm' | 'light'>('osm');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on Dongdaemun, Seoul
    const map = L.map(mapContainerRef.current, {
      center: [37.5685, 127.0090],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap Tile Layer
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Ensure Leaflet redraws on container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Style (Standard vs Clean CartoDB Positron if online)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const url = tileType === 'osm'
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const newLayer = L.tileLayer(url, {
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(mapInstanceRef.current);
    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [tileType]);

  // Update Markers and Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current.clear();

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const filteredSpots = currentDay === 'all'
      ? spots
      : spots.filter(s => s.day === currentDay);

    if (filteredSpots.length === 0) return;

    // Draw route polyline (grouped by day if all, or just current day)
    const latLngs = filteredSpots.map(s => [s.lat, s.lng] as [number, number]);
    const routeColor = currentDay === 'all' ? '#6366f1' : DAY_COLORS[currentDay]?.stroke || '#0284c7';

    const polyline = L.polyline(latLngs, {
      color: routeColor,
      weight: 3.5,
      opacity: 0.75,
      dashArray: '6, 8',
      lineCap: 'round',
    }).addTo(map);
    polylineRef.current = polyline;

    // Create custom markers
    filteredSpots.forEach((spot, idx) => {
      const isSelected = spot.id === selectedSpotId;
      const theme = CATEGORY_THEMES[spot.category];
      const dayColor = DAY_COLORS[spot.day]?.stroke || '#0284c7';

      // Custom HTML Marker using Tailwind classes
      const iconHtml = `
        <div class="relative flex items-center justify-center group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'}">
          ${isSelected ? `
            <span class="absolute -inset-2 rounded-full bg-sky-400/40 animate-ping"></span>
            <span class="absolute -inset-1 rounded-full bg-sky-500/30"></span>
          ` : ''}
          <div class="relative flex items-center gap-1 px-2 py-1 rounded-full shadow-md border ${
            isSelected
              ? 'bg-slate-900 text-white border-sky-400 ring-2 ring-sky-400 ring-offset-2'
              : 'bg-white/95 text-slate-800 border-slate-200/80 backdrop-blur-sm hover:border-slate-400'
          }">
            <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isSelected ? 'bg-sky-400 text-slate-950' : 'bg-slate-100 text-slate-700'
            }" style="${!isSelected ? `color: ${dayColor}` : ''}">
              ${idx + 1}
            </span>
            <span class="text-xs font-semibold whitespace-nowrap tracking-tight pr-0.5 max-w-[120px] truncate">
              ${spot.time}
            </span>
          </div>
          <!-- Pointer arrow -->
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
            isSelected ? 'bg-slate-900 border-r border-b border-sky-400' : 'bg-white border-r border-b border-slate-200/80'
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-pin',
        iconSize: [80, 36],
        iconAnchor: [40, 36],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon, zIndexOffset: isSelected ? 1000 : 10 })
        .addTo(map)
        .on('click', () => {
          onSelectSpot(spot.id);
        });

      // Simple popup on hover or click
      marker.bindTooltip(
        `<div class="p-1">
          <div class="text-[10px] font-bold text-slate-400">Day ${spot.day} • ${spot.time}</div>
          <div class="text-xs font-bold text-slate-800">${spot.title}</div>
          ${spot.koreanName ? `<div class="text-[10px] text-slate-500">${spot.koreanName}</div>` : ''}
        </div>`,
        { direction: 'top', offset: [0, -28], opacity: 0.95 }
      );

      markersRef.current.set(spot.id, marker);
    });
  }, [spots, currentDay, selectedSpotId, onSelectSpot]);

  // Center & zoom on selected spot
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSpotId) return;

    const targetSpot = spots.find(s => s.id === selectedSpotId);
    if (!targetSpot) return;

    // Smoothly fly to the spot
    map.flyTo([targetSpot.lat, targetSpot.lng], 16, {
      animate: true,
      duration: 0.9,
    });

    // Open tooltip of selected marker
    const marker = markersRef.current.get(selectedSpotId);
    if (marker) {
      marker.openTooltip();
    }
  }, [selectedSpotId, spots]);

  // Fit bounds helper
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const filteredSpots = currentDay === 'all'
      ? spots
      : spots.filter(s => s.day === currentDay);

    if (filteredSpots.length === 0) return;

    const bounds = L.latLngBounds(filteredSpots.map(s => [s.lat, s.lng]));
    map.fitBounds(bounds, {
      padding: [48, 48],
      maxZoom: 16,
      animate: true,
    });
  };

  // GPS Location handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError('お使いのブラウザはGPS位置情報に対応していません');
      setTimeout(() => setGpsError(null), 3500);
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }

        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping"></span>
              <span class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></span>
            </div>
          `,
          className: 'user-gps-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const userMarker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 2000 })
          .addTo(map)
          .bindPopup('<div class="text-xs font-bold text-slate-800 p-1">📍 現在地</div>')
          .openPopup();

        userMarkerRef.current = userMarker;
        map.flyTo([latitude, longitude], 16, { animate: true });
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('現在地を取得できませんでした（位置情報の許可をご確認ください）');
        setTimeout(() => setGpsError(null), 3500);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div id="map-wrapper" className="relative w-full h-full overflow-hidden bg-slate-100">
      {/* The Leaflet Container (fills the 50vh space) */}
      <div
        id="leaflet-map-canvas"
        ref={mapContainerRef}
        className="w-full h-full z-0 outline-none"
      />

      {/* Floating Map Controls (White Glassmorphic Bar) */}
      <div className="absolute top-2.5 right-2.5 z-30 flex flex-col gap-1 shadow-xs">
        <div className="flex flex-col bg-white/90 backdrop-blur-md border border-white/70 rounded-lg shadow-sm p-0.5 gap-0.5">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="ズームイン"
            title="ズームイン"
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100/90 rounded-md transition-colors active:scale-95"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-[1px] bg-slate-200/60 mx-1" />
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="ズームアウト"
            title="ズームアウト"
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100/90 rounded-md transition-colors active:scale-95"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleFitBounds}
          aria-label="全体表示"
          title="全体を表示"
          className="w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur-md border border-white/70 rounded-lg shadow-sm text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleLocateMe}
          aria-label="現在地"
          title="現在地を取得"
          className={`w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur-md border border-white/70 rounded-lg shadow-sm transition-all active:scale-95 ${
            gpsLoading ? 'animate-spin text-sky-600' : 'text-slate-700 hover:text-sky-600'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setTileType(t => t === 'osm' ? 'light' : 'osm')}
          aria-label="地図デザイン切替"
          title="地図デザイン切替"
          className="w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur-md border border-white/70 rounded-lg shadow-sm text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Day Indicator / Route Info badge (Top Left) */}
      <div className="absolute top-2.5 left-2.5 z-30 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md border border-white/70 rounded-full shadow-sm text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-800">
            {currentDay === 'all' ? '全行程' : `Day ${currentDay}`}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            ({(currentDay === 'all' ? spots : spots.filter(s => s.day === currentDay)).length}地点)
          </span>
        </div>
      </div>

      {/* GPS Error Notification Toast */}
      {gpsError && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-rose-900/90 text-white text-xs rounded-full shadow-xl backdrop-blur-sm animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}
    </div>
  );
};
