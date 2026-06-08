import React, { useState } from 'react';
import CustomCursor from '../../../App'; // Importamos el CustomCursor que está en App.jsx para probarlo directamente
// Nota: En una integración limpia se importaría de su propio archivo UI. Como estamos en la consola, probamos la implementación local de App.jsx.

export default function CustomCursorSandbox() {
  const [isActive, setIsActive] = useState(false);
  const [cursorColor, setCursorColor] = useState('#8b5cf6');
  const [cursorSize, setCursorSize] = useState(40);
  const [ringOpacity, setRingOpacity] = useState(0.6);

  const colors = [
    { name: 'Violeta Eléctrico', hex: '#8b5cf6' },
    { name: 'Cian Tech', hex: '#06b6d4' },
    { name: 'Esmeralda', hex: '#10b981' },
    { name: 'Cyberpunk Rose', hex: '#ec4899' },
    { name: 'Amber Warm', hex: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Controles de Configuración */}
      <div className="bg-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          Controles del Cursor Personalizado
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de Color */}
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-text-muted)] block">Color del Puntero y Halo</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setCursorColor(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                    cursorColor === c.hex
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <input
                type="color"
                value={cursorColor}
                onChange={(e) => setCursorColor(e.target.value)}
                className="w-8 h-8 rounded-full border-2 border-transparent cursor-pointer bg-transparent"
              />
            </div>
          </div>

          {/* Tamaño del Aro */}
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-text-muted)] flex justify-between">
              <span>Tamaño del Aro (px):</span>
              <span className="font-mono text-violet-400 font-bold">{cursorSize}px</span>
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={cursorSize}
              onChange={(e) => setCursorSize(Number(e.target.value))}
              className="w-full h-1 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>
        </div>

        {/* Interruptor de Activación */}
        <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-[var(--color-text)]">Simular en esta Pantalla</h4>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Activa y sobrescribe temporalmente el cursor en el dashboard.
            </p>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20'
            }`}
          >
            {isActive ? 'Desactivar Simulación' : 'Habilitar Cursor Custom'}
          </button>
        </div>
      </div>

      {/* Zona de Pruebas Interactiva */}
      <div className="relative overflow-hidden bg-[var(--color-surface)]/20 border border-[var(--color-border)] rounded-2xl p-6 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4">
        {/* Renderizado Condicional del Cursor Custom local */}
        {isActive && (
          <CustomCursor color={cursorColor} size={cursorSize} />
        )}

        <div className="max-w-md space-y-2 z-10">
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-violet-400 bg-violet-500/10 rounded-full uppercase">
            Zona de Pruebas de Hover
          </span>
          <h4 className="text-sm font-semibold text-[var(--color-text)]">
            Mueve tu puntero sobre los elementos de abajo
          </h4>
          <p className="text-xs text-[var(--color-text-muted)]">
            El aro de seguimiento debería expandirse y cambiar a un fondo suave de color {cursorColor} cuando te sitúes sobre botones, enlaces y campos de texto.
          </p>
        </div>

        {/* Elementos Interactivos para Prueba */}
        <div className="flex flex-wrap gap-3 justify-center items-center pt-4 w-full max-w-lg z-10">
          <button className="px-4 py-2 bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text)] transition-colors cursor-pointer">
            Botón Estándar
          </button>
          
          <a
            href="#no-link"
            onClick={(e) => e.preventDefault()}
            className="text-xs text-violet-400 hover:text-violet-300 underline font-medium cursor-pointer"
          >
            Enlace de Texto
          </a>

          <input
            type="text"
            placeholder="Pasa el mouse e ingresa texto..."
            className="px-3 py-2 text-xs bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl focus:border-violet-500 outline-none text-[var(--color-text)] placeholder-[var(--color-text-muted)] max-w-[200px]"
          />

          <select className="px-3 py-2 text-xs bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl focus:border-violet-500 outline-none text-[var(--color-text)] cursor-pointer">
            <option>Opción 1</option>
            <option>Opción 2</option>
          </select>
        </div>

        {/* Nota informativa */}
        {isActive && (
          <p className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg max-w-sm mt-4 animate-pulse">
            ⚠️ El cursor del sistema se ha reemplazado temporalmente por el punto SVG en esta ventana. Desactívalo arriba para regresar al cursor de Windows.
          </p>
        )}
      </div>
    </div>
  );
}
