import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDevStore } from '../../../stores/devStore';
import useCrm from '../../../hooks/useCrm';
import { 
  Search, Eye, Phone, Mail, MessageSquare, Calendar, User, 
  Globe, Cpu, Clock, ChevronRight, X, Heart, ShieldAlert, 
  DollarSign, Activity, FileText, Plus, Check, RefreshCw
} from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import useToast from '../../../hooks/useToast';
import { calculateClientHealth } from '../../../utils/crmHelpers';
import { db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}

export default function CrmClientsView() {
  const { showToast } = useToast();
  const { clientesSaas, failures, reports } = useDevStore();
  const { followups, addFollowup } = useCrm(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');

  // Detalle Ficha 360°
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientToken, setSelectedClientToken] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Nuevo Seguimiento rápido en la Ficha 360
  const [newFollowup, setNewFollowup] = useState({
    type: 'llamada',
    description: '',
    nextActionDate: '',
    alerts: ''
  });
  const [followupLoading, setFollowupLoading] = useState(false);

  // Filtrado de clientes
  const filteredClients = useMemo(() => {
    return clientesSaas.filter(client => {
      // Calcular salud localmente para este cliente
      const health = calculateClientHealth(client, failures, reports, followups);
      
      const matchesSearch = 
        client.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contacto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || client.estado === statusFilter;
      const matchesHealth = healthFilter === 'all' || health.color === healthFilter;

      return matchesSearch && matchesStatus && matchesHealth;
    });
  }, [clientesSaas, failures, reports, followups, searchTerm, statusFilter, healthFilter]);

  const handleOpenDrawer = async (client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
    setSelectedClientToken('Cargando...');
    setNewFollowup({
      type: 'llamada',
      description: '',
      nextActionDate: '',
      alerts: ''
    });

    try {
      const docRef = doc(db, 'client_credentials', client.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedClientToken(docSnap.data().token);
      } else {
        setSelectedClientToken('Sin token registrado');
      }
    } catch (err) {
      console.error('Error al obtener token de credenciales:', err);
      setSelectedClientToken('Error al cargar');
    }
  };

  const handleAddFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!newFollowup.description.trim()) {
      showToast('Por favor describe el detalle de la interacción', { type: 'error' });
      return;
    }
    setFollowupLoading(true);
    try {
      const data = {
        clientId: selectedClient.id,
        date: new Date().toISOString(),
        type: newFollowup.type,
        description: newFollowup.description,
        agent: 'Comercial Central',
        nextActionDate: newFollowup.nextActionDate || null,
        alerts: newFollowup.alerts ? newFollowup.alerts.split(',').map(a => a.trim()).filter(Boolean) : []
      };
      await addFollowup(data);
      showToast('Seguimiento registrado exitosamente', { type: 'success' });
      setNewFollowup({
        type: 'llamada',
        description: '',
        nextActionDate: '',
        alerts: ''
      });
    } catch (err) {
      console.error(err);
      showToast('Error al registrar seguimiento', { type: 'error' });
    } finally {
      setFollowupLoading(false);
    }
  };

  const activeClientHealth = useMemo(() => {
    if (!selectedClient) return null;
    return calculateClientHealth(selectedClient, failures, reports, followups);
  }, [selectedClient, failures, reports, followups]);

  const activeClientFollowups = useMemo(() => {
    if (!selectedClient) return [];
    return followups
      .filter(f => f.clientId === selectedClient.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedClient, followups]);

  return (
    <div className="space-y-4 tab-content-enter">
      {/* Controles de Búsqueda y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-all">
          <Search size={14} className="text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o contacto..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0 focus:border-none focus:outline-none" 
          />
        </div>
        <div>
          <CustomSelect 
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: 'all', name: 'Todos los Estados' },
              { id: 'Activo', name: 'Activos' },
              { id: 'Suspendido', name: 'Suspendidos' },
              { id: 'Demo', name: 'Modo Demo' }
            ]}
          />
        </div>
        <div>
          <CustomSelect 
            value={healthFilter}
            onChange={setHealthFilter}
            options={[
              { id: 'all', name: 'Todos los Niveles de Salud' },
              { id: 'emerald', name: '🟢 Excelente' },
              { id: 'blue', name: '🔵 Bueno' },
              { id: 'amber', name: '🟡 En Riesgo' },
              { id: 'red', name: '🔴 Crítico' }
            ]}
          />
        </div>
      </div>

      {/* Listado de Clientes */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30 text-[var(--color-text-muted)] uppercase tracking-wider font-semibold text-[10px]">
                <th className="p-3">Cliente</th>
                <th className="p-3">Contacto Principal</th>
                <th className="p-3">Esquema Comercial</th>
                <th className="p-3 text-right">Setup</th>
                <th className="p-3 text-right">Mensualidad</th>
                <th className="p-3 text-right">Comisión / Factor</th>
                <th className="p-3 text-center">Salud</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredClients.map(client => {
                const health = calculateClientHealth(client, failures, reports, followups);
                const com = client.comercial || {};
                
                return (
                  <tr key={client.id} className="hover:bg-[var(--color-surface-2)]/25 transition-colors group">
                    <td className="p-3 font-semibold text-[var(--color-text)]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                          health.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                          health.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                          health.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {client.nombre?.substring(0, 2).toUpperCase() || 'CL'}
                        </div>
                        <div>
                          <span className="block">{client.nombre}</span>
                          <span className="text-[9px] text-[var(--color-text-muted)] font-mono">{client.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {client.contacto?.nombre ? (
                        <div>
                          <span className="block font-medium text-[var(--color-text)]">{client.contacto.nombre}</span>
                          <span className="text-[9px] block font-mono">{client.contacto.correo || client.contacto.telefono}</span>
                        </div>
                      ) : (
                        <span className="italic text-[10px]">No registrado</span>
                      )}
                    </td>
                    <td className="p-3 capitalize text-[var(--color-text)] font-medium">
                      {com.modeloMonetizacion === 'percentage' ? 'Porcentaje de ventas' :
                       com.modeloMonetizacion === 'fixed_per_service' ? 'Fijo por servicio' :
                       com.modeloMonetizacion === 'flat_monthly' ? 'Mensualidad fija' : 
                       com.modeloMonetizacion || 'No definido'}
                    </td>
                    <td className="p-3 text-right font-mono text-[var(--color-text)]">
                      {com.setupValor ? `$${com.setupValor.toLocaleString('es-CO')}` : '$0'}
                    </td>
                    <td className="p-3 text-right font-mono text-[var(--color-text)]">
                      {com.mensualidadValor ? `$${com.mensualidadValor.toLocaleString('es-CO')}` : '$0'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-500 dark:text-indigo-400">
                      {com.modeloMonetizacion === 'percentage' ? `${com.comisionPorcentaje}%` :
                       com.modeloMonetizacion === 'fixed_per_service' ? `$${(com.comisionPorcentaje || 0).toLocaleString('es-CO')}` :
                       'N/A'}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black inline-flex items-center gap-1 border ${health.bg} ${health.text} ${health.border}`}>
                        <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                        {health.score}% ({health.label})
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleOpenDrawer(client)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 mx-auto transition-all active:scale-95 border-none cursor-pointer"
                      >
                        <Eye size={11} />
                        Ficha 360
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[var(--color-text-muted)] italic">
                    No se encontraron clientes activos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Ficha 360° Portalizado */}
      {isDrawerOpen && selectedClient && (
        <Portal>
          <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            {/* Backdrop Click triggers close */}
            <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
            
            {/* Contenedor Drawer */}
            <div className="relative w-full max-w-xl bg-[var(--color-surface)] border-l border-[var(--color-border)] h-full shadow-2xl flex flex-col animate-slide-left overflow-hidden">
              {/* Encabezado Ficha */}
              <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-2)]/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-extrabold flex items-center justify-center border border-indigo-500/20">
                    {selectedClient.nombre?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[var(--color-text)] flex items-center gap-1.5">
                      {selectedClient.nombre}
                      <span className="text-[10px] font-normal text-[var(--color-text-muted)] font-mono">({selectedClient.id})</span>
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">Ficha de Cliente de 360 grados</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* 1. Indicador de Salud Circular */}
                {activeClientHealth && (
                  <div className="p-4 bg-[var(--color-surface-2)]/40 rounded-2xl border border-[var(--color-border)] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--color-text-muted)] flex items-center gap-1">
                        <Heart size={12} className={activeClientHealth.text} />
                        Salud del Cliente
                      </h4>
                      <p className={`text-base font-black ${activeClientHealth.text}`}>
                        {activeClientHealth.label} ({activeClientHealth.score}%)
                      </p>
                      <div className="text-[9px] text-[var(--color-text-muted)] space-y-0.5">
                        <span className="block">🔍 Incidentes de Telemetría Activos: <strong className="text-[var(--color-text)] font-semibold">{activeClientHealth.failuresCount}</strong></span>
                        <span className="block">💳 Facturas Pendientes de Conciliación: <strong className="text-[var(--color-text)] font-semibold">{activeClientHealth.billsCount}</strong></span>
                        <span className="block">📞 Última interacción: <strong className="text-[var(--color-text)] font-semibold">{activeClientHealth.lastFollowupDays !== null ? `hace ${activeClientHealth.lastFollowupDays} días` : 'Sin registro'}</strong></span>
                      </div>
                    </div>

                    {/* Progress Circle SVG */}
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-700/30"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={activeClientHealth.ringColor}
                          strokeWidth="3.5"
                          strokeDasharray={`${activeClientHealth.score}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-[var(--color-text)]">
                        {activeClientHealth.score}%
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Bloque Comercial */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Detalles Comerciales</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl">
                      <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Modelo de Cobro</span>
                      <span className="font-bold text-[var(--color-text)] capitalize mt-0.5 block">
                        {selectedClient.comercial?.modeloMonetizacion === 'percentage' ? 'Comisión sobre Ventas' :
                         selectedClient.comercial?.modeloMonetizacion === 'fixed_per_service' ? 'Fijo por Servicio' :
                         selectedClient.comercial?.modeloMonetizacion === 'flat_monthly' ? 'Pago Mensual Fijo' : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl">
                      <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Tasa / Comisión</span>
                      <span className="font-bold text-indigo-400 mt-0.5 block font-mono">
                        {selectedClient.comercial?.modeloMonetizacion === 'percentage' ? `${selectedClient.comercial?.comisionPorcentaje}%` :
                         selectedClient.comercial?.modeloMonetizacion === 'fixed_per_service' ? `$${(selectedClient.comercial?.comisionPorcentaje || 0).toLocaleString('es-CO')}` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl">
                      <span className="text-[8px] uppercase font-bold text(--color-text-muted) block">Setup Inicial Contratado</span>
                      <span className="font-bold text-[var(--color-text)] mt-0.5 block font-mono">
                        ${Number(selectedClient.comercial?.setupValor || 0).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl">
                      <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Fecha de Inicio de Operaciones</span>
                      <span className="font-bold text-[var(--color-text)] mt-0.5 block flex items-center gap-1">
                        <Calendar size={11} className="text-slate-400" />
                        {selectedClient.comercial?.fechaInicio || 'No definida'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Bloque Técnico */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Especificaciones Técnicas</h4>
                  <div className="p-3.5 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] rounded-xl space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                        <Cpu size={12} />
                        ID Proyecto (Slug)
                      </span>
                      <span className="font-mono bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded text-[10px] border border-[var(--color-border)] text-[var(--color-text)]">
                        {selectedClient.tecnico?.projectId || selectedClient.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                        <Globe size={12} />
                        Dominio Hosting
                      </span>
                      {selectedClient.tecnico?.urlHosting ? (
                        <a 
                          href={selectedClient.tecnico.urlHosting} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-mono text-indigo-400 hover:underline hover:text-indigo-300 text-[10px]"
                        >
                          {selectedClient.tecnico.urlHosting.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="italic text-slate-500">Sin dominio asignado</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock size={12} />
                        Versión del Core
                      </span>
                      <span className="font-mono text-[10px] text-[var(--color-text)] font-semibold">
                        v{selectedClient.tecnico?.versionCore || '1.0.0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-t border-[var(--color-border)]/40 pt-2 mt-1">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)]">Token Telemetría</span>
                      <span className="font-mono text-[9px] select-all bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded text-[var(--color-text-muted)] max-w-[200px] truncate border border-[var(--color-border)]">
                        {selectedClientToken}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Historial de Interacciones */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Historial de Interacciones</h4>
                  
                  {/* Timeline list */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {activeClientFollowups.map(follow => (
                      <div key={follow.id} className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold flex items-center gap-1">
                            {follow.type === 'llamada' && '📞 Llamada'}
                            {follow.type === 'whatsapp' && '💬 WhatsApp'}
                            {follow.type === 'correo' && '✉️ Correo'}
                            {follow.type === 'visita' && '🤝 Visita'}
                            {follow.type === 'nota' && '📝 Nota interna'}
                            <span className="text-slate-400 font-normal">por {follow.agent}</span>
                          </span>
                          <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                            {new Date(follow.date).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">
                          {follow.description}
                        </p>
                        {follow.alerts && follow.alerts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {follow.alerts.map((al, idx) => (
                              <span key={idx} className="px-1.5 py-0.2 rounded text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 font-black">
                                🚨 {al}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {activeClientFollowups.length === 0 && (
                      <div className="p-6 text-center text-[var(--color-text-muted)] italic text-xs border border-dashed border-[var(--color-border)] rounded-xl">
                        Ningún seguimiento registrado todavía.
                      </div>
                    )}
                  </div>

                  {/* Formulario de registro rápido */}
                  <form onSubmit={handleAddFollowupSubmit} className="p-3.5 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-2xl space-y-3">
                    <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider block">Registrar Interacción</span>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block">Tipo</label>
                        <CustomSelect
                          value={newFollowup.type}
                          onChange={(val) => setNewFollowup(p => ({ ...p, type: val }))}
                          options={[
                            { id: 'llamada', name: '📞 Llamada' },
                            { id: 'whatsapp', name: '💬 WhatsApp' },
                            { id: 'correo', name: '✉️ Correo' },
                            { id: 'visita', name: '🤝 Visita Presencial' },
                            { id: 'nota', name: '📝 Nota Interna' }
                          ]}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block">Próxima Acción (Opcional)</label>
                        <input
                          type="date"
                          value={newFollowup.nextActionDate}
                          onChange={(e) => setNewFollowup(p => ({ ...p, nextActionDate: e.target.value }))}
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block">Descripción del contacto</label>
                      <textarea
                        rows="2"
                        placeholder="Detalle de lo hablado, acuerdos o incidencias reportadas..."
                        value={newFollowup.description}
                        onChange={(e) => setNewFollowup(p => ({ ...p, description: e.target.value }))}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0 resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block">Alertas / Pendientes (Separados por coma)</label>
                      <input
                        type="text"
                        placeholder="ej. Pendiente Conciliación, Bug de POS, Reclamo Factura"
                        value={newFollowup.alerts}
                        onChange={(e) => setNewFollowup(p => ({ ...p, alerts: e.target.value }))}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={followupLoading}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {followupLoading ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          Guardar Interacción
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
