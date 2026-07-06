import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Palette, Check } from 'lucide-react';

function SelectorMaderaAcabado() {
  const { alertConfirm } = useAlertConfirm();
  const [madera, setMadera] = useState('oak');
  const [acabado, setAcabado] = useState('semi_matte');

  const maderas = [
    { id: 'pine', name: 'Pino Natural', desc: 'Madera blanda ideal para muebles rústicos.', precio: 0 },
    { id: 'oak', name: 'Roble Americano', desc: 'Madera dura muy resistente y con veta marcada.', precio: 150000 },
    { id: 'cedar', name: 'Cedro Rojo', desc: 'Madera aromática de alta resistencia a la humedad.', precio: 120000 },
    { id: 'mdf', name: 'MDF Enchapado', desc: 'Sustrato estable enchapado en madera natural.', precio: -40000 }
  ];

  const acabados = [
    { id: 'natural', name: 'Aceite de Linaza Natural', desc: 'Acabado penetrante mate sin película.' },
    { id: 'semi_matte', name: 'Barniz de Poliuretano Semi-Mate', desc: 'Alta protección al roce y humedad.' },
    { id: 'gloss', name: 'Laca de Nitrocelulosa Brillante', desc: 'Brillo espejo para interiores elegantes.' }
  ];

  const activeMadera = maderas.find(m => m.id === madera) || maderas[0];
  const activeAcabado = acabados.find(a => a.id === acabado) || acabados[0];

  const handleConfirm = () => {
    alertConfirm({
      title: 'Material Seleccionado',
      message: 'Madera: ' + activeMadera.name + ' | Acabado: ' + activeAcabado.name,
      variant: 'success'
    });
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Materiales y Barnices</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Elige el tipo de soporte y su terminación estética</p>
          </div>
        </div>

        {/* Maderas */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Tipo de Madera / Placa</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {maderas.map((m) => {
              const active = madera === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMadera(m.id)}
                  className={'p-3 border rounded-xl flex justify-between items-start gap-3 cursor-pointer transition-all ' + (
                    active
                      ? 'bg-indigo-500/5 border-indigo-500'
                      : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-indigo-500/20'
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1">
                      {m.name}
                      {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </span>
                    <span className="text-[9px] text-[var(--color-text-muted)] leading-tight">{m.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acabados */}
        <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
          <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Tratamiento / Acabado</span>
          <div className="flex flex-col gap-2">
            {acabados.map((a) => {
              const active = acabado === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => setAcabado(a.id)}
                  className={'p-3 border rounded-xl flex justify-between items-center gap-3 cursor-pointer transition-all ' + (
                    active
                      ? 'bg-indigo-500/5 border-indigo-500'
                      : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-indigo-500/20'
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[var(--color-text)]">{a.name}</span>
                    <span className="text-[9px] text-[var(--color-text-muted)]">{a.desc}</span>
                  </div>
                  <div className={'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ' + (
                    active ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
                  )}>
                    {active && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Guardar Selección de Materiales
        </button>
      </div>
    </>
  );
}

export default function SelectorMaderaAcabadoSandbox() {
  return (
    <SandboxLayout
      title="Selector de Madera y Acabado"
      description="Visualización y selección de tipos de madera y acabados de poliuretano."
    >
      <SelectorMaderaAcabado />
    </SandboxLayout>
  );
}
