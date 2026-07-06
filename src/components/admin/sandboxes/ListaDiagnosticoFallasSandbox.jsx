import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { ShieldAlert, HelpCircle, ArrowRight, DollarSign, Activity } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function ListaDiagnosticoFallas({
  onSelectDiagnostic = null,
  symptoms = [
    {
      id: 'no_cool',
      label: 'El aire enciende pero no enfría',
      severity: 'high',
      causes: [
        { title: 'Falta de gas refrigerante (Fuga)', costRange: '$120 - $250 USD' },
        { title: 'Compresor defectuoso o pegado', costRange: '$350 - $600 USD' },
        { title: 'Capacitor de arranque quemado', costRange: '$60 - $110 USD' }
      ]
    },
    {
      id: 'water_leak',
      label: 'Gotea / Tira agua por la evaporadora',
      severity: 'medium',
      causes: [
        { title: 'Bandeja o tubería de drenaje obstruida', costRange: '$50 - $90 USD' },
        { title: 'Falta de mantenimiento (Filtros tapados)', costRange: '$40 - $70 USD' },
        { title: 'Congelamiento por falta de refrigerante', costRange: '$120 - $200 USD' }
      ]
    },
    {
      id: 'noise',
      label: 'Hace ruidos extraños o vibraciones',
      severity: 'low',
      causes: [
        { title: 'Turbina de ventilación desbalanceada', costRange: '$80 - $150 USD' },
        { title: 'Bordes o soportes del motor flojos', costRange: '$40 - $80 USD' },
        { title: 'Rodamientos del motor desgastados', costRange: '$90 - $170 USD' }
      ]
    },
    {
      id: 'no_power',
      label: 'No enciende por completo',
      severity: 'high',
      causes: [
        { title: 'Tarjeta electrónica principal quemada', costRange: '$180 - $320 USD' },
        { title: 'Fusible de protección abierto', costRange: '$30 - $60 USD' },
        { title: 'Falla en el suministro eléctrico local', costRange: '$20 - $50 USD' }
      ]
    }
  ]
}) {
  const [selectedSymptomId, setSelectedSymptomId] = useState(symptoms[0].id);

  const activeSymptom = symptoms.find(s => s.id === selectedSymptomId) || symptoms[0];

  const handleSelectCause = (cause) => {
    if (onSelectDiagnostic) {
      onSelectDiagnostic({
        symptom: activeSymptom.label,
        severity: activeSymptom.severity,
        selectedCause: cause
      });
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">
            Crítico / Urgente
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Moderado
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20">
            Bajo
          </span>
        );
    }
  };

  const selectOptions = symptoms.map(s => ({ value: s.id, label: s.label }));

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <Activity size={16} className="text-[var(--color-primary)]" />
        <span>Diagnóstico Rápido de Fallas</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Selecciona el síntoma de tu unidad HVAC para evaluar causas técnicas y costos aproximados.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Síntoma Detectado</label>
          <CustomSelect
            value={selectedSymptomId}
            onChange={setSelectedSymptomId}
            options={selectOptions}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)]">Severidad Diagnóstico:</span>
          {getSeverityBadge(activeSymptom.severity)}
        </div>

        <div className="space-y-2 mt-2">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider block">
            Causas Probables y Costos de Reparación
          </span>
          <div className="space-y-2">
            {activeSymptom.causes.map((cause, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectCause(cause)}
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/10 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert size={14} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text)] block group-hover:text-[var(--color-primary)] transition-colors">
                      {cause.title}
                    </span>
                    <span className="text-[9px] text-[var(--color-text-muted)] flex items-center gap-0.5 mt-0.5">
                      <DollarSign size={10} /> Costo Técnico: <strong className="font-mono text-[var(--color-text)] font-semibold">{cause.costRange}</strong>
                    </span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl flex items-start gap-2 text-[10px] text-[var(--color-text-muted)]">
          <HelpCircle size={14} className="shrink-0 text-[var(--color-primary)] mt-0.5" />
          <span>
            Los precios indicados son rangos estándar de taller que incluyen repuestos originales y mano de obra certificada. Pueden variar según el caballaje del equipo.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ListaDiagnosticoFallasSandbox() {
  const [selected, setSelected] = useState(null);

  return (
    <SandboxLayout
      title="Cuestionario de Diagnóstico de Fallas"
      description="Árbol de fallas dinámico que agrupa síntomas, causas y costos técnicos estimados."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <ListaDiagnosticoFallas
          onSelectDiagnostic={setSelected}
        />
        {selected && (
          <div className="mt-4 p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-xl text-xs">
            Seleccionado: <strong>{selected.selectedCause.title}</strong> con costo técnico estimado de <strong>{selected.selectedCause.costRange}</strong>.
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
