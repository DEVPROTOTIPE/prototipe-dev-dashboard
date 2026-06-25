import React, { useState, useMemo } from 'react';
import useCrm from '../../../hooks/useCrm';
import { useDevStore } from '../../../stores/devStore';
import { 
  FolderGit, Calendar, ArrowRight, ArrowLeft, Play, Pause, 
  CheckCircle, Clock, AlertTriangle, Building, FileText,
  ChevronDown
} from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import useToast from '../../../hooks/useToast';

// Estados del proyecto en orden
const PROJECT_STAGES = ['planning', 'development', 'testing', 'validation', 'production'];

const STAGE_LABELS = {
  planning: 'Planeación',
  development: 'Desarrollo',
  testing: 'Pruebas',
  validation: 'Validación',
  production: 'En Producción',
  paused: 'Pausado'
};

const STAGE_COLORS = {
  planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  development: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  testing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  validation: 'bg-amber-500/10 text-amber-450 border-amber-500/20',
  production: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-red-500/10 text-red-400 border-red-500/20'
};

export default function CrmProjectsView() {
  const { showToast } = useToast();
  const { projects, proposals, updateProject } = useCrm(true);
  const { clientesSaas } = useDevStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Filtrado de proyectos
  const filteredProjects = useMemo(() => {
    return projects.filter(proj => {
      const matchStatus = statusFilter === 'all' || proj.status === statusFilter;
      const matchClient = clientFilter === 'all' || proj.clienteId === clientFilter;
      return matchStatus && matchClient;
    });
  }, [projects, statusFilter, clientFilter]);

  const handleStageChange = async (projectId, newStatus) => {
    setUpdatingId(projectId);
    try {
      await updateProject(projectId, { status: newStatus });
      showToast(`Proyecto actualizado a: ${STAGE_LABELS[newStatus]}`, { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar fase del proyecto', { type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTogglePause = async (project) => {
    setUpdatingId(project.id);
    try {
      if (project.status === 'paused') {
        // Al reanudar, volver a development o a planning
        const targetStage = project.previousStatus || 'development';
        await updateProject(project.id, { status: targetStage });
        showToast(`Proyecto reanudado en fase: ${STAGE_LABELS[targetStage]}`, { type: 'success' });
      } else {
        await updateProject(project.id, { 
          status: 'paused',
          previousStatus: project.status // guardar el estado anterior para reanudar
        });
        showToast('Proyecto pausado', { type: 'warning' });
      }
    } catch (err) {
      console.error(err);
      showToast('Error al modificar pausa del proyecto', { type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 tab-content-enter select-none">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <CustomSelect 
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: 'all', name: 'Todos los Estados de Proyecto' },
              { id: 'planning', name: '✏️ Planeación' },
              { id: 'development', name: '💻 Desarrollo' },
              { id: 'testing', name: '🧪 Pruebas' },
              { id: 'validation', name: '🔍 Validación' },
              { id: 'production', name: '🚀 En Producción' },
              { id: 'paused', name: '⏸️ Pausados' }
            ]}
          />
        </div>
        <div>
          <CustomSelect 
            value={clientFilter}
            onChange={setClientFilter}
            options={[
              { id: 'all', name: 'Todos los Clientes' },
              ...clientesSaas.map(c => ({ id: c.id, name: `🏢 ${c.nombre}` }))
            ]}
          />
        </div>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredProjects.map(proj => {
          const client = clientesSaas.find(c => c.id === proj.clienteId) || { nombre: proj.clienteId };
          const proposal = proposals.find(p => p.id === proj.proposalId) || {};
          const activeIndex = PROJECT_STAGES.indexOf(proj.status);
          const isPaused = proj.status === 'paused';

          return (
            <div 
              key={proj.id} 
              className={`p-5 rounded-2xl border bg-[var(--color-surface)] shadow-md space-y-5 transition-all duration-300 relative overflow-hidden ${
                isPaused ? 'border-red-500/20 bg-red-500/[0.005]' : 
                proj.status === 'production' ? 'border-emerald-500/20 bg-emerald-500/[0.005]' : 
                'border-[var(--color-border)] hover:border-indigo-500/20'
              }`}
            >
              {/* Header de Tarjeta */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${STAGE_COLORS[proj.status]}`}>
                    {STAGE_LABELS[proj.status]}
                  </span>
                  <h4 className="font-extrabold text-sm text-[var(--color-text)] mt-1.5 flex items-center gap-1.5">
                    <FolderGit size={14} className="text-indigo-400 shrink-0" />
                    {proj.projectName || `Implementación - ${client.nombre}`}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--color-text-muted)] font-medium">
                    <span className="flex items-center gap-1">
                      <Building size={10} />
                      Cliente: <strong className="text-[var(--color-text)]">{client.nombre}</strong>
                    </span>
                    {proj.proposalId && (
                      <span className="flex items-center gap-1">
                        <FileText size={10} />
                        Propuesta: <span className="font-mono text-[9px]">{proj.proposalId}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Botón de Pausa / Reanudación */}
                <button 
                  onClick={() => handleTogglePause(proj)}
                  disabled={updatingId === proj.id}
                  className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    isPaused 
                      ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20' 
                      : 'bg-red-600/10 border-red-500/20 text-red-400 hover:bg-red-600/20'
                  }`}
                  title={isPaused ? 'Reanudar Proyecto' : 'Pausar Proyecto'}
                >
                  {isPaused ? <Play size={12} /> : <Pause size={12} />}
                </button>
              </div>

              {/* Informacion de Montos */}
              {proposal.setupValue && (
                <div className="p-3 bg-[var(--color-surface-2)]/30 rounded-xl border border-[var(--color-border)] text-[10px] grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Valor Setup Contratado</span>
                    <span className="font-mono font-bold text-[var(--color-text)] mt-0.5 block">
                      ${Number(proposal.setupValue).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Mensualidad Base</span>
                    <span className="font-mono font-bold text-indigo-400 mt-0.5 block">
                      ${Number(proposal.monthlyValue || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              )}

              {/* Timeline visual (Stepper) */}
              <div className="relative pt-2 pb-1">
                {/* Línea de fondo */}
                <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-slate-800 rounded-full -z-0" />
                
                {/* Línea de progreso activa */}
                {!isPaused && activeIndex >= 0 && (
                  <div 
                    className="absolute top-[18px] left-[5%] h-0.5 bg-indigo-500 transition-all duration-500 -z-0" 
                    style={{ width: `${(activeIndex / (PROJECT_STAGES.length - 1)) * 90}%` }}
                  />
                )}

                {/* Burbujas del Stepper */}
                <div className="relative z-10 flex justify-between">
                  {PROJECT_STAGES.map((stage, idx) => {
                    const isCompleted = idx < activeIndex;
                    const isActive = idx === activeIndex && !isPaused;
                    
                    let dotBg = 'bg-slate-900 border-slate-700 text-slate-500';
                    if (isCompleted) {
                      dotBg = 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]';
                    } else if (isActive) {
                      dotBg = 'bg-indigo-500 border-indigo-400 text-white ring-4 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)]';
                    } else if (isPaused && idx === activeIndex) {
                      dotBg = 'bg-red-600 border-red-500 text-white ring-4 ring-red-500/20';
                    }

                    return (
                      <div key={stage} className="flex flex-col items-center gap-1.5 w-[18%] text-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${dotBg}`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[8.5px] font-bold block ${
                          isActive ? 'text-indigo-400 font-extrabold' : 
                          isPaused && idx === activeIndex ? 'text-red-400 font-extrabold' :
                          isCompleted ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
                        }`}>
                          {STAGE_LABELS[stage]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Controles de avance rápido */}
              <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)]/50 pt-4 mt-2">
                <div className="text-[9.5px] text-[var(--color-text-muted)] flex items-center gap-1 font-medium">
                  <Clock size={11} />
                  Fase: {STAGE_LABELS[isPaused ? 'paused' : PROJECT_STAGES[activeIndex]]}
                </div>

                <div className="flex gap-2">
                  {/* Retroceder Fase */}
                  {!isPaused && activeIndex > 0 && (
                    <button
                      onClick={() => handleStageChange(proj.id, PROJECT_STAGES[activeIndex - 1])}
                      disabled={updatingId === proj.id}
                      className="px-2.5 py-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <ArrowLeft size={10} />
                      Retroceder
                    </button>
                  )}

                  {/* Avanzar Fase */}
                  {!isPaused && activeIndex < PROJECT_STAGES.length - 1 && (
                    <button
                      onClick={() => handleStageChange(proj.id, PROJECT_STAGES[activeIndex + 1])}
                      disabled={updatingId === proj.id}
                      className="px-2.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50 border-none"
                    >
                      Avanzar
                      <ArrowRight size={10} />
                    </button>
                  )}

                  {/* Select directo alternativo */}
                  <div className="relative">
                    <select
                      value={proj.status}
                      onChange={(e) => handleStageChange(proj.id, e.target.value)}
                      disabled={updatingId === proj.id}
                      className="appearance-none bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl pl-2.5 pr-6 py-1.5 text-[10px] font-bold outline-none cursor-pointer"
                    >
                      <option value="paused" disabled>Pausado</option>
                      {PROJECT_STAGES.map(stage => (
                        <option key={stage} value={stage}>{STAGE_LABELS[stage]}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-2.5 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-span-2 p-12 text-center text-[var(--color-text-muted)] italic text-xs bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
            No se encontraron proyectos activos con los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
}
