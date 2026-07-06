import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Shield, ShieldAlert, Check } from 'lucide-react';

function SelectorSeguroDanos() {
  const { alertConfirm } = useAlertConfirm();
  const [selectedPlan, setSelectedPlan] = useState('standard');

  const planes = [
    {
      id: 'basic',
      name: 'Plan Básico (Deducible)',
      tarifa: 25000,
      deducible: '25% del valor de daño',
      coberturas: ['Robo parcial', 'Daño eléctrico menor'],
      exclusiones: 'No cubre volcamientos ni daños estructurales.'
    },
    {
      id: 'standard',
      name: 'Plan Estándar (Recomendado)',
      tarifa: 55000,
      deducible: '10% del valor de daño',
      coberturas: ['Robo total/parcial', 'Daños por volcamiento', 'Responsabilidad civil básica'],
      exclusiones: 'Excluye negligencia del operador sin certificación.'
    },
    {
      id: 'premium',
      name: 'Plan Cero Deducible',
      tarifa: 90000,
      deducible: '0% (Exención total)',
      coberturas: ['Robo e Incendio', 'Daños estructurales completos', 'Responsabilidad civil ampliada', 'Asistencia médica en obra'],
      exclusiones: 'Ninguna'
    }
  ];

  const activePlan = planes.find(p => p.id === selectedPlan) || planes[1];

  const handleConfirmPlan = async () => {
    alertConfirm({
      title: 'Seguro Vinculado',
      message: 'Se ha asegurado tu alquiler con el ' + activePlan.name + '.',
      variant: 'success'
    });
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Póliza de Exención de Responsabilidad</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Elige el nivel de protección de tu equipo alquilado</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {planes.map((p) => {
            const active = selectedPlan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={'p-4 border rounded-xl flex justify-between items-start gap-4 transition-all cursor-pointer ' + (
                  active
                    ? 'bg-indigo-500/5 border-indigo-500 shadow-sm'
                    : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-indigo-500/20'
                )}
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    {p.name}
                    {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </span>
                  <div className="flex flex-col gap-0.5 text-[9px] text-[var(--color-text-muted)]">
                    <span>Deducible: <strong className="text-[var(--color-text)]">{p.deducible}</strong></span>
                    <span>Cobertura: {p.coberturas.join(', ')}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-[var(--color-text)]">${p.tarifa.toLocaleString()} COP</span>
                  <span className="text-[8px] text-[var(--color-text-muted)] block">/ día</span>
                </div>
              </div>
            );
          })}
        </div>

        {activePlan.exclusiones !== 'Ninguna' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-400 text-[10px]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Advertencia de Exclusión</span>
              <span className="text-[var(--color-text-muted)]">{activePlan.exclusiones}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleConfirmPlan}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Confirmar Plan de Cobertura
        </button>
      </div>
    </>
  );
}

export default function SelectorSeguroDanosSandbox() {
  return (
    <SandboxLayout
      title="Selector de Seguro contra Daños"
      description="Comparativa de planes de exención de responsabilidad y seguros de maquinaria."
    >
      <SelectorSeguroDanos />
    </SandboxLayout>
  );
}
