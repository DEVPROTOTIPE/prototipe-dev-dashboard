import React, { useState, useMemo } from 'react';
import useCrm from '../../../hooks/useCrm';
import { useAuthStore } from '../../../stores/authStore';
import ProposalFormModal from './ProposalFormModal';
import { exportProposalPDF } from '../../../services/pdfService';
import { 
  FileText, Plus, Search, Copy, Download, Trash2, Edit, AlertCircle, 
  CheckCircle, ArrowRight, Check, X, ShieldAlert, Settings, Network
} from 'lucide-react';
import { createPortal } from 'react-dom';

function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}

export default function CrmProposalsView() {
  const { user } = useAuthStore();
  const { 
    leads, proposals, addProposal, updateProposal, deleteProposal, convertLeadToClient 
  } = useCrm(true);

  // Filtros locales
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'draft' | 'sent' | 'negotiation' | 'won' | 'lost'
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  
  // Modal de Pérdida
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [lostProposal, setLostProposal] = useState(null);
  const [lossReason, setLossReason] = useState('');

  // Modal de Onboarding (Aprobación/Won)
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [onboardingProposal, setOnboardingProposal] = useState(null);
  const [onboardingData, setOnboardingData] = useState({
    nombre: '',
    contactoNombre: '',
    contactoTelefono: '',
    contactoCorreo: '',
    modeloMonetizacion: 'percentage',
    setupValor: 0,
    mensualidadValor: 0,
    comisionPorcentaje: 0,
    telemetryToken: '',
    versionCore: '1.0.0',
    urlHosting: ''
  });

  // Modal de Resultados de Conversión
  const [conversionResult, setConversionResult] = useState(null);

  // Formateador de moneda colombiana
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Buscar empresa del lead
  const getLeadCompany = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? (lead.company || lead.name) : 'Desconocido';
  };

  // Filtrado y Búsqueda de propuestas
  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      // Filtro de estado
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      
      // Búsqueda por título o nombre de empresa
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const company = getLeadCompany(p.leadId).toLowerCase();
        const title = (p.title || '').toLowerCase();
        const rep = (p.representative || '').toLowerCase();
        return title.includes(query) || company.includes(query) || rep.includes(query);
      }
      return true;
    }).sort((a, b) => {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
      return dateB - dateA; // Recientes primero
    });
  }, [proposals, statusFilter, searchQuery, leads]);

  // Manejadores
  const handleCreateOpen = () => {
    setEditingProposal(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (proposal) => {
    setEditingProposal(proposal);
    setIsFormOpen(true);
  };

  const handleSaveProposal = async (data) => {
    try {
      if (editingProposal) {
        await updateProposal(editingProposal.id, data, user);
      } else {
        await addProposal(data);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error al guardar propuesta:", err);
      alert("Error al guardar la propuesta comercial.");
    }
  };

  const handleDuplicate = async (proposal) => {
    try {
      const { id, createdAt, updatedAt, ...clonedFields } = proposal;
      const data = {
        ...clonedFields,
        title: `[Copia] ${proposal.title}`,
        status: 'draft',
      };
      await addProposal(data);
    } catch (err) {
      console.error("Error al duplicar propuesta:", err);
    }
  };

  const handleStatusChange = async (proposal, newStatus) => {
    if (newStatus === 'lost') {
      setLostProposal(proposal);
      setLossReason('');
      setIsLostModalOpen(true);
    } else if (newStatus === 'won') {
      const lead = leads.find(l => l.id === proposal.leadId) || {};
      setOnboardingProposal(proposal);
      setOnboardingData({
        nombre: lead.company || lead.name || '',
        contactoNombre: lead.name || '',
        contactoTelefono: lead.phone || '',
        contactoCorreo: lead.email || '',
        modeloMonetizacion: proposal.commissionPercent > 0 ? 'percentage' : 'fixed_monthly',
        setupValor: proposal.setupValue || 0,
        mensualidadValor: proposal.monthlyValue || 0,
        comisionPorcentaje: proposal.commissionPercent || 0,
        telemetryToken: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        versionCore: '1.0.0',
        urlHosting: ''
      });
      setIsOnboardingModalOpen(true);
    } else {
      try {
        await updateProposal(proposal.id, { ...proposal, status: newStatus }, user);
      } catch (err) {
        console.error("Error al cambiar estado:", err);
      }
    }
  };

  const handleConfirmLost = async () => {
    if (!lossReason.trim()) {
      alert("El motivo de pérdida es requerido.");
      return;
    }
    try {
      await updateProposal(lostProposal.id, {
        ...lostProposal,
        status: 'lost',
        lossReason: lossReason.trim()
      }, user);
      setIsLostModalOpen(false);
      setLostProposal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmOnboarding = async () => {
    if (!onboardingData.nombre.trim()) {
      alert("El nombre de la empresa es obligatorio.");
      return;
    }
    try {
      const res = await convertLeadToClient(
        onboardingProposal.leadId,
        onboardingProposal.id,
        onboardingData,
        user
      );
      setConversionResult(res);
      setIsOnboardingModalOpen(false);
    } catch (err) {
      console.error("Error al convertir lead a cliente:", err);
      alert("Fallo transaccional durante la conversión del cliente.");
    }
  };

  const handleExportPDF = (proposal) => {
    const lead = leads.find(l => l.id === proposal.leadId);
    exportProposalPDF(proposal, lead);
  };

  const handleDelete = async (proposalId) => {
    if (window.confirm("¿Está seguro de eliminar esta propuesta?")) {
      try {
        await deleteProposal(proposalId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Estilos de badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return 'text-slate-400 bg-slate-950/40 border-slate-800/80';
      case 'sent':
        return 'text-blue-400 bg-blue-950/20 border-blue-500/10';
      case 'negotiation':
        return 'text-violet-400 bg-violet-950/20 border-violet-500/10';
      case 'won':
        return 'text-emerald-400 bg-emerald-950/20 border-emerald-500/10';
      case 'lost':
        return 'text-rose-400 bg-rose-950/20 border-rose-500/10';
      default:
        return 'text-slate-400 bg-slate-800/50 border-slate-700/50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviada';
      case 'negotiation': return 'Negociación';
      case 'won': return 'Ganada ✔';
      case 'lost': return 'Perdida ✘';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            Propuestas Comerciales y Cotizaciones
          </h2>
          <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">
            Generación de ofertas comerciales, proyección financiera, tasas comisionales de telemetría y conversión automatizada a clientes.
          </p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/20 text-xs font-bold text-slate-100 rounded-xl shadow-lg flex items-center gap-1.5 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={14} />
          Nueva Propuesta
        </button>
      </div>

      {/* Filtros de búsqueda */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Pestañas de Estado */}
        <div className="flex bg-slate-950/40 border border-slate-800/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {['all', 'draft', 'sent', 'negotiation', 'won', 'lost'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-slate-900 border border-slate-800 text-indigo-400 font-bold' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              {status === 'all' ? 'Todas' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Input de Búsqueda */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, empresa o comercial..."
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-550"
          />
        </div>
      </div>

      {/* Grid o Tabla de Propuestas */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md">
        {filteredProposals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-450 uppercase tracking-wider bg-slate-950/20">
                  <th className="py-4 px-4">Referencia / Título</th>
                  <th className="py-4 px-4">Prospecto / Empresa</th>
                  <th className="py-4 px-4 text-right">Inversión Setup</th>
                  <th className="py-4 px-4 text-right">Mensualidad Proyectada</th>
                  <th className="py-4 px-4 text-center">Margen</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                  <th className="py-4 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {filteredProposals.map(proposal => (
                  <tr key={proposal.id} className="hover:bg-slate-950/10 transition-colors">
                    {/* Título */}
                    <td className="py-3.5 px-4 font-bold text-slate-200 max-w-[200px] truncate">
                      <div className="font-semibold text-slate-200">{proposal.title}</div>
                      <div className="text-[9px] text-slate-500 font-medium mt-0.5">Resp: {proposal.representative}</div>
                    </td>

                    {/* Prospecto */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-indigo-400">{getLeadCompany(proposal.leadId)}</span>
                    </td>

                    {/* Setup */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-350">
                      {formatCurrency(proposal.setupValue)}
                    </td>

                    {/* Mensualidad */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-300">
                      {formatCurrency(proposal.projectedMonthlyRevenue || proposal.monthlyValue)}
                      {proposal.commissionPercent > 0 && (
                        <span className="block text-[8px] text-slate-500">+{proposal.commissionPercent}% comisión</span>
                      )}
                    </td>

                    {/* Margen */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        (proposal.estimatedMargin || 0) < 40 
                          ? 'bg-rose-950/20 text-rose-400' 
                          : (proposal.estimatedMargin || 0) < 60 
                            ? 'bg-amber-950/20 text-amber-400' 
                            : 'bg-emerald-950/20 text-emerald-400'
                      }`}>
                        {proposal.estimatedMargin || 0}%
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 text-center">
                      {proposal.status === 'won' || proposal.status === 'lost' ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadge(proposal.status)}`}>
                          {getStatusLabel(proposal.status)}
                        </span>
                      ) : (
                        <select
                          value={proposal.status}
                          onChange={(e) => handleStatusChange(proposal, e.target.value)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-slate-950/60 focus:outline-none focus:border-indigo-500 ${getStatusBadge(proposal.status)}`}
                        >
                          <option value="draft">Borrador</option>
                          <option value="sent">Enviada</option>
                          <option value="negotiation">Negociación</option>
                          <option value="won">Ganada ✔</option>
                          <option value="lost">Perdida ✘</option>
                        </select>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {proposal.status !== 'won' && (
                          <button
                            onClick={() => handleEditOpen(proposal)}
                            title="Editar propuesta"
                            className="p-1 hover:bg-slate-950/40 text-slate-450 hover:text-slate-200 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                          >
                            <Edit size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(proposal)}
                          title="Duplicar propuesta"
                          className="p-1 hover:bg-slate-950/40 text-slate-450 hover:text-indigo-400 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => handleExportPDF(proposal)}
                          title="Exportar propuesta PDF"
                          className="p-1 hover:bg-slate-950/40 text-slate-450 hover:text-emerald-400 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                        >
                          <Download size={13} />
                        </button>
                        {proposal.status === 'draft' && (
                          <button
                            onClick={() => handleDelete(proposal.id)}
                            title="Eliminar propuesta"
                            className="p-1 hover:bg-slate-950/40 text-slate-500 hover:text-rose-400 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <AlertCircle size={24} className="text-slate-600 mx-auto" />
            <p className="text-slate-450 text-xs font-semibold">No se encontraron propuestas comerciales.</p>
            <p className="text-slate-600 text-[10px]">Crea una propuesta comercial para cotizar a tus leads calificados.</p>
          </div>
        )}
      </div>

      {/* Modal de Formulario (Creación/Edición) */}
      <ProposalFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProposal}
        proposal={editingProposal}
        leads={leads}
      />

      {/* Mini-Modal de Pérdida Obligatorio */}
      {isLostModalOpen && lostProposal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-xl space-y-4 animate-scaleIn">
              <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-slate-800 pb-2">
                <ShieldAlert size={16} />
                <span className="text-xs uppercase tracking-wider">Registrar Motivo de Pérdida</span>
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                De acuerdo a los estándares comerciales, para clasificar la propuesta de <strong className="text-slate-200">{getLeadCompany(lostProposal.leadId)}</strong> como PERDIDA es obligatorio registrar el motivo exacto:
              </p>
              <textarea
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                placeholder="Presupuesto insuficiente, cliente opta por desarrollo propio, tiempos de entrega inadecuados..."
                rows={3}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  onClick={() => {
                    setIsLostModalOpen(false);
                    setLostProposal(null);
                  }}
                  className="px-3.5 py-1.5 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-450 hover:text-slate-200 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmLost}
                  className="px-4 py-1.5 bg-rose-650 hover:bg-rose-600 border border-rose-500/20 text-[10px] font-bold text-slate-100 rounded-lg transition-all"
                >
                  Marcar como Perdida
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de Onboarding / Activación Automática (Won) */}
      {isOnboardingModalOpen && onboardingProposal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-scaleIn my-8">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-400" />
                  <div>
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">Aprovisionamiento Comercial y Onboarding</h3>
                    <p className="text-[9px] text-slate-500 font-medium">Revisa y confirma los parámetros para la creación del cliente.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="p-1 hover:bg-slate-950/60 border border-slate-850 rounded-lg text-slate-400"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-2xl p-4 flex gap-3 text-emerald-400 text-xs">
                  <CheckCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Esta operación marcará de forma atómica la propuesta y el lead como <strong className="text-emerald-300">GANADOS (won)</strong>, creará el cliente en el catálogo de control, agendará la planeación del proyecto, y configurará la orden de aprovisionamiento en espera.
                  </p>
                </div>

                {/* Formulario Onboarding */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bloque Comercial/Contacto */}
                  <div className="space-y-3 bg-slate-950/10 border border-slate-800/80 p-4 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Check size={12} className="text-indigo-400" />
                      Datos de Cliente y Comercial
                    </h4>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase">Nombre de la Empresa</label>
                      <input
                        type="text"
                        value={onboardingData.nombre}
                        onChange={(e) => setOnboardingData({...onboardingData, nombre: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase">Nombre del Contacto</label>
                      <input
                        type="text"
                        value={onboardingData.contactoNombre}
                        onChange={(e) => setOnboardingData({...onboardingData, contactoNombre: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase">Teléfono de Contacto</label>
                      <input
                        type="text"
                        value={onboardingData.contactoTelefono}
                        onChange={(e) => setOnboardingData({...onboardingData, contactoTelefono: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase">Correo de Contacto</label>
                      <input
                        type="email"
                        value={onboardingData.contactoCorreo}
                        onChange={(e) => setOnboardingData({...onboardingData, contactoCorreo: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Bloque Técnico / Aprovisionamiento */}
                  <div className="space-y-3 bg-slate-950/10 border border-slate-800/80 p-4 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Settings size={12} className="text-indigo-400" />
                      Inicialización Técnica
                    </h4>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase flex justify-between">
                        <span>Token de Telemetría (Auto)</span>
                        <span className="text-[7px] text-slate-500 font-medium">No modificable</span>
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={onboardingData.telemetryToken}
                        className="w-full bg-slate-950/30 border border-slate-850 rounded-lg py-1 px-2.5 text-[10px] text-slate-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase">Versión Inicial del Core</label>
                      <input
                        type="text"
                        value={onboardingData.versionCore}
                        onChange={(e) => setOnboardingData({...onboardingData, versionCore: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase">URL Hosting Destino (Opcional)</label>
                      <input
                        type="text"
                        value={onboardingData.urlHosting}
                        onChange={(e) => setOnboardingData({...onboardingData, urlHosting: e.target.value})}
                        placeholder="https://empresa.prototipe.io"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <div className="p-2.5 bg-slate-950/30 border border-slate-800 rounded-xl space-y-1 text-[8.5px] text-slate-500 leading-normal">
                      <span className="font-bold text-indigo-400 block uppercase">CLIENT ID SLUG AUTOMÁTICO</span>
                      El ID del cliente se calculará automáticamente utilizando slugify (ej: SmartFix → <code className="font-mono bg-slate-950 px-1 text-slate-350">smartfix</code>). Si ya existe, se resolverá como <code className="font-mono bg-slate-950 px-1 text-slate-350">smartfix-2</code>.
                    </div>
                  </div>
                </div>

                {/* Resumen del Modelo Financiero */}
                <div className="bg-slate-950/20 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 text-xs font-mono">
                  <div className="flex-1 min-w-[120px]">
                    <span className="block text-[8px] font-black text-slate-500 uppercase">Setup Comercial</span>
                    <span className="text-sm font-bold text-slate-250">{formatCurrency(onboardingData.setupValor)}</span>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <span className="block text-[8px] font-black text-slate-500 uppercase">Mensualidad Fija</span>
                    <span className="text-sm font-bold text-slate-250">{formatCurrency(onboardingData.mensualidadValor)}</span>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <span className="block text-[8px] font-black text-slate-500 uppercase">Tasa Comisión</span>
                    <span className="text-sm font-bold text-indigo-400">{onboardingData.comisionPorcentaje}%</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-slate-950/20 border-t border-slate-800/80">
                <button
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-450 hover:text-slate-250 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmOnboarding}
                  className="px-5 py-2 bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/20 text-xs font-bold text-slate-100 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  Confirmar y Activar Cliente
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de Resultados Exitosos de Conversión */}
      {conversionResult && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center space-y-4 animate-scaleIn">
              <div className="w-12 h-12 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✔
              </div>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Conversión Exitosa</h3>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                El prospecto se ha convertido exitosamente en un cliente activo. Se han creado de forma atómica los siguientes registros en el sistema:
              </p>

              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-left text-[10px] font-mono">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">CLIENTE ID:</span>
                  <span className="text-indigo-400 font-bold">{conversionResult.clientId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">PROYECTO ID:</span>
                  <span className="text-slate-300 font-bold">{conversionResult.projectId?.substring(0, 16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PROVISIONING ORDER ID:</span>
                  <span className="text-emerald-400 font-bold">{conversionResult.provisioningOrderId?.substring(0, 16)}...</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl text-left flex gap-2">
                <Network size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-500 leading-normal">
                  <strong>Estado de Aprovisionamiento:</strong> La orden se registró en `/provisioning_orders` en estado <code>pending</code> (approved: false). Está lista para ser ejecutada por CLI o Cloud Functions en la siguiente fase.
                </p>
              </div>

              <button
                onClick={() => setConversionResult(null)}
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/20 text-xs font-bold text-slate-100 rounded-xl transition-all"
              >
                Cerrar y Regresar
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
