import React, { useState, useRef, useEffect } from 'react';
import SandboxLayout from './SandboxLayout';
import CustomSelect from '../../ui/CustomSelect';

export default function LeafletMapPickerSandbox() {
  // Coordenadas base en Bogotá, Colombia
  const [lat, setLat] = useState(4.6097);
  const [lng, setLng] = useState(-74.08175);
  const [zoom, setZoom] = useState(13);
  const [markerType, setMarkerType] = useState('home');
  const [address, setAddress] = useState('Calle 26 # 68c-61, Bogotá');
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef(null);

  // Manejar el clic dentro de la cuadrícula simulada del mapa
  const handleMapClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convertir porcentaje de clic a diferencias relativas de coordenadas
    const pctX = x / rect.width;
    const pctY = y / rect.height;

    // Bogotá aproximado
    const newLat = 4.65 - (pctY * 0.1);
    const newLng = -74.15 + (pctX * 0.15);

    setLat(Number(newLat.toFixed(5)));
    setLng(Number(newLng.toFixed(5)));
    setAddress(`Avenida Américas (Geocodificada: ${newLat.toFixed(4)}, ${newLng.toFixed(4)})`);
  };

  // Simular geocodificación inversa
  const triggerGeocodeSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setAddress('Carrera 7 # 32-16, Bogotá Centro');
      setLat(4.6212);
      setLng(-74.0684);
    }, 800);
  };

  // Marcadores gráficos según el tipo de nicho seleccionado
  const markerIcons = {
    home: '📍',
    store: '🏬',
    delivery: '🏍️',
    construction: '🚜'
  };

  // Calcular la posición visual del pin en la cuadrícula de simulación
  const getPinPosition = () => {
    // Latitud en Bogotá varía aprox de 4.55 a 4.65
    // Longitud varía aprox de -74.15 a -74.00
    const latPct = Math.min(100, Math.max(0, ((4.65 - lat) / 0.1) * 100));
    const lngPct = Math.min(100, Math.max(0, ((lng - (-74.15)) / 0.15) * 100));
    return { top: `${latPct}%`, left: `${lngPct}%` };
  };

  return (
    <SandboxLayout
      title="Selector de Mapa Interactivo (LeafletMapPicker)"
      description="Playground interactivo para simular el visor geográfico del cliente en la PWA (Leaflet). Permite simular clics en el mapa, geocodificación de direcciones y marcadores de entrega."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Dirección del Pedido</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={triggerGeocodeSearch}
                disabled={isSearching}
                className="h-10 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-[11px] cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSearching ? '...' : 'Buscar'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Latitud</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Longitud</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Nivel de Zoom ({zoom})</label>
            <input
              type="range"
              min="10"
              max="18"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Icono de Marcador</label>
            <CustomSelect
              value={markerType}
              onChange={(val) => setMarkerType(val)}
              options={[
                { value: 'home', label: 'Domicilio Domicilio (📍)' },
                { value: 'store', label: 'Establecimiento Comercial (🏬)' },
                { value: 'delivery', label: 'Repartidor en Ruta (🏍️)' },
                { value: 'construction', label: 'Vehículo de Carga (🚜)' }
              ]}
            />
          </div>
        </div>
      }
    >
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-4">
        {/* Simulador de Mapa */}
        <div 
          ref={containerRef}
          onClick={handleMapClick}
          className="relative h-60 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden cursor-crosshair select-none"
        >
          {/* Cuadrícula de Calles Simula Mapa Satelital */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          {/* Zonas Verdes / Ríos Simulados */}
          <div className="absolute top-1/4 left-1/3 w-24 h-16 bg-emerald-500/10 rounded-full blur-xl" />
          <div className="absolute bottom-1/3 right-1/4 w-32 h-20 bg-blue-500/10 rounded-full blur-xl" />

          {/* Marcador Dinámico */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 flex flex-col items-center z-10"
            style={getPinPosition()}
          >
            {/* Etiqueta flotante */}
            <div className="bg-[var(--color-surface-3)]/95 text-[10px] text-[var(--color-text)] px-2 py-0.5 rounded border border-indigo-500/30 whitespace-nowrap mb-1 font-bold">
              {markerIcons[markerType]} {markerType.toUpperCase()}
            </div>
            {/* Pin animado */}
            <div className="text-2xl animate-bounce">
              📍
            </div>
          </div>

          {/* Indicador de coordenadas en esquina */}
          <div className="absolute bottom-3 left-3 bg-[var(--color-surface-3)]/90 border border-[var(--color-border)] rounded px-2.5 py-1 text-[9px] font-mono text-[var(--color-text-muted)]">
            Lat: {lat.toFixed(5)} | Lng: {lng.toFixed(5)} | Zoom: {zoom}
          </div>
        </div>

        {/* Info de Ubicación Elegida */}
        <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Ubicación Seleccionada</span>
            <p className="text-xs font-bold text-[var(--color-text)] truncate mt-0.5">{address}</p>
          </div>
          <button
            onClick={() => alert(`Coordenadas registradas con éxito:\n\nLatitud: ${lat}\nLongitud: ${lng}\nDirección: ${address}`)}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-98 transition-all border-none"
          >
            Confirmar Ubicación
          </button>
        </div>
      </div>
    </SandboxLayout>
  );
}
