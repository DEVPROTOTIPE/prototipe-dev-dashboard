import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Flame, AlertTriangle, Droplets, ShieldAlert, Sparkles } from 'lucide-react';

const ACEITES_DATA = [
  {
    id: 'oil-lavanda',
    nombre: 'Aceite de Lavanda',
    nota: 'Floral / Relajante',
    beneficio: 'Alivia estrés, insomnio y tensión muscular',
    hex: '#8b5cf6',
    alergiasCriticas: ['flores'],
    intensidadRecomendada: 3
  },
  {
    id: 'oil-eucalipto',
    nombre: 'Aceite de Eucalipto',
    nota: 'Herbal / Decongestionante',
    beneficio: 'Mejora la respiración y refresca el ambiente',
    hex: '#10b981',
    alergiasCriticas: ['asma', 'respiratorio'],
    intensidadRecomendada: 4
  },
  {
    id: 'oil-menta',
    nombre: 'Aceite de Menta Piperita',
    nota: 'Fresco / Estimulante',
    beneficio: 'Aumenta la energía y alivia dolores de cabeza',
    hex: '#06b6d4',
    alergiasCriticas: ['mentol'],
    intensidadRecomendada: 2
  },
  {
    id: 'oil-naranja',
    nombre: 'Aceite de Naranja Dulce',
    nota: 'Cítrico / Energizante',
    beneficio: 'Mejora el estado de ánimo y revitaliza la piel',
    hex: '#f59e0b',
    alergiasCriticas: ['citricos'],
    intensidadRecomendada: 3
  }
];

const ALERGIAS_LISTA = [
  { id: 'asma', label: 'Asma / Afección Respiratoria' },
  { id: 'flores', label: 'Alergia a Polen o Lavanda' },
  { id: 'citricos', label: 'Sensibilidad a Cítricos' },
  { id: 'mentol', label: 'Alergia al Mentol / Alcanfor' }
];

function SelectorAceitesEsencialesComponent() {
  const [alergiasActivas, setAlergiasActivas] = useState([]);
  const [selectedOil, setSelectedOil] = useState('oil-lavanda');
  const [gotasCount, setGotasCount] = useState(3);
  const [difusorEncendido, setDifusorEncendido] = useState(false);

  const activeOilData = ACEITES_DATA.find(o => o.id === selectedOil);

  const handleAllergyToggle = (id) => {
    setAlergiasActivas(prev => {
      const active = prev.includes(id);
      const updated = active ? prev.filter(a => a !== id) : [...prev, id];
      
      const currentConflicted = ACEITES_DATA.find(o => o.id === selectedOil)?.alergiasCriticas.some(a => updated.includes(a));
      if (currentConflicted) {
        const nextFree = ACEITES_DATA.find(o => !o.alergiasCriticas.some(a => updated.includes(a)));
        setSelectedOil(nextFree ? nextFree.id : null);
      }
      return updated;
    });
  };

  const esConflito = (oil) => {
    return oil.alergiasCriticas.some(alergia => alergiasActivas.includes(alergia));
  };

  const handleSelectOil = (oilId) => {
    const oil = ACEITES_DATA.find(o => o.id === oilId);
    if (esConflito(oil)) return;
    setSelectedOil(oilId);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Columna Izquierda: Configuración de Alergias */}
      <div className="md:col-span-4 flex flex-col gap-3.5">
        <div>
          <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Alergias / Sensibilidades</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Active filtros de seguridad</p>
        </div>

        <div className="flex flex-col gap-1.5">
          {ALERGIAS_LISTA.map(a => {
            const active = alergiasActivas.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => handleAllergyToggle(a.id)}
                className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                    active ? 'bg-red-500 border-red-500 text-white' : 'border-[var(--color-border)] bg-transparent'
                  }`}>
                    {active && <span className="text-[8px] font-bold">✓</span>}
                  </div>
                  <span>{a.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {alergiasActivas.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Esencias con alérgenos activos bloqueadas automáticamente para seguridad del paciente.
            </p>
          </div>
        )}
      </div>

      {/* Columna Derecha: Aceites y Difusor */}
      <div className="md:col-span-8 flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Aromaterapia en Cabina</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Configuración de esencia activa y dosificación</p>
        </div>

        {/* Grid de Aceites */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ACEITES_DATA.map(oil => {
            const isConflicted = esConflito(oil);
            const isSelected = selectedOil === oil.id;
            
            return (
              <button
                key={oil.id}
                type="button"
                onClick={() => handleSelectOil(oil.id)}
                disabled={isConflicted}
                className={`p-3 rounded-xl border text-left flex gap-3 transition-all relative overflow-hidden ${
                  isSelected 
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)] ring-2 ring-[var(--color-primary)]/10' 
                    : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                } ${isConflicted ? 'opacity-30 cursor-not-allowed bg-[var(--color-surface-2)]/20' : 'cursor-pointer'}`}
              >
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-inner"
                  style={{ backgroundColor: `${oil.hex} !important` }}
                >
                  <Droplets className="w-4 h-4" />
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate">{oil.nombre}</span>
                  <span className="text-[9px] font-bold text-[var(--color-text-muted)]">{oil.nota}</span>
                  <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed mt-1 line-clamp-1">{oil.beneficio}</p>
                </div>

                {isConflicted && (
                  <span className="absolute top-2 right-2 text-[8px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-red-500/20">
                    <ShieldAlert className="w-3 h-3" /> Bloqueado
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dosificador y Difusor */}
        {activeOilData ? (
          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col sm:flex-row gap-3.5 items-center justify-between">
            <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
              <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Dosificación de Esencia</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={gotasCount}
                  onChange={(e) => setGotasCount(parseInt(e.target.value))}
                  className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
                <span className="text-xs font-black text-[var(--color-primary)] whitespace-nowrap">{gotasCount} gotas</span>
              </div>
              <p className="text-[9px] text-[var(--color-text-muted)]">Intensidad recomendada: {activeOilData.intensidadRecomendada} gotas.</p>
            </div>

            {/* Simulador Difusor */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDifusorEncendido(!difusorEncendido)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  difusorEncendido
                    ? 'bg-emerald-500 !text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20'
                    : 'bg-[var(--color-primary)] !text-white hover:bg-[var(--color-primary-dark)] shadow-md shadow-[var(--color-primary-glow)]'
                }`}
              >
                {difusorEncendido ? 'Encendido' : 'Encender Difusor'}
              </button>
              
              {difusorEncendido && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Vaporizando {activeOilData.nombre}...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 text-center border border-dashed border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-muted)]">
            Por favor, seleccione un aceite libre de conflictos.
          </div>
        )}
      </div>

    </div>
  );
}

export default function SelectorAceitesEsencialesSandbox() {
  return (
    <SandboxLayout
      title="Selector de Aceites Esenciales"
      description="Dosificador visual de aromaterapia y difusores con exclusión automática por alergias respiratorias"
    >
      <SelectorAceitesEsencialesComponent />
    </SandboxLayout>
  );
}
