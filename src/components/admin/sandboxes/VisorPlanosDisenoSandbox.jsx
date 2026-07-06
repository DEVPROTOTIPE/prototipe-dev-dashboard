import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Layers, ZoomIn, ZoomOut, Maximize2, Archive, RefreshCw, FileText, Search } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function VisorPlanosDiseno({
  onArchivePlan,
  confirmAction,
  planosIniciales = [
    {
      id: 'p1',
      codigo: 'ARQ-01',
      nombre: 'Planta de Distribución Primer Piso',
      disciplina: 'arquitectura',
      escala: '1:50',
      version: 'V2.3',
      fechaAprobado: '2026-06-15',
      disenador: 'Arq. Mariana Restrepo',
      blueprintUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600'
    },
    {
      id: 'p2',
      codigo: 'EST-02',
      nombre: 'Cimentaciones y Detalles de Columnas',
      disciplina: 'estructuras',
      escala: '1:25',
      version: 'V1.1',
      fechaAprobado: '2026-05-10',
      disenador: 'Ing. Roberto Gómez',
      blueprintUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600'
    },
    {
      id: 'p3',
      codigo: 'INS-01',
      nombre: 'Redes Hidrosanitarias e Incendio',
      disciplina: 'instalaciones',
      escala: '1:75',
      version: 'V2.0',
      fechaAprobado: '2026-06-20',
      disenador: 'Ing. Diana Tobón',
      blueprintUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600'
    }
  ]
}) {
  const [disciplinaFiltro, setDisciplinaFiltro] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(planosIniciales[0].id);
  const [zoom, setZoom] = useState(100);

  const [planos, setPlanos] = useState(planosIniciales);

  const filteredPlanos = React.useMemo(() => {
    return planos.filter(p => {
      const coincideDisciplina = disciplinaFiltro === 'todas' || p.disciplina === disciplinaFiltro;
      const coincideBusqueda = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || p.codigo.toLowerCase().includes(searchQuery.toLowerCase());
      return coincideDisciplina && coincideBusqueda;
    });
  }, [disciplinaFiltro, searchQuery, planos]);

  const planoActivo = React.useMemo(() => {
    return planos.find(p => p.id === selectedPlanId) || planos[0];
  }, [selectedPlanId, planos]);

  const handleArchive = async (id) => {
    const targetPlan = planos.find(p => p.id === id);
    if (!targetPlan) return;

    const confirmed = await confirmAction({
      title: '¿Archivar Plano Técnico?',
      message: `El plano ${targetPlan.codigo} (${targetPlan.nombre}) será archivado del histórico activo de la obra.`,
      confirmText: 'Archivar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      setPlanos(planos.filter(p => p.id !== id));
      if (onArchivePlan) {
        onArchivePlan(targetPlan);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl text-[var(--color-text)]">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)] mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Visor de Planos Técnicos</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Control de planos vigentes y escalas de obra</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="w-40">
            <CustomSelect
              value={disciplinaFiltro}
              onChange={setDisciplinaFiltro}
              options={[
                { value: 'todas', label: 'Especialidades' },
                { value: 'arquitectura', label: 'Arquitectura' },
                { value: 'estructuras', label: 'Estructuras' },
                { value: 'instalaciones', label: 'Instalaciones' }
              ]}
            />
          </div>
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Buscar plano..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)]/80 border border-[var(--color-border)] rounded-xl text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder-[var(--color-text-muted)]/50"
            />
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Izquierdo: Lista de planos */}
        <div className="lg:col-span-4 flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 py-1">
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Planos Disponibles</h3>
          {filteredPlanos.length === 0 ? (
            <div className="text-center py-10 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
              No hay planos vigentes.
            </div>
          ) : (
            filteredPlanos.map(plan => {
              const isSelected = plan.id === selectedPlanId;

              return (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setZoom(100);
                  }}
                  className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[var(--color-surface-2)] border-[var(--color-primary)] shadow-md'
                      : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-[var(--color-border)]/80'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider">{plan.codigo}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">{plan.version}</span>
                  </div>
                  <span className="text-xs font-bold leading-snug line-clamp-1 mb-1">{plan.nombre}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Escala: {plan.escala}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Lado Derecho: Visor de Blueprint */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {planoActivo ? (
            <div className="flex flex-col gap-4">
              {/* Visor Canvas simulado con blueprint de fondo */}
              <div className="relative w-full h-[320px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden flex items-center justify-center select-none shadow-inner">
                {/* Cuadrícula Blueprint */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(rgba(0,191,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,191,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* Plano con Zoom */}
                <div
                  className="transition-transform duration-300 ease-out"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  <img
                    src={planoActivo.blueprintUrl}
                    alt={planoActivo.nombre}
                    className="max-h-[260px] w-auto border border-cyan-500/30 rounded-lg shadow-xl shadow-cyan-500/5 mix-blend-screen opacity-85"
                  />
                </div>

                {/* Controles Flotantes */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[var(--color-surface)]/80 backdrop-blur border border-slate-700 p-2 rounded-xl">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-cyan-400 transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-cyan-400 px-1 font-bold w-12 text-center">
                    {zoom}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(250, zoom + 25))}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-cyan-400 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ficha de Detalles del Plano */}
              <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Diseñador</span>
                  <span className="text-xs font-semibold text-[var(--color-text)]">{planoActivo.disenador}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Última Aprobación</span>
                  <span className="text-xs font-semibold text-[var(--color-text)]">{planoActivo.fechaAprobado}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Escala</span>
                  <span className="text-xs font-semibold text-[var(--color-text)]">{planoActivo.escala}</span>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleArchive(planoActivo.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archivar Plano
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center p-10 text-sm text-[var(--color-text-muted)]">
              Ningún plano seleccionado para visualizar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VisorPlanosDisenoSandbox() {
  const { alertConfirm } = useAlertConfirm();
  const [archivedPlan, setArchivedPlan] = useState(null);

  return (
    <SandboxLayout
      title="Visor de Planos de Diseño"
      description="Visualizador de planos blueprints con simulación de zoom, escala, marcas de agua e historial de archivados."
    >
      <div className="flex flex-col gap-6">
        <VisorPlanosDiseno
          onArchivePlan={setArchivedPlan}
          confirmAction={alertConfirm}
        />

        {archivedPlan && (
          <div className="max-w-5xl mx-auto w-full p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <p className="font-bold">✓ Plano técnico archivado en el histórico:</p>
            <p className="mt-1">
              Código: {archivedPlan.codigo} | Nombre: {archivedPlan.nombre} | Diseñador: {archivedPlan.disenador}
            </p>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
