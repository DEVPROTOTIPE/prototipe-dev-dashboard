import React, { useState, useRef } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Layers } from 'lucide-react';

function GaleriaRendersMuebles() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
      <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">Comparador CAD vs Instalación</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Desliza la barra para contrastar el Render 3D con la foto real</p>
        </div>
        <Layers className="w-5 h-5 text-indigo-400" />
      </div>

      {/* Contenedor comparador — ambos paneles tienen inset-0 */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-3)] select-none"
      >
        {/* Panel DERECHO: Foto Real (fondo completo) */}
        <div className="absolute inset-0 flex items-center justify-center text-center p-6 bg-[var(--color-surface-2)]">
          <div className="flex flex-col items-center gap-1.5 text-xs text-[var(--color-text)]">
            <span className="font-extrabold text-sm text-indigo-400 uppercase tracking-widest bg-[var(--color-surface-3)]/60 px-3 py-1 rounded-full border border-indigo-500/20">
              Foto Real
            </span>
            <span className="text-[var(--color-text-muted)]">Vista del Mueble Instalado y Terminado</span>
            <div className="w-32 h-20 bg-[var(--color-surface-3)]/40 rounded-xl border border-dashed border-[var(--color-border)] flex items-center justify-center text-[10px] italic text-[var(--color-text-muted)] mt-2">
              [Foto del Mueble Físico]
            </div>
          </div>
        </div>

        {/* Panel IZQUIERDO: Render 3D — mismo inset-0, recortado por clipPath */}
        <div
          className="absolute inset-0 flex items-center justify-center text-center p-6 bg-[var(--color-surface-3)]"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <div className="flex flex-col items-center gap-1.5 text-xs text-[var(--color-text)]">
            <span className="font-extrabold text-sm text-amber-400 uppercase tracking-widest bg-[var(--color-surface-2)]/60 px-3 py-1 rounded-full border border-amber-500/20">
              Render 3D
            </span>
            <span className="text-[var(--color-text-muted)]">Diseño Digital Fotorrealista CAD</span>
            <div className="w-32 h-20 bg-[var(--color-surface-2)]/40 rounded-xl border border-dashed border-[var(--color-border)] flex items-center justify-center text-[10px] italic text-[var(--color-text-muted)] mt-2">
              [Render 3D Computarizado]
            </div>
          </div>
        </div>

        {/* Línea divisora + handle */}
        <div
          className="absolute inset-y-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ left: `calc(${sliderPos}% - 1px)` }}
        >
          <div className="w-0.5 h-full bg-white/80" />
          <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg border-2 border-indigo-400 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 12h8M11 9l-3 3 3 3M13 9l3 3-3 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Control range */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)]">
          <span>← Diseño Render</span>
          <span className="text-[var(--color-text)] font-black">{sliderPos}%</span>
          <span>Instalación Real →</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(parseInt(e.target.value))}
          className="w-full h-1 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
    </div>
  );
}

export default function GaleriaRendersMueblesSandbox() {
  return (
    <SandboxLayout
      title="Galería de Renders y Muebles"
      description="Slider de comparación visual interactivo entre diseño CAD y foto de instalación real"
    >
      <GaleriaRendersMuebles />
    </SandboxLayout>
  );
}
