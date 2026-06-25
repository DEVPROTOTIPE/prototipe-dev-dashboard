import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import useCrm from '../../../hooks/useCrm';
import { useDevStore } from '../../../stores/devStore';
import { 
  ClipboardList, Plus, Trash2, Calendar, Phone, Users, 
  Mail, FileCode, CheckCircle, Circle, Check, X, Clock,
  AlertTriangle, RefreshCw
} from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import useToast from '../../../hooks/useToast';

function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}

const TYPE_ICONS = {
  task_call: '📞',
  task_meeting: '🤝',
  task_docs: '📝',
  task_email: '✉️'
};

const TYPE_LABELS = {
  task_call: 'Llamar',
  task_meeting: 'Reunión',
  task_docs: 'Documentación / Tarea Técnica',
  task_email: 'Enviar Correo'
};

const PRIORITY_CLASSES = {
  alta: 'bg-red-500/10 text-red-400 border-red-500/20',
  media: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  baja: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

export default function CrmTasksView() {
  const { showToast } = useToast();
  const { tasks, leads, addTask, updateTask, deleteTask } = useCrm(true);
  const { clientesSaas } = useDevStore();

  const [activeTab, setActiveTab] = useState('pendiente'); // 'pendiente' | 'completada'
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [associationFilter, setAssociationFilter] = useState('all'); // 'all' | 'clients' | 'leads'

  // Modal de Nueva Tarea
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'task_call',
    priority: 'media',
    date: new Date().toISOString().split('T')[0],
    targetType: 'client', // 'client' | 'lead' | 'none'
    targetId: ''
  });
  const [loading, setLoading] = useState(false);

  // Filtrado de tareas
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchStatus = t.status === activeTab;
        const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
        let matchAssociation = true;
        if (associationFilter === 'clients') {
          matchAssociation = !!t.clientId;
        } else if (associationFilter === 'leads') {
          matchAssociation = !!t.leadId;
        }
        return matchStatus && matchPriority && matchAssociation;
      })
      .sort((a, b) => {
        // Ordenar primero por prioridad (alta -> media -> baja)
        const pOrder = { alta: 3, media: 2, baja: 1 };
        const pDiff = (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        // Luego por fecha de vencimiento
        return new Date(a.date) - new Date(b.date);
      });
  }, [tasks, activeTab, priorityFilter, associationFilter]);

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'pendiente' ? 'completada' : 'pendiente';
    try {
      await updateTask(taskId, { status: nextStatus });
      showToast(nextStatus === 'completada' ? '✅ Tarea completada' : '🔄 Tarea reabierta', { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar estado de la tarea', { type: 'error' });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      showToast('🗑️ Tarea eliminada', { type: 'info' });
    } catch (err) {
      console.error(err);
      showToast('Error al eliminar tarea', { type: 'error' });
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('El título de la tarea es obligatorio', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: form.title.trim(),
        type: form.type,
        priority: form.priority,
        date: form.date,
        status: 'pendiente'
      };

      if (form.targetType === 'client' && form.targetId) {
        taskData.clientId = form.targetId;
      } else if (form.targetType === 'lead' && form.targetId) {
        taskData.leadId = form.targetId;
      }

      await addTask(taskData);
      showToast('Tarea creada con éxito', { type: 'success' });
      setIsModalOpen(false);
      setForm({
        title: '',
        type: 'task_call',
        priority: 'media',
        date: new Date().toISOString().split('T')[0],
        targetType: 'client',
        targetId: ''
      });
    } catch (err) {
      console.error(err);
      showToast('Error al crear tarea', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 tab-content-enter select-none">
      {/* Controles de Filtros y Crear */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl">
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Tabs Estado */}
          <div className="flex bg-[var(--color-bg)]/80 p-0.5 rounded-xl border border-[var(--color-border)] w-max text-xs font-bold">
            <button
              onClick={() => setActiveTab('pendiente')}
              className={`px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all ${
                activeTab === 'pendiente'
                  ? 'bg-indigo-600 text-white font-black'
                  : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Pendientes ({tasks.filter(t => t.status === 'pendiente').length})
            </button>
            <button
              onClick={() => setActiveTab('completada')}
              className={`px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all ${
                activeTab === 'completada'
                  ? 'bg-indigo-600 text-white font-black'
                  : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Completadas ({tasks.filter(t => t.status === 'completada').length})
            </button>
          </div>

          {/* Filtro Prioridad */}
          <div className="w-[150px]">
            <CustomSelect 
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { id: 'all', name: 'Prioridad: Todas' },
                { id: 'alta', name: '🔴 Alta' },
                { id: 'media', name: '🟣 Media' },
                { id: 'baja', name: '🔵 Baja' }
              ]}
            />
          </div>

          {/* Filtro Asociación */}
          <div className="w-[160px]">
            <CustomSelect 
              value={associationFilter}
              onChange={setAssociationFilter}
              options={[
                { id: 'all', name: 'Asociación: Todas' },
                { id: 'clients', name: '🏢 Solo Clientes' },
                { id: 'leads', name: '👤 Solo Leads' }
              ]}
            />
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-[0.98] cursor-pointer border-none"
        >
          <Plus size={13} />
          Nueva Tarea
        </button>
      </div>

      {/* Listado de Tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredTasks.map(task => {
          const client = task.clientId ? clientesSaas.find(c => c.id === task.clientId) : null;
          const leadObj = task.leadId ? leads.find(l => l.id === task.leadId) : null;
          
          return (
            <div 
              key={task.id} 
              className={`p-4 bg-[var(--color-surface)] rounded-2xl border flex flex-col justify-between gap-3 relative transition-all duration-300 ${
                task.status === 'completada' ? 'opacity-65 border-[var(--color-border)]' : 
                task.priority === 'alta' ? 'border-red-500/25 bg-red-500/[0.005]' : 'border-[var(--color-border)] hover:border-indigo-500/25'
              }`}
            >
              {/* Contenido Tarea */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox de finalización */}
                    <button 
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className="mt-0.5 text-slate-500 hover:text-indigo-400 bg-transparent border-none cursor-pointer p-0 select-none shrink-0"
                    >
                      {task.status === 'completada' ? (
                        <CheckCircle size={15} className="text-emerald-500" />
                      ) : (
                        <Circle size={15} />
                      )}
                    </button>

                    <div>
                      <h4 className={`text-xs font-semibold leading-relaxed ${
                        task.status === 'completada' ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
                      }`}>
                        <span className="mr-1.5">{TYPE_ICONS[task.type] || '📌'}</span>
                        {task.title}
                      </h4>
                      
                      {/* Vencimiento */}
                      <span className="text-[9.5px] text-[var(--color-text-muted)] font-mono mt-1 flex items-center gap-1">
                        <Calendar size={10} />
                        Vence: {task.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vínculo */}
                {(client || leadObj) && (
                  <div className="p-2 bg-[var(--color-surface-2)]/30 rounded-xl border border-[var(--color-border)] text-[9.5px] text-[var(--color-text-muted)] font-medium flex items-center justify-between">
                    {client ? (
                      <span>🏢 Cliente: <strong className="text-[var(--color-text)]">{client.nombre}</strong></span>
                    ) : (
                      <span>👤 Lead: <strong className="text-[var(--color-text)]">{leadObj.name} ({leadObj.company || 'Prospecto'})</strong></span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer de Tarjeta */}
              <div className="flex items-center justify-between border-t border-[var(--color-border)]/40 pt-3 mt-1 text-[10px]">
                <span className={`px-2 py-0.5 rounded text-[8.5px] font-black border uppercase tracking-wider ${PRIORITY_CLASSES[task.priority]}`}>
                  {task.priority}
                </span>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                  title="Eliminar Tarea"
                >
                  <Trash2 size={12} />
                </button>
              </div>

            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="col-span-full p-16 text-center text-[var(--color-text-muted)] italic text-xs bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl">
            No se encontraron tareas {activeTab}s con los filtros aplicados.
          </div>
        )}
      </div>

      {/* Modal Crear Tarea Portalizado */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
            <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-2xl animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
                <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
                  <ClipboardList size={16} />
                  Crear Nueva Tarea
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer bg-transparent border-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
                {/* Título */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Título de la Tarea</label>
                  <input 
                    type="text" 
                    placeholder="ej. Enviar propuesta revisada, Capacitación POS, etc."
                    value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Tipo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Tipo</label>
                    <CustomSelect 
                      value={form.type}
                      onChange={(val) => setForm(p => ({ ...p, type: val }))}
                      options={[
                        { id: 'task_call', name: '📞 Llamar' },
                        { id: 'task_meeting', name: '🤝 Reunión' },
                        { id: 'task_docs', name: '📝 Tarea Técnica' },
                        { id: 'task_email', name: '✉️ Enviar Correo' }
                      ]}
                    />
                  </div>

                  {/* Prioridad */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Prioridad</label>
                    <CustomSelect 
                      value={form.priority}
                      onChange={(val) => setForm(p => ({ ...p, priority: val }))}
                      options={[
                        { id: 'alta', name: '🔴 Alta' },
                        { id: 'media', name: '🟣 Media' },
                        { id: 'baja', name: '🔵 Baja' }
                      ]}
                    />
                  </div>
                </div>

                {/* Vencimiento */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Fecha Límite (Vencimiento)</label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                    className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0"
                    required
                  />
                </div>

                {/* Asociación */}
                <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-2xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Asociar A</label>
                    <CustomSelect 
                      value={form.targetType}
                      onChange={(val) => setForm(p => ({ ...p, targetType: val, targetId: '' }))}
                      options={[
                        { id: 'client', name: '🏢 Cliente Activo' },
                        { id: 'lead', name: '👤 Prospecto (Lead)' },
                        { id: 'none', name: '❌ Ninguna Asociación' }
                      ]}
                    />
                  </div>

                  {form.targetType === 'client' && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Seleccionar Cliente</label>
                      <CustomSelect 
                        value={form.targetId}
                        onChange={(val) => setForm(p => ({ ...p, targetId: val }))}
                        options={[
                          { id: '', name: 'Selecciona Cliente...' },
                          ...clientesSaas.map(c => ({ id: c.id, name: c.nombre }))
                        ]}
                      />
                    </div>
                  )}

                  {form.targetType === 'lead' && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Seleccionar Lead</label>
                      <CustomSelect 
                        value={form.targetId}
                        onChange={(val) => setForm(p => ({ ...p, targetId: val }))}
                        options={[
                          { id: '', name: 'Selecciona Lead...' },
                          ...leads.filter(l => l.status !== 'won' && l.status !== 'lost').map(l => ({ id: l.id, name: `${l.name} (${l.company || 'Sin Empresa'})` }))
                        ]}
                      />
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      Crear Tarea
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
