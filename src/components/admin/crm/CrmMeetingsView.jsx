import React, { useState, useMemo } from 'react';
import useCrm from '../../../hooks/useCrm';
import CustomSelect from '../../ui/CustomSelect';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { LEAD_STATUS } from '../../../config/crmConstants';
import { 
  Calendar, Clock, Plus, Video, MapPin, X, Check, Edit2, AlertCircle, Trash2, ArrowRight
} from 'lucide-react';

export default function CrmMeetingsView() {
  const { showConfirm } = useAlertConfirm();

  // CRM Store & Hooks
  const { 
    leads, meetings, addMeeting, updateMeeting, deleteMeeting, updateLead
  } = useCrm(true);

  // Filtros locales
  const [statusFilter, setStatusFilter] = useState('scheduled'); // 'all' | 'scheduled' | 'done' | 'cancelled'

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReprogramModalOpen, setIsReprogramModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Estados de datos
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  
  // Formulario Reunión
  const [meetingForm, setMeetingForm] = useState({
    leadId: '',
    date: '',
    type: 'virtual',
    notes: '',
    status: 'scheduled'
  });

  // Formulario Resultado
  const [resultNotes, setResultNotes] = useState('');

  // Formulario Reprogramación
  const [reprogramDate, setReprogramDate] = useState('');

  // Helpers de fecha
  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (dateVal.seconds) {
      return new Date(dateVal.seconds * 1000).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
    }
    return new Date(dateVal).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  };

  // Filtrado de Reuniones
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      if (statusFilter === 'all') return true;
      return m.status === statusFilter;
    }).sort((a, b) => {
      // Ordenar por fecha: futuras primero si están programadas, pasadas primero si están realizadas
      const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
      const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
      return statusFilter === 'scheduled' ? dateA - dateB : dateB - dateA;
    });
  }, [meetings, statusFilter]);

  // Leads disponibles para asociar (activos, excluyendo won/lost si es posible, pero todos listados)
  const availableLeads = useMemo(() => {
    return leads.filter(l => l.status !== 'won' && l.status !== 'lost');
  }, [leads]);

  // Manejo de crear reunión
  const handleOpenCreateModal = () => {
    setMeetingForm({
      leadId: availableLeads[0]?.id || '',
      date: '',
      type: 'virtual',
      notes: '',
      status: 'scheduled'
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!meetingForm.leadId || !meetingForm.date) {
      alert('Debe asociar un Lead y definir una fecha/hora.');
      return;
    }
    try {
      await addMeeting(meetingForm);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Manejo de reprogramar
  const handleOpenReprogram = (meeting) => {
    setSelectedMeeting(meeting);
    const initialDate = meeting.date?.seconds 
      ? new Date(meeting.date.seconds * 1000).toISOString().slice(0, 16)
      : new Date(meeting.date).toISOString().slice(0, 16);
    setReprogramDate(initialDate);
    setIsReprogramModalOpen(true);
  };

  const handleReprogramSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMeeting(selectedMeeting.id, {
        date: reprogramDate,
        updatedAt: new Date().toISOString()
      });
      setIsReprogramModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Manejo de cancelar reunión
  const handleCancelMeeting = async (meeting) => {
    showConfirm({
      title: '¿Cancelar esta reunión?',
      message: 'La reunión se marcará como cancelada. Podrás reprogramarla en el futuro.',
      confirmText: 'Sí, Cancelar',
      cancelText: 'Omitir',
      onConfirm: async () => {
        try {
          await updateMeeting(meeting.id, { status: 'cancelled' });
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Registrar resultado de reunión
  const handleOpenResult = (meeting) => {
    setSelectedMeeting(meeting);
    setResultNotes(meeting.notes || '');
    setIsResultModalOpen(true);
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Actualizar reunión a 'done' y guardar su resultado
      await updateMeeting(selectedMeeting.id, {
        status: 'done',
        outcome: resultNotes,
        updatedAt: new Date().toISOString()
      });

      // 2. Actualizar lead a 'meeting_done' automáticamente
      if (selectedMeeting.leadId) {
        await updateLead(selectedMeeting.leadId, {
          status: 'meeting_done'
        });
      }
      setIsResultModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Eliminar Reunión
  const handleDeleteMeeting = async (meeting) => {
    showConfirm({
      title: '¿Eliminar Reunión?',
      message: 'Esta acción borrará el registro de la reunión permanentemente del historial.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteMeeting(meeting.id);
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Agenda */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Chips de Filtro */}
        <div className="flex border border-slate-800 rounded-xl overflow-hidden shrink-0">
          {[
            { id: 'scheduled', label: 'Programadas' },
            { id: 'done', label: 'Realizadas' },
            { id: 'cancelled', label: 'Canceladas' },
            { id: 'all', label: 'Todas' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id)}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border-none ${
                statusFilter === opt.id
                  ? 'bg-indigo-650 text-white'
                  : 'bg-slate-900/20 text-slate-450 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-950/20 active:scale-95 flex items-center gap-1.5 border-none"
        >
          <Plus size={14} />
          Agendar Reunión
        </button>
      </div>

      {/* Grid de Tarjetas de Reuniones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeetings.map(meeting => {
          const lead = leads.find(l => l.id === meeting.leadId);
          
          return (
            <div key={meeting.id} className="bg-slate-900/20 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700/60 transition-all text-left space-y-4">
              
              {/* Header: Fecha y Tipo */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200 font-extrabold text-xs">
                    <Calendar size={13} className="text-indigo-400" />
                    <span>{formatDate(meeting.date).split(' a las ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <Clock size={11} />
                    <span>{formatDate(meeting.date).split(' a las ')[1]}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${
                    meeting.type === 'virtual' 
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {meeting.type === 'virtual' ? 'Virtual' : 'Presencial'}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${
                    meeting.status === 'done' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                    meeting.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse'
                  }`}>
                    {meeting.status === 'done' ? 'Realizada' :
                     meeting.status === 'cancelled' ? 'Cancelada' : 'Programada'}
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-800/40" />

              {/* Lead Asociado */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Cliente / Lead</span>
                {lead ? (
                  <div>
                    <h4 className="text-xs font-black text-slate-200">{lead.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{lead.company || 'Sin Empresa'}</p>
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs italic block">Lead no encontrado (ID: {meeting.leadId?.slice(0,8)})</span>
                )}
              </div>

              {/* Notas u Objetivo */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Notas / Objetivo</span>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 font-sans">
                  {meeting.notes || 'Sin objetivos específicos registrados.'}
                </p>
              </div>

              {/* Outcome registrado */}
              {meeting.status === 'done' && meeting.outcome && (
                <div className="p-3 bg-emerald-950/10 border border-emerald-500/15 rounded-xl space-y-1">
                  <span className="text-[8px] uppercase font-black text-emerald-400 tracking-wider">Resultado Registrado</span>
                  <p className="text-[10px] text-emerald-300/80 leading-relaxed font-sans">{meeting.outcome}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2">
                <button 
                  onClick={() => handleDeleteMeeting(meeting)}
                  title="Eliminar registro"
                  className="p-1.5 hover:bg-slate-850 text-slate-500 hover:text-red-500 rounded-lg cursor-pointer transition-colors border border-transparent bg-transparent"
                >
                  <Trash2 size={13} />
                </button>

                {meeting.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenReprogram(meeting)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-350 text-[10px] font-bold rounded-lg cursor-pointer border border-slate-700 transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Edit2 size={10} />
                      Reprogramar
                    </button>
                    <button 
                      onClick={() => handleCancelMeeting(meeting)}
                      className="px-2.5 py-1.5 bg-red-650/10 hover:bg-red-650/20 text-red-400 text-[10px] font-bold rounded-lg cursor-pointer border border-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => handleOpenResult(meeting)}
                      className="px-3 py-1.5 bg-emerald-650 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 border-none transition-all flex items-center gap-1"
                    >
                      <Check size={11} />
                      Realizada
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
        {filteredMeetings.length === 0 && (
          <div className="col-span-full bg-slate-900/10 border border-solid border-slate-850 p-12 rounded-3xl text-center text-slate-550 text-xs">
            No hay reuniones agendadas en esta categoría.
          </div>
        )}
      </div>

      {/* MODAL: Agendar Reunión */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setIsCreateModalOpen(false)} />
          <form onSubmit={handleCreateSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Agendar Nueva Reunión</h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-left">
              {/* Seleccionar Lead */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Asociar Prospecto/Lead *</label>
                {availableLeads.length > 0 ? (
                  <CustomSelect 
                    value={meetingForm.leadId} 
                    onChange={val => setMeetingForm(prev => ({ ...prev, leadId: val }))}
                    options={availableLeads.map(l => ({ value: l.id, label: `${l.name} (${l.company || 'Sin Empresa'})` }))} 
                  />
                ) : (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-xl flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    <span>No hay leads activos creados. Crea un lead primero.</span>
                  </div>
                )}
              </div>

              {/* Fecha y Hora */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fecha y Hora de Reunión *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={meetingForm.date} 
                  onChange={e => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" 
                />
              </div>

              {/* Tipo de reunión */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Modalidad / Canal</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setMeetingForm(prev => ({ ...prev, type: 'virtual' }))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      meetingForm.type === 'virtual' 
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Video size={13} />
                    Videollamada (Virtual)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMeetingForm(prev => ({ ...prev, type: 'presencial' }))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      meetingForm.type === 'presencial' 
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MapPin size={13} />
                    Presencial (Oficina)
                  </button>
                </div>
              </div>

              {/* Objetivos */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Objetivos / Anotaciones</label>
                <textarea 
                  value={meetingForm.notes} 
                  onChange={e => setMeetingForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3} 
                  placeholder="Detalla los puntos a tratar en la reunión..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-none font-sans" 
                />
              </div>
            </div>

            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={availableLeads.length === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 border-none cursor-pointer disabled:opacity-50">
                Agendar Reunión
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Reprogramar Reunión */}
      {isReprogramModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setIsReprogramModalOpen(false)} />
          <form onSubmit={handleReprogramSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider">Reprogramar Fecha y Hora</h3>
              <button type="button" onClick={() => setIsReprogramModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nueva Fecha y Hora *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={reprogramDate} 
                  onChange={e => setReprogramDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" 
                />
              </div>
            </div>

            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsReprogramModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent cursor-pointer">
                Cancelar
              </button>
              <button type="submit"
                className="px-5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl shadow-lg active:scale-95 cursor-pointer">
                Guardar Nueva Fecha
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Registrar Resultado de Reunión */}
      {isResultModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setIsResultModalOpen(false)} />
          <form onSubmit={handleResultSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Conclusión de Reunión</h3>
              <button type="button" onClick={() => setIsResultModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Resultado / Conclusión de la Reunión *</label>
                <textarea 
                  required
                  value={resultNotes} 
                  onChange={e => setResultNotes(e.target.value)}
                  rows={4} 
                  placeholder="Detalla los acuerdos comerciales y conclusiones..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-none font-sans" 
                />
              </div>
            </div>

            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsResultModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent cursor-pointer">
                Cancelar
              </button>
              <button type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 border-none cursor-pointer">
                Completar Reunión
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
