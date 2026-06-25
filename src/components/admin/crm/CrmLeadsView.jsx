import React, { useState, useMemo } from 'react';
import useCrm from '../../../hooks/useCrm';
import CustomSelect from '../../ui/CustomSelect';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { 
  LEAD_STATUS, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  LOSS_REASONS, LOSS_REASONS_LABELS,
  PRIORITIES, PRIORITIES_LABELS, PRIORITIES_COLORS
} from '../../../config/crmConstants';
import { 
  Search, Plus, Eye, Edit2, Archive, Phone, Mail, MessageSquare, 
  User, X, Check, Calendar, ClipboardList, Trash2, ArrowRight, Clock
} from 'lucide-react';

export default function CrmLeadsView() {
  const { showConfirm } = useAlertConfirm();
  
  // CRM Hook
  const { 
    leads, meetings, diagnostics, proposals,
    addLead, updateLead, archiveLead, addLeadNote, deleteLead,
    getMeetingsByLeadId, getDiagnosticsByLeadId, getProposalsByLeadId
  } = useCrm(true);

  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isFicha360Open, setIsFicha360Open] = useState(false);

  // Estados de datos para Modales
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Formulario Lead (crear/editar)
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    channel: 'WhatsApp',
    sector: 'retail_clothing',
    priority: 'C',
    status: 'lead_new',
    responsible: 'Sergio Herrera',
    notes: []
  });

  // Formulario de Notas
  const [newNoteAuthor, setNewNoteAuthor] = useState('Sergio Herrera');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Formulario de Archivado
  const [archiveForm, setArchiveForm] = useState({
    lossReason: 'lost_price',
    notes: ''
  });

  // Ficha 360 subtab
  const [fichaSubTab, setFichaSubTab] = useState('notes'); // 'notes' | 'timeline'

  // Helper para formatear fechas de Firestore/JS
  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (dateVal.seconds) {
      return new Date(dateVal.seconds * 1000).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    }
    return new Date(dateVal).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  };

  // Filtrado de Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || lead.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [leads, searchTerm, statusFilter, priorityFilter]);

  // Manejo de Formulario Crear Lead
  const handleOpenCreateModal = () => {
    setLeadForm({
      name: '',
      company: '',
      phone: '',
      email: '',
      channel: 'WhatsApp',
      sector: 'retail_clothing',
      priority: 'C',
      status: 'lead_new',
      responsible: 'Sergio Herrera',
      notes: []
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.name.trim() || !leadForm.phone || !leadForm.phone.trim()) {
      alert('Nombre y Teléfono son obligatorios');
      return;
    }
    try {
      await addLead(leadForm);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Manejo de Formulario Editar Lead
  const handleOpenEditModal = (lead) => {
    setSelectedLead(lead);
    setLeadForm({
      name: lead.name || '',
      company: lead.company || '',
      phone: lead.phone || '',
      email: lead.email || '',
      channel: lead.channel || 'WhatsApp',
      sector: lead.sector || 'retail_clothing',
      priority: lead.priority || 'C',
      status: lead.status || 'lead_new',
      responsible: lead.responsible || 'Sergio Herrera'
    });
    setIsEditModalOpen(true);
  };

  const handleEditLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.name.trim() || !leadForm.phone || !leadForm.phone.trim()) {
      alert('Nombre y Teléfono son obligatorios');
      return;
    }
    try {
      await updateLead(selectedLead.id, leadForm);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Manejo de Archivado de Lead
  const handleOpenArchiveModal = (lead) => {
    setSelectedLead(lead);
    setArchiveForm({
      lossReason: 'lost_price',
      notes: ''
    });
    setIsArchiveModalOpen(true);
  };

  const handleArchiveSubmit = async (e) => {
    e.preventDefault();
    try {
      await archiveLead(selectedLead.id, archiveForm.lossReason, archiveForm.notes?.trim() || '');
      setIsArchiveModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Eliminar Lead (con doble confirmación)
  const handleDeleteLead = async (lead) => {
    showConfirm({
      title: '¿Eliminar Lead permanentemente?',
      message: `Esta acción borrará al prospecto "${lead.name}" y toda su información asociada. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteLead(lead.id);
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Agregar Nota
  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    if (!newNoteAuthor || !newNoteAuthor.trim()) {
      alert('El autor de la nota es obligatorio');
      return;
    }
    try {
      await addLeadNote(selectedLead.id, newNoteAuthor.trim(), newNoteContent.trim());
      setNewNoteContent('');
      // Refrescar el selectedLead localmente para ver el cambio
      const updatedLeads = leads.find(l => l.id === selectedLead.id);
      if (updatedLeads) setSelectedLead(updatedLeads);
    } catch (err) {
      console.error(err);
    }
  };

  // Ficha 360° Open
  const handleOpenFicha = (lead) => {
    setSelectedLead(lead);
    setFichaSubTab('notes');
    setIsFicha360Open(true);
  };

  // Obtener línea de tiempo combinada para el Lead
  const timelineEvents = useMemo(() => {
    if (!selectedLead) return [];
    
    const events = [];

    // 1. Evento de creación del Lead
    events.push({
      type: 'creation',
      title: 'Prospecto Creado',
      description: `Canal de origen: ${selectedLead.channel || 'Desconocido'}. Responsable asignado: ${selectedLead.responsible}.`,
      date: selectedLead.createdAt,
      icon: User,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    });

    // 2. Reuniones asociadas
    const leadMeetings = getMeetingsByLeadId(selectedLead.id);
    leadMeetings.forEach(m => {
      let iconColor = 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      if (m.status === 'done') iconColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      if (m.status === 'cancelled') iconColor = 'text-red-400 bg-red-500/10 border-red-500/20';

      events.push({
        type: 'meeting',
        title: `Reunión: ${m.status === 'done' ? 'Realizada' : m.status === 'cancelled' ? 'Cancelada' : 'Programada'}`,
        description: `Fecha: ${formatDate(m.date)}. Notas: ${m.notes || 'Sin anotaciones'}.`,
        date: m.date || m.createdAt,
        icon: Calendar,
        color: iconColor
      });
    });

    // 3. Diagnósticos asociados
    const diag = getDiagnosticsByLeadId(selectedLead.id);
    if (diag) {
      events.push({
        type: 'diagnostic',
        title: 'Diagnóstico Completado (Briefing Maestro)',
        description: `Complejidad: ${diag.complexityLevel?.toUpperCase()}. Flags: ${Object.keys(diag.featureFlags || {}).filter(k => diag.featureFlags[k]).join(', ') || 'Ninguno'}.`,
        date: diag.updatedAt || diag.createdAt,
        icon: ClipboardList,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      });
    }

    // 4. Propuestas asociadas
    const props = getProposalsByLeadId(selectedLead.id);
    props.forEach(p => {
      events.push({
        type: 'proposal',
        title: `Propuesta Comercial: ${p.status?.toUpperCase()}`,
        description: `Setup: $${Number(p.setupValue || 0).toLocaleString()} COP • Mensual: $${Number(p.monthlyValue || 0).toLocaleString()} COP • Comisión: ${p.commissionPct || 0}%.`,
        date: p.updatedAt || p.createdAt,
        icon: ArrowRight,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      });
    });

    // Ordenar por fecha cronológica inversa
    return events.sort((a, b) => {
      const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
      const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [selectedLead, meetings, diagnostics, proposals]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Buscador */}
        <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800/80 px-3.5 py-2 rounded-xl focus-within:border-indigo-500/50 transition-all flex-1 max-w-md">
          <Search size={14} className="text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar lead por nombre, empresa, celular..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-200 placeholder-slate-550 focus:ring-0" 
          />
        </div>

        {/* Dropdowns de Filtro */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-40">
            <CustomSelect 
              value={statusFilter} 
              onChange={setStatusFilter} 
              options={[
                { value: 'all', label: 'Todos los Estados' },
                ...Object.keys(LEAD_STATUS_LABELS).map(k => ({ value: k, label: LEAD_STATUS_LABELS[k] }))
              ]} 
              placeholder="Filtrar por Estado" 
            />
          </div>

          <div className="w-40">
            <CustomSelect 
              value={priorityFilter} 
              onChange={setPriorityFilter} 
              options={[
                { value: 'all', label: 'Todas las Prioridades' },
                ...Object.keys(PRIORITIES_LABELS).map(k => ({ value: k, label: PRIORITIES_LABELS[k] }))
              ]} 
              placeholder="Filtrar por Prioridad" 
            />
          </div>

          <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-950/20 active:scale-95 flex items-center gap-1.5 border-none"
          >
            <Plus size={14} />
            Crear Lead
          </button>
        </div>
      </div>

      {/* Tabla Responsive de Leads */}
      <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                <th className="p-4">Nombre / Empresa</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Canal / Sector</th>
                <th className="p-4">Prioridad</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Responsable</th>
                <th className="p-4">Fecha de Creación</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-transparent">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-900/30 transition-all">
                  {/* Nombre y Empresa */}
                  <td className="p-4">
                    <div className="font-bold text-slate-200">{lead.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{lead.company || 'Sin Empresa'}</div>
                  </td>

                  {/* Celular y Correo */}
                  <td className="p-4 space-y-0.5">
                    <div className="font-mono text-slate-350">{lead.phone}</div>
                    <div className="text-[10px] text-slate-500">{lead.email || 'Sin correo'}</div>
                  </td>

                  {/* Origen y Sector */}
                  <td className="p-4 space-y-0.5">
                    <div className="text-slate-300 font-semibold">{lead.channel || 'Directo'}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{lead.sector?.replace('_', ' ') || 'N/A'}</div>
                  </td>

                  {/* Prioridad */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black tracking-wide ${PRIORITIES_COLORS[lead.priority] || ''}`}>
                      {lead.priority ? `Prioridad ${lead.priority}` : 'C'}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold tracking-wide ${LEAD_STATUS_COLORS[lead.status] || ''}`}>
                      {LEAD_STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </td>

                  {/* Responsable */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-350 font-medium">
                      <User size={11} className="text-slate-550" />
                      {lead.responsible || 'Sergio Herrera'}
                    </div>
                  </td>

                  {/* Fecha de Creación */}
                  <td className="p-4 text-slate-450 font-mono text-[10px]">
                    {formatDate(lead.createdAt)}
                  </td>

                  {/* Acciones */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenFicha(lead)}
                        title="Ver Ficha 360"
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-700 bg-transparent"
                      >
                        <Eye size={13} />
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(lead)}
                        title="Editar Lead"
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-700 bg-transparent"
                      >
                        <Edit2 size={13} />
                      </button>
                      {lead.status !== 'lost' && lead.status !== 'won' && (
                        <button 
                          onClick={() => handleOpenArchiveModal(lead)}
                          title="Archivar Lead (Pérdida)"
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-700 bg-transparent"
                        >
                          <Archive size={13} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteLead(lead)}
                        title="Eliminar Lead"
                        className="p-1.5 hover:bg-slate-800/80 text-slate-500 hover:text-red-500 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-750 bg-transparent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-550">
                    No se encontraron leads con los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Crear Lead */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setIsCreateModalOpen(false)} />
          <form onSubmit={handleCreateLeadSubmit} className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Crear Nuevo Lead Comercial</h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin text-left">
              {/* Bloque Nombre / Empresa */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre del Prospecto *</label>
                  <input type="text" required value={leadForm.name} onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej. Laura Gómez" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Empresa (Opcional)</label>
                  <input type="text" value={leadForm.company} onChange={e => setLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Ej. Boutique Bella" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              {/* Teléfono / Correo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Teléfono / Celular *</label>
                  <input type="text" required value={leadForm.phone} onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ej. +573001234567" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Correo Electrónico (Opcional)</label>
                  <input type="email" value={leadForm.email} onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Ej. laura@boutique.com" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              {/* Canal / Sector */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Canal de Origen</label>
                  <CustomSelect value={leadForm.channel} onChange={val => setLeadForm(prev => ({ ...prev, channel: val }))}
                    options={[
                      { value: 'WhatsApp', label: 'Contacto WhatsApp Directo' },
                      { value: 'Web', label: 'Sitio Web Corporativo' },
                      { value: 'Referido', label: 'Referencia / Recomendado' },
                      { value: 'Llamada', label: 'Contacto Telefónico Directo' },
                      { value: 'Feria', label: 'Evento / Feria Comercial' }
                    ]} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sector de Actividad</label>
                  <CustomSelect value={leadForm.sector} onChange={val => setLeadForm(prev => ({ ...prev, sector: val }))}
                    options={[
                      { value: 'retail_clothing', label: 'Ropa / Moda' },
                      { value: 'retail_electronics', label: 'Tecnología / Hardware' },
                      { value: 'gastronomy_food', label: 'Restaurante / Cafetería' },
                      { value: 'service_technical', label: 'Taller Técnico / Reparaciones' },
                      { value: 'distribution_logistics', label: 'Logística / Despachos' },
                      { value: 'beauty_salon', label: 'Salón de Belleza / Estética' },
                      { value: 'others', label: 'Otro sector de negocio' }
                    ]} />
                </div>
              </div>

              {/* Prioridad / Responsable */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Prioridad</label>
                  <CustomSelect value={leadForm.priority} onChange={val => setLeadForm(prev => ({ ...prev, priority: val }))}
                    options={Object.keys(PRIORITIES_LABELS).map(k => ({ value: k, label: PRIORITIES_LABELS[k] }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Responsable Comercial</label>
                  <input type="text" value={leadForm.responsible} onChange={e => setLeadForm(prev => ({ ...prev, responsible: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent cursor-pointer">
                Cancelar
              </button>
              <button type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/20 active:scale-95 border-none cursor-pointer">
                Crear Lead
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Editar Lead */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setIsEditModalOpen(false)} />
          <form onSubmit={handleEditLeadSubmit} className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider">Editar Lead: {selectedLead?.name}</h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre del Prospecto *</label>
                  <input type="text" required value={leadForm.name} onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Empresa (Opcional)</label>
                  <input type="text" value={leadForm.company} onChange={e => setLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Teléfono / Celular *</label>
                  <input type="text" required value={leadForm.phone} onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Correo Electrónico (Opcional)</label>
                  <input type="email" value={leadForm.email} onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Canal de Origen</label>
                  <CustomSelect value={leadForm.channel} onChange={val => setLeadForm(prev => ({ ...prev, channel: val }))}
                    options={[
                      { value: 'WhatsApp', label: 'Contacto WhatsApp Directo' },
                      { value: 'Web', label: 'Sitio Web Corporativo' },
                      { value: 'Referido', label: 'Referencia / Recomendado' },
                      { value: 'Llamada', label: 'Contacto Telefónico Directo' },
                      { value: 'Feria', label: 'Evento / Feria Comercial' }
                    ]} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sector de Actividad</label>
                  <CustomSelect value={leadForm.sector} onChange={val => setLeadForm(prev => ({ ...prev, sector: val }))}
                    options={[
                      { value: 'retail_clothing', label: 'Ropa / Moda' },
                      { value: 'retail_electronics', label: 'Tecnología / Hardware' },
                      { value: 'gastronomy_food', label: 'Restaurante / Cafetería' },
                      { value: 'service_technical', label: 'Taller Técnico / Reparaciones' },
                      { value: 'distribution_logistics', label: 'Logística / Despachos' },
                      { value: 'beauty_salon', label: 'Salón de Belleza / Estética' },
                      { value: 'others', label: 'Otro sector de negocio' }
                    ]} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Prioridad</label>
                  <CustomSelect value={leadForm.priority} onChange={val => setLeadForm(prev => ({ ...prev, priority: val }))}
                    options={Object.keys(PRIORITIES_LABELS).map(k => ({ value: k, label: PRIORITIES_LABELS[k] }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Responsable Comercial</label>
                  <input type="text" value={leadForm.responsible} onChange={e => setLeadForm(prev => ({ ...prev, responsible: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent cursor-pointer">
                Cancelar
              </button>
              <button type="submit"
                className="px-5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl shadow-lg active:scale-95 cursor-pointer">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Archivar Lead (Pérdida) */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setIsArchiveModalOpen(false)} />
          <form onSubmit={handleArchiveSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-red-400 tracking-wider">Archivar Oportunidad Perdida</h3>
              <button type="button" onClick={() => setIsArchiveModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Motivo de Pérdida *</label>
                <CustomSelect value={archiveForm.lossReason} onChange={val => setArchiveForm(prev => ({ ...prev, lossReason: val }))}
                  options={Object.keys(LOSS_REASONS_LABELS).map(k => ({ value: k, label: LOSS_REASONS_LABELS[k] }))} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Notas Adicionales / Justificación</label>
                <textarea required value={archiveForm.notes} onChange={e => setArchiveForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4} placeholder="Detalla el motivo por el cual no se cerró la venta..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-none font-sans" />
              </div>
            </div>

            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsArchiveModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent cursor-pointer">
                Cancelar
              </button>
              <button type="submit"
                className="px-5 py-2 bg-red-650 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 border-none cursor-pointer">
                Archivar Perdida
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Ficha 360° */}
      {isFicha360Open && selectedLead && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0" onClick={() => setIsFicha360Open(false)} />
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] relative z-10">
            {/* Header Ficha */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black flex items-center justify-center text-sm border border-indigo-500/20">
                  {selectedLead.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-100">{selectedLead.name}</h3>
                    <span className={`px-2 py-0.2 rounded border text-[8px] font-black tracking-wide ${LEAD_STATUS_COLORS[selectedLead.status] || ''}`}>
                      {LEAD_STATUS_LABELS[selectedLead.status] || selectedLead.status}
                    </span>
                    <span className={`px-2 py-0.2 rounded border text-[8px] font-black tracking-wide ${PRIORITIES_COLORS[selectedLead.priority] || ''}`}>
                      Prioridad {selectedLead.priority || 'C'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{selectedLead.company || 'Sin Empresa registrada'}</p>
                </div>
              </div>
              <button onClick={() => setIsFicha360Open(false)} className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none">
                <X size={16} />
              </button>
            </div>

            {/* Layout Cuerpo Ficha */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
              {/* Panel Izquierdo: Información Base */}
              <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 space-y-6 overflow-y-auto scrollbar-thin text-left shrink-0">
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-black tracking-wider text-indigo-400">Detalles Básicos</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Celular / Teléfono</span>
                      <span className="font-mono text-slate-200">{selectedLead.phone}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Correo Electrónico</span>
                      <span className="text-slate-200 truncate block" title={selectedLead.email}>{selectedLead.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Canal de Origen</span>
                      <span className="text-slate-200">{selectedLead.channel || 'Directo'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Sector Comercial</span>
                      <span className="text-slate-200 uppercase tracking-wide text-[10px]">{selectedLead.sector?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Responsable Asignado</span>
                      <span className="text-slate-200">{selectedLead.responsible || 'Sergio Herrera'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Fecha de Captura</span>
                      <span className="text-slate-250 font-mono text-[10px]">{formatDate(selectedLead.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Acciones Rápidas */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-black tracking-wider text-indigo-400">Acciones de Contacto</h4>
                  <div className="flex flex-col gap-2">
                    <a 
                      href={`https://api.whatsapp.com/send?phone=${selectedLead.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent('Hola ' + selectedLead.name + ', te saludo de PROTOTIPE...')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/20 active:scale-95 border-none decoration-none"
                    >
                      <MessageSquare size={13} />
                      WhatsApp Directo
                    </a>
                    <a 
                      href={`tel:${selectedLead.phone}`}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-700 decoration-none"
                    >
                      <Phone size={13} />
                      Llamar por Teléfono
                    </a>
                    {selectedLead.email && (
                      <a 
                        href={`mailto:${selectedLead.email}`}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-700 decoration-none"
                      >
                        <Mail size={13} />
                        Enviar Correo
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Notas o Línea de Tiempo */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-950/25">
                {/* Tabs de Ficha */}
                <div className="flex border-b border-slate-800 px-6 gap-6 text-xs font-bold shrink-0 pt-3">
                  <button 
                    onClick={() => setFichaSubTab('notes')}
                    className={`pb-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
                      fichaSubTab === 'notes' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Notas de Seguimiento ({selectedLead.notes?.length || 0})
                  </button>
                  <button 
                    onClick={() => setFichaSubTab('timeline')}
                    className={`pb-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
                      fichaSubTab === 'timeline' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Línea de Tiempo Operativa ({timelineEvents.length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-6 min-h-0">
                  {/* SUBTAB: Notas */}
                  {fichaSubTab === 'notes' && (
                    <div className="space-y-6 text-left h-full flex flex-col">
                      {/* Formulario de Notas */}
                      <form onSubmit={handleAddNoteSubmit} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shrink-0">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">Añadir Nota de Bitácora</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <span className="font-bold">Autor:</span>
                            <input 
                              type="text" 
                              value={newNoteAuthor} 
                              onChange={e => setNewNoteAuthor(e.target.value)}
                              className="bg-transparent border-none outline-none font-bold text-slate-300 w-28 p-0 text-[10px] focus:ring-0" 
                            />
                          </div>
                        </div>
                        <textarea 
                          required
                          rows={3} 
                          value={newNoteContent}
                          onChange={e => setNewNoteContent(e.target.value)}
                          placeholder="Registra una actualización del prospecto..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-none font-sans"
                        />
                        <div className="flex justify-end">
                          <button 
                            type="submit"
                            className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl active:scale-95 border-none cursor-pointer"
                          >
                            Registrar Nota
                          </button>
                        </div>
                      </form>

                      {/* Listado de Notas */}
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
                        {(selectedLead.notes || []).map((note, index) => (
                          <div key={index} className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-2xl relative">
                            <div className="flex justify-between items-center text-[9px] text-slate-500 mb-1.5">
                              <span className="font-bold text-indigo-400">{note.author}</span>
                              <span className="font-mono">{formatDate(note.timestamp)}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{note.content}</p>
                          </div>
                        ))}
                        {(!selectedLead.notes || selectedLead.notes.length === 0) && (
                          <div className="text-center py-12 text-slate-550 text-xs">No hay notas guardadas para este lead.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: Línea de Tiempo */}
                  {fichaSubTab === 'timeline' && (
                    <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-6 text-left">
                      {timelineEvents.map((evt, idx) => {
                        const Icon = evt.icon;
                        return (
                          <div key={idx} className="relative">
                            {/* Dot */}
                            <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-lg border flex items-center justify-center ${evt.color}`}>
                              <Icon size={12} />
                            </span>
                            <div>
                              <div className="flex items-center justify-between">
                                <h5 className="font-extrabold text-xs text-slate-200">{evt.title}</h5>
                                <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                                  <Clock size={9} />
                                  {formatDate(evt.date)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-450 mt-1 leading-relaxed font-sans">{evt.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
              <button 
                onClick={() => setIsFicha360Open(false)}
                className="px-5 py-1.5 bg-slate-850 hover:bg-slate-850 text-slate-350 text-[11px] font-bold rounded-xl cursor-pointer transition-all border border-slate-800"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
