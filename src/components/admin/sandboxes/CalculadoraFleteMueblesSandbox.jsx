import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const TARIFA_BASE_KM = 8000;
const TARIFA_PISO = 15000;
const TARIFA_OPERARIO = 40000;
const TARIFA_ARMADO = 60000;

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO'); }

function FleteMueblesComponent() {
  const [ancho, setAncho] = useState(180);
  const [alto, setAlto] = useState(90);
  const [prof, setProf] = useState(80);
  const [piso, setPiso] = useState(1);
  const [ascensor, setAscensor] = useState(false);
  const [armado, setArmado] = useState(false);

  const volumen = (ancho * alto * prof) / 1000000;
  const operarios = volumen > 0.5 ? 2 : 1;
  const pisoExtra = piso > 1 && !ascensor ? (piso - 1) * TARIFA_PISO : 0;
  const costoBase = 45000 + volumen * 30000;
  const costoOperarios = operarios * TARIFA_OPERARIO;
  const costoArmado = armado ? TARIFA_ARMADO : 0;
  const total = costoBase + costoOperarios + pisoExtra + costoArmado;

  const Slider = ({ label, value, min, max, step = 1, unit, onChange }) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">{label}</label>
        <span className="text-[10px] font-bold text-[var(--color-primary)]">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-primary)] h-1.5 rounded-full cursor-pointer" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Slider label="Ancho" value={ancho} min={40} max={300} unit="cm" onChange={setAncho} />
        <Slider label="Alto" value={alto} min={30} max={200} unit="cm" onChange={setAlto} />
        <Slider label="Profundidad" value={prof} min={30} max={150} unit="cm" onChange={setProf} />
        <Slider label="Piso de entrega" value={piso} min={1} max={10} unit="°" onChange={setPiso} />
      </div>

      <div className="flex gap-2">
        {[['Ascensor disponible', ascensor, setAscensor],['Armado en sitio', armado, setArmado]].map(([l, v, fn]) => (
          <button key={l} onClick={() => fn(x => !x)}
            className={`flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${v ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
            <span>{l}</span>
            <span>{v ? '✓' : '○'}</span>
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Desglose</p>
        {[
          [`Volumen: ${volumen.toFixed(2)} m³`, fmt(costoBase)],
          [`${operarios} operario${operarios>1?'s':''} requerido${operarios>1?'s':''}`, fmt(costoOperarios)],
          pisoExtra > 0 && [`Piso ${piso} sin ascensor`, fmt(pisoExtra)],
          armado && ['Armado en sitio', fmt(TARIFA_ARMADO)],
        ].filter(Boolean).map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-[var(--color-text-muted)]">{k}</span>
            <span className="font-bold text-[var(--color-text)]">{v}</span>
          </div>
        ))}
        <div className="w-full h-px bg-[var(--color-border)] mt-1" />
        <div className="flex justify-between">
          <span className="text-xs font-black text-[var(--color-text)]">Total estimado</span>
          <span className="text-sm font-black text-[var(--color-primary)]">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CalculadoraFleteMueblesSandbox() {
  return (
    <SandboxLayout
      title="Calculadora de Flete de Muebles"
      description="Ajusta dimensiones, piso y opciones. El costo se recalcula en tiempo real."
    >
      <FleteMueblesComponent />
    </SandboxLayout>
  );
}
