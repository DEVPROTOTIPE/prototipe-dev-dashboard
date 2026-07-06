import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Calendar, Clock, CheckCircle2, AlertTriangle, Play, RotateCcw, Save } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function CronogramaHitosProyecto({
  onSaveSchedule,
  confirmAction,
  fasesIniciales = [
    { id: 'f1', nombre: 'Planificación y Trámites', inicio: '2026-07-01', fin: '2026-07-10', progreso: 100, estado: 'completado' },
    { id: 'f2', nombre: 'Movimiento de Tierras y Cimientos', inicio: '2026-07-11', fin: '2026-07-25', progreso: 60, estado: 'en_proceso' },
    { id: 'f3', fontAwesome: 'Layers', nombre: 'Estructuras y Concreto Armado', inicio: '2026-07-26', fin: '2026-08-20', progreso: 0, estado: 'pendiente' },
    { id: 'f4', nombre: 'Albañilería, Muros y Techado', inicio: '2026-08-21', fin: '2026-09-10', progreso: 0, estado: 'pendiente' },
    { id: 'f5', nombre: 'Instalaciones y Acabados Finales', inicio: '2026-09-11', fin: '2026-09-30', progreso: 0, estado: 'pendiente' }
  ]
}) {
  const [fases, setFases] = useState(fasesIniciales);
  const [selectedFaseId, setSelectedFaseId] = useState(fasesIniciales[1].id);

  const faseActiva = React.useMemo(() => {
    return fases.find(f => f.id === selectedFaseId) || null;
  }, [selectedFaseId, fases]);

  const actualizarProgreso = (id, valor) => {
    const progreso = Number(valor);
    setFases(fases.map(f => {
      if (f.id === id) {
        let estado = f.estado;
        if (progreso === 100) {
          estado = 'completado';
        } else if (progreso > 0 && f.estado === 'pendiente') {
          estado = 'en_proceso';
        }
        return { ...f, progreso, estado };
      }
      return f;
    }));
  };

  const actualizarEstado = (id, estado) => {
    setFases(fases.map(f => {
      if (f.id === id) {
        const progreso = estado === 'completado' ? 100 : f.progreso;
        return { ...f, estado, progreso };
      }
      return f;
    }));
  };

  const handleReset = async () => {
    const confirmed = await confirmAction({
      title: '¿Reiniciar Cronograma?',
      message: 'Se borrarán todos los avances y las fases volverán a su estado inicial de planificación.',
      confirmText: 'Reiniciar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      setFases(fasesIniciales);
      setSelectedFaseId(fasesIniciales[0].id);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'completado':
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Completado</span>;
      case 'en_proceso':
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">En Curso</span>;
      case 'retrasado':
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-red-500/10 border border-red-500/20 text-red-400">Retrasado</span>;
      default:
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]">Pendiente</span>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl text-[var(--color-text)]">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)] mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Cronograma de Obra</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Control de plazos, avances e hitos de obra</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-sm font-medium rounded-xl transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar Plazos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Izquierdo: Gantt Line / Fases */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="text-sm font-bold">Línea de Avance del Proyecto</h3>
          <div className="flex flex-col gap-3">
            {fases.map(f => {
              const isSelected = f.id === selectedFaseId;

              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFaseId(f.id)}
                  className={`w-full p-4 rounded-xl border text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                    isSelected
                      ? 'bg-[var(--color-surface-2)] border-[var(--color-primary)] shadow-md'
                      : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-[var(--color-border)]/80'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-bold text-sm">{f.nombre}</span>
                      {getEstadoBadge(f.estado)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {f.inicio} / {f.fin}
                      </span>
                    </div>
                  </div>

                  {/* Progreso Visual */}
                  <div className="w-full sm:w-32 flex flex-col gap-1.5 shrink-0">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Progreso</span>
                      <span>{f.progreso}%</span>
                    </div>
                    <div className="w-full bg-[var(--color-bg)] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          f.estado === 'completado'
                            ? 'bg-emerald-500'
                            : f.estado === 'retrasado'
                            ? 'bg-red-500'
                            : 'bg-[var(--color-primary)]'
                        }`}
                        style={{ width: `${f.progreso}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lado Derecho: Controles de la Fase Activa */}
        <div className="lg:col-span-5">
          {faseActiva ? (
            <div className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] p-5 rounded-xl flex flex-col gap-5 sticky top-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                  Control de Fase
                </span>
                <h3 className="text-base font-bold mt-2">{faseActiva.nombre}</h3>
              </div>

              {/* Slider de Progreso */}
              <div className="bg-[var(--color-bg)]/50 border border-[var(--color-border)] p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-muted)]">Ajustar Progreso Físico</span>
                  <span className="text-sm font-extrabold text-[var(--color-primary)]">{faseActiva.progreso}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={faseActiva.progreso}
                  onChange={(e) => actualizarProgreso(faseActiva.id, e.target.value)}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>

              {/* Cambiar Estado */}
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Estado de Ejecución</label>
                <CustomSelect
                  value={faseActiva.estado}
                  onChange={(val) => actualizarEstado(faseActiva.id, val)}
                  options={[
                    { value: 'pendiente', label: 'Pendiente (Sin iniciar)' },
                    { value: 'en_proceso', label: 'En Curso (Ejecutándose)' },
                    { value: 'retrasado', label: 'Retrasado (Alerta de obra)' },
                    { value: 'completado', label: 'Completado (100% verificado)' }
                  ]}
                />
              </div>

              {/* Fechas de Plazo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Fecha Inicio</span>
                  <span className="text-xs font-semibold">{faseActiva.inicio}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Fecha Fin</span>
                  <span className="text-xs font-semibold">{faseActiva.fin}</span>
                </div>
              </div>

              <button
                onClick={() => onSaveSchedule?.(fases)}
                className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                Guardar Cronograma
              </button>
            </div>
          ) : (
            <div className="h-full border border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center p-10 text-sm text-[var(--color-text-muted)]">
              Ninguna fase seleccionada para controlar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CronogramaHitosProyectoSandbox() {
  const { alertConfirm } = useAlertConfirm();
  const [lastSaved, setLastSaved] = useState(null);

  const handleSave = (result) => {
    setLastSaved(result);
  };

  return (
    <SandboxLayout
      title="Cronograma de Hitos del Proyecto"
      description="Visualización del cronograma de obra interactivo tipo Gantt con control de plazos y progreso de fases."
    >
      <div className="flex flex-col gap-6">
        <CronogramaHitosProyecto
          onSaveSchedule={handleSave}
          confirmAction={alertConfirm}
        />

        {lastSaved && (
          <div className="max-w-5xl mx-auto w-full p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
            <p className="font-bold">✓ Cronograma de hitos guardado exitosamente:</p>
            <div className="mt-1 flex flex-col gap-1">
              {lastSaved.map(f => (
                <div key={f.id} className="text-xs">
                  • {f.nombre}: {f.progreso}% completado ({f.estado})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
