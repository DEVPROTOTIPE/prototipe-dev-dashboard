import React, { useState, useMemo } from 'react';
import useCrm from '../../../hooks/useCrm';
import { useDevStore } from '../../../stores/devStore';
import { 
  Calendar, Phone, Mail, MessageSquare, User, Clock, 
  AlertTriangle, Check, Plus, Search, Filter, ShieldAlert
} from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import useToast from '../../../hooks/useToast';

export default function CrmFollowupsView() {
  const { showToast } = useToast();
  const { followups, addFollowup } = useCrm(true);
  const { clientesSaas } = useDevStore();

  // Filtros
  const [clientFilter, setClientFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all'); // 'all' | 'alerts'

  // Formulario de creación
  const [form, setForm] = useState({
    clientId: '',
    type: 'llamada',
    description: '',
    nextActionDate: '',
    agent: 'Sergio Herrera',
    isAlert: false,
    alertText: ''
  });
  const [loading, setLoading] = useState(false);

  // Filtrado de followups
  const filteredFollowups = useMemo(() => {
    return followups
      .filter(f => {
        const matchClient = clientFilter === 'all' || f.clientId === clientFilter;
        const matchType = typeFilter === 'all' || f.type === typeFilter;
        const matchAlert = alertFilter === 'all' || (alertFilter === 'alerts' && f.alerts && f.alerts.length > 0);
        return matchClient && matchType && matchAlert;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [followups, clientFilter, typeFilter, alertFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientId) {
      showToast('Por favor selecciona un cliente', { type: 'error' });
      return;
    }
    if (!form.description.trim()) {
      showToast('Por favor introduce la descripción del seguimiento', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const alertsArray = [];
      if (form.isAlert) {
        alertsArray.push(form.alertText.trim() || 'Alerta Operativa');
      }

      const followupData = {
        clientId: form.clientId,
        date: new Date().toISOString(),
        type: form.type,
        description: form.description.trim(),
        agent: form.agent.trim() || 'Sergio Herrera',
        nextActionDate: form.nextActionDate || null,
        alerts: alertsArray
      };

      await addFollowup(followupData);
      showToast('Seguimiento guardado correctamente', { type: 'success' });
      
      // Reset form (except agent and client)
      setForm(prev => ({
        ...prev,
        description: '',
        nextActionDate: '',
        isAlert: false,
        alertText: ''
      }));
    } catch (err) {
      console.error(err);
      showToast('Error al guardar el seguimiento', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 tab-content-enter select-none">
      {/* Contenedor principal de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Columna Izquierda: Formulario de Registro (4 cols) */}
        <div className="lg:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-[var(--color-border)] pb-2.5">
            <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
              <Plus size={14} />
              Registrar Interacción
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Registra el contacto comercial o soporte realizado.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Cliente */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Cliente</label>
              <CustomSelect 
                value={form.clientId}
                onChange={(val) => setForm(p => ({ ...p, clientId: val }))}
                options={[
                  { id: '', name: 'Selecciona Cliente...' },
                  ...clientesSaas.map(c => ({ id: c.id, name: c.nombre }))
                ]}
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
                    { id: 'llamada', name: '📞 Llamada' },
                    { id: 'whatsapp', name: '💬 WhatsApp' },
                    { id: 'correo', name: '✉️ Correo' },
                    { id: 'visita', name: '🤝 Visita' },
                    { id: 'nota', name: '📝 Nota Interna' }
                  ]}
                />
              </div>

              {/* Responsable */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Responsable</label>
                <input 
                  type="text" 
                  value={form.agent}
                  onChange={(e) => setForm(p => ({ ...p, agent: e.target.value }))}
                  className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0 font-medium"
                />
              </div>
            </div>

            {/* Fecha Próxima Acción */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Próxima Acción (Opcional)</label>
              <input 
                type="date" 
                value={form.nextActionDate}
                onChange={(e) => setForm(p => ({ ...p, nextActionDate: e.target.value }))}
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Descripción de la interacción</label>
              <textarea 
                rows="4"
                placeholder="Detalla lo conversado, acuerdos, inconformidades o requerimientos específicos del cliente..."
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0 resize-none leading-relaxed"
              />
            </div>

            {/* Checkbox Alerta */}
            <div className="p-3 bg-red-650/[0.02] border border-red-500/10 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[var(--color-text-muted)] select-none">
                <input 
                  type="checkbox" 
                  checked={form.isAlert}
                  onChange={(e) => setForm(p => ({ ...p, isAlert: e.target.checked }))}
                  className="w-4 h-4 rounded accent-red-600 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                />
                ⚠️ Generar Alerta Operativa
              </label>

              {form.isAlert && (
                <input 
                  type="text" 
                  placeholder="ej. Reclamo de POS / Cobro pendiente"
                  value={form.alertText}
                  onChange={(e) => setForm(p => ({ ...p, alertText: e.target.value }))}
                  className="bg-[var(--color-surface-2)]/30 border border-red-500/20 rounded-xl px-2.5 py-1.5 text-[11px] w-full text-[var(--color-text)] outline-none focus:border-red-500 focus:ring-0 animate-fade-in"
                />
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus size={13} />
              {loading ? 'Guardando...' : 'Registrar Seguimiento'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Filtros y Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Filtros de la lista */}
          <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <CustomSelect 
                value={clientFilter}
                onChange={setClientFilter}
                options={[
                  { id: 'all', name: 'Filtrar por Cliente' },
                  ...clientesSaas.map(c => ({ id: c.id, name: `🏢 ${c.nombre}` }))
                ]}
              />
            </div>
            <div>
              <CustomSelect 
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { id: 'all', name: 'Filtrar por Canal' },
                  { id: 'llamada', name: '📞 Llamada' },
                  { id: 'whatsapp', name: '💬 WhatsApp' },
                  { id: 'correo', name: '✉️ Correo' },
                  { id: 'visita', name: '🤝 Visita' },
                  { id: 'nota', name: '📝 Nota Interna' }
                ]}
              />
            </div>
            <div>
              <CustomSelect 
                value={alertFilter}
                onChange={setAlertFilter}
                options={[
                  { id: 'all', name: 'Todos los seguimientos' },
                  { id: 'alerts', name: '🚨 Solo Alertas' }
                ]}
              />
            </div>
          </div>

          {/* Timeline de Seguimiento */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredFollowups.map(follow => {
              const client = clientesSaas.find(c => c.id === follow.clientId) || { nombre: follow.clientId };
              const isAlert = follow.alerts && follow.alerts.length > 0;
              
              return (
                <div 
                  key={follow.id} 
                  className={`p-4 bg-[var(--color-surface)] rounded-2xl border transition-all hover:scale-[1.005] space-y-2 relative overflow-hidden ${
                    isAlert ? 'border-red-500/25 bg-red-500/[0.005]' : 'border-[var(--color-border)]'
                  }`}
                >
                  {/* Decorador de color izquierdo */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                    isAlert ? 'bg-red-500' :
                    follow.type === 'llamada' ? 'bg-blue-500' :
                    follow.type === 'whatsapp' ? 'bg-emerald-500' :
                    follow.type === 'correo' ? 'bg-purple-500' : 'bg-slate-500'
                  }`} />

                  {/* Header de Item */}
                  <div className="flex items-center justify-between text-xs pl-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[var(--color-text)]">🏢 {client.nombre}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">({follow.clientId})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] font-mono">
                      <Clock size={10} />
                      {new Date(follow.date).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>

                  {/* Detalle y Canal */}
                  <div className="pl-1">
                    <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">
                      {follow.description}
                    </p>
                  </div>

                  {/* Metadatos y Acciones */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)]/40 pt-2.5 mt-1 text-[10px] pl-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold flex items-center gap-1">
                        {follow.type === 'llamada' && '📞 Llamada'}
                        {follow.type === 'whatsapp' && '💬 WhatsApp'}
                        {follow.type === 'correo' && '✉️ Correo'}
                        {follow.type === 'visita' && '🤝 Visita'}
                        {follow.type === 'nota' && '📝 Nota Interna'}
                        <span className="text-slate-400 font-normal">por {follow.agent}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {follow.nextActionDate && (
                        <span className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[9px] font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                          <Calendar size={9} />
                          Próxima acción: {follow.nextActionDate}
                        </span>
                      )}
                      
                      {isAlert && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black flex items-center gap-0.5">
                          <ShieldAlert size={9} />
                          ALERTA: {follow.alerts[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredFollowups.length === 0 && (
              <div className="p-16 text-center text-[var(--color-text-muted)] italic text-xs bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl">
                Ninguna interacción coincide con los filtros aplicados.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
