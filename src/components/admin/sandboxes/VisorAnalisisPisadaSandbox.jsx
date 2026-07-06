import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Percent } from 'lucide-react';

const FASES_MARCHA = [
  { id: 'f-strike', label: 'Contacto de Talón (Heel Strike)', percent: 0 },
  { id: 'f-mid', label: 'Apoyo Medio (Midstance)', percent: 50 },
  { id: 'f-off', label: 'Despegue de Dedos (Toe-Off)', percent: 100 }
];

function VisorAnalisisPisadaComponent() {
  const [gaitPercent, setGaitPercent] = useState(0);
  const [tipoPisada, setTipoPisada] = useState('neutra');
  const [analisisTipo, setAnalisisTipo] = useState('dinamico');

  const getHeatCenters = () => {
    if (analisisTipo === 'estatico') {
      return {
        left: [
          { cx: 85, cy: 90, r: 20, op: 0.4, color: 'url(#grad-blue-sb)' },
          { cx: 105, cy: 150, r: 35, op: 0.8, color: 'url(#grad-red-sb)' },
          { cx: 100, cy: 310, r: 32, op: 0.7, color: 'url(#grad-orange-sb)' }
        ],
        right: [
          { cx: 155, cy: 90, r: 20, op: 0.4, color: 'url(#grad-blue-sb)' },
          { cx: 135, cy: 150, r: 35, op: 0.8, color: 'url(#grad-red-sb)' },
          { cx: 140, cy: 310, r: 32, op: 0.7, color: 'url(#grad-orange-sb)' }
        ]
      };
    }

    const pct = gaitPercent / 100;
    const yLeft = 310 - (220 * pct);
    const yRight = 310 - (220 * pct);

    let xLeftOffset = 0;
    let xRightOffset = 0;
    
    if (pct > 0.3 && pct < 0.8) {
      if (tipoPisada === 'pronadora') {
        xLeftOffset = 18;
        xRightOffset = -18;
      } else if (tipoPisada === 'supinadora') {
        xLeftOffset = -15;
        xRightOffset = 15;
      }
    }

    return {
      left: [
        { cx: 100 + xLeftOffset, cy: yLeft, r: 42, op: 0.9, color: 'url(#grad-red-sb)' },
        { cx: 85, cy: 90, r: 15, op: pct > 0.7 ? 0.8 : 0.1, color: 'url(#grad-orange-sb)' },
        { cx: 100, cy: 310, r: 25, op: pct < 0.4 ? 0.7 : 0.1, color: 'url(#grad-blue-sb)' }
      ],
      right: [
        { cx: 140 + xRightOffset, cy: yRight, r: 42, op: 0.9, color: 'url(#grad-red-sb)' },
        { cx: 155, cy: 90, r: 15, op: pct > 0.7 ? 0.8 : 0.1, color: 'url(#grad-orange-sb)' },
        { cx: 140, cy: 310, r: 25, op: pct < 0.4 ? 0.7 : 0.1, color: 'url(#grad-blue-sb)' }
      ]
    };
  };

  const heats = getHeatCenters();

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* Columna Izquierda: Mapa de Calor SVG */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[var(--color-bg)]/50 rounded-xl p-4 border border-[var(--color-border)] relative">
        <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest absolute top-4 left-4">Mapa de Presiones Plantares</span>

        <div className="flex gap-6 mt-6 justify-center w-full">
          <svg className="w-full max-w-[280px] h-[340px]" viewBox="0 0 240 400">
            <defs>
              <radialGradient id="grad-red-sb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                <stop offset="30%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#eab308" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="grad-orange-sb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#eab308" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="grad-blue-sb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* SILUETA PIE IZQUIERDO */}
            <g opacity="0.85">
              <path 
                d="M 90 40 C 65 40, 45 70, 45 110 C 45 155, 75 190, 65 240 C 55 290, 75 365, 100 365 C 115 365, 120 330, 115 290 C 110 240, 115 190, 110 145 C 110 90, 105 40, 90 40 Z" 
                fill="none" 
                stroke="var(--color-border)" 
                strokeWidth="2"
              />
              {heats.left.map((h, i) => (
                <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill={h.color} opacity={h.op} />
              ))}
            </g>

            {/* SILUETA PIE DERECHO */}
            <g opacity="0.85">
              <path 
                d="M 150 40 C 175 40, 195 70, 195 110 C 195 155, 165 190, 175 240 C 185 290, 165 365, 140 365 C 125 365, 120 330, 125 290 C 130 240, 125 190, 130 145 C 130 90, 135 40, 150 40 Z" 
                fill="none" 
                stroke="var(--color-border)" 
                strokeWidth="2"
              />
              {heats.right.map((h, i) => (
                <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill={h.color} opacity={h.op} />
              ))}
            </g>

            {/* Centro de gravedad promedio */}
            <circle 
              cx={120 + (tipoPisada === 'pronadora' ? 8 : tipoPisada === 'supinadora' ? -8 : 0)} 
              cy={210} 
              r={7} 
              fill="#10b981" 
              stroke="#fff" 
              strokeWidth="2" 
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="flex gap-3 mt-2 justify-center text-[9px] font-bold text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-3 w-full">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500" /> Máxima</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-500" /> Media</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500" /> Leve</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 border border-white" /> Gravedad</div>
        </div>
      </div>

      {/* Columna Derecha: Controles */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Métricas Biomecánicas</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Parámetros interactivos</p>
        </div>

        <div className="flex gap-2 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
          {[
            { id: 'dinamico', label: 'Dinámico (Ciclo)' },
            { id: 'estatico', label: 'Estático (Apoyo)' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAnalisisTipo(t.id)}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                analisisTipo === t.id
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {analisisTipo === 'dinamico' && (
          <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Ciclo de Marcha</span>
              <span className="text-xs font-black text-[var(--color-primary)]">{gaitPercent}%</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              value={gaitPercent}
              onChange={(e) => setGaitPercent(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
            />

            <div className="flex justify-between text-[8px] font-bold text-[var(--color-text-muted)]">
              <span>Talón (0%)</span>
              <span>Medio (50%)</span>
              <span>Dedos (100%)</span>
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Tipo de Pisada</span>
          
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'neutra', label: 'Neutra' },
              { id: 'pronadora', label: 'Pronación' },
              { id: 'supinadora', label: 'Supinación' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTipoPisada(p.id)}
                className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                  tipoPisada === p.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed mt-1">
            {tipoPisada === 'pronadora' && '⚠️ Pronación: Desviación medial del eje de apoyo.'}
            {tipoPisada === 'supinadora' && '⚠️ Supinación: Mayor carga sobre el borde lateral.'}
            {tipoPisada === 'neutra' && '✓ Neutra: Distribución equilibrada del peso corporal.'}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Simetría de Apoyo</span>
          <div className="flex items-center gap-4 justify-between">
            <div className="text-center">
              <span className="text-base font-black text-[var(--color-text)]">
                {tipoPisada === 'pronadora' ? '54%' : tipoPisada === 'supinadora' ? '47%' : '50%'}
              </span>
              <p className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] mt-0.5">Izquierdo</p>
            </div>
            
            <div className="flex-1 flex items-center justify-center gap-1 text-[var(--color-text-muted)]">
              <Percent className="w-3.5 h-3.5 shrink-0" />
            </div>

            <div className="text-center">
              <span className="text-base font-black text-[var(--color-text)]">
                {tipoPisada === 'pronadora' ? '46%' : tipoPisada === 'supinadora' ? '53%' : '50%'}
              </span>
              <p className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] mt-0.5">Derecho</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function VisorAnalisisPisadaSandbox() {
  return (
    <SandboxLayout
      title="Visor de Análisis de Pisada"
      description="Visualizador SVG interactivo del mapa de calor plantar de presiones estáticas y dinámicas"
    >
      <VisorAnalisisPisadaComponent />
    </SandboxLayout>
  );
}
