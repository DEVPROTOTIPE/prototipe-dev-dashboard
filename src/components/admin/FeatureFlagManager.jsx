import React, { useState, useEffect } from 'react';
import { 
  ToggleRight, 
  Search, 
  Users, 
  History, 
  CheckSquare, 
  XSquare, 
  AlertCircle, 
  Clock, 
  Info 
} from 'lucide-react';
import { doc, getDoc, setDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { CLI_URL } from '../../config';

const CORE_FLAGS = [
  { id: 'creditsEnabled', label: 'Créditos y Fiado', desc: 'Permite a los clientes fiar y abonar deudas mediante un timeline interactivo' },
  { id: 'couponsEnabled', label: 'Cupones de Descuento', desc: 'Sistema de cupones de descuento con confeti animado y validaciones' },
  { id: 'claimsEnabled', label: 'Garantías y Reclamaciones', desc: 'Habilita bandeja técnica para reportar daños y productos defectuosos' },
  { id: 'wholesaleEnabled', label: 'Precios de Mayoreo', desc: 'Descuentos automáticos al sobrepasar topes de cantidad por artículo' },
  { id: 'deliveryEnabled', label: 'Seguimiento de Domicilios', desc: 'Stepper dinámico de 4 estados con geolocalización de mensajeros' },
  { id: 'commissionsEnabled', label: 'Comisiones por Vendedor', desc: 'Cálculo comisional automático por cada ticket de venta concretado' },
  { id: 'enableDianBilling', label: 'Facturación DIAN', desc: 'Módulo de conexión directa para reportes fiscales en caliente' },
  { id: 'reservasEnabled', label: 'Citas y Reservas', desc: 'Agenda interactiva con bloqueo de franjas horarias y asignación de técnicos' },
  { id: 'posExpressScanner', label: 'POS Exprés con Scanner', desc: 'Checkout rápido interpretando eventos de lectores de códigos de barra' },
  { id: 'ordenesTrabajo', label: 'Órdenes de Trabajo', desc: 'Ficha de control de recepción de maquinaria y firmas de conformidad' }
];

export default function FeatureFlagManager({ dbInstance, showToast }) {
  const [clientes, setClientes] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientFlags, setClientFlags] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coresMetadata, setCoresMetadata] = useState({});

  useEffect(() => {
    loadCoresMetadata();
  }, []);

  const loadCoresMetadata = async () => {
    try {
      const res = await fetch(`${CLI_URL}/api/cores/metadata`);
      const data = await res.json();
      if (data.success) {
        setCoresMetadata(data.metadata);
      }
    } catch (err) {
      console.error('Error al cargar metadatos de cores:', err);
    }
  };

  // Historial local / Firestore
  const [historyList, setHistoryList] = useState([]);

  // Confirmación Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    flagId: '',
    flagLabel: '',
    newValue: false
  });

  // Escuchar la lista de clientes comisionales de Firestore
  useEffect(() => {
    if (!dbInstance) return;
    const q = collection(dbInstance, 'clientes_control');
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setClientes(list);
      // Pre-seleccionar el primero si no hay ninguno seleccionado
      if (list.length > 0 && !selectedClientId) {
        handleSelectClient(list[0].id, list);
      }
    });
    return () => unsubscribe();
  }, [dbInstance]);

  const handleSelectClient = async (clientId, list = clientes) => {
    setSelectedClientId(clientId);
    setLoading(true);
    try {
      // 1. Cargar las flags reales del cliente
      const client = list.find(c => c.id === clientId);
      if (client) {
        setClientFlags(client.flags || {});
        // Cargar historial de cambios
        setHistoryList(client.flagHistory || []);
      }
    } catch (err) {
      console.error('Error al cargar flags de cliente:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (flagId, flagLabel, newValue) => {
    setConfirmModal({
      open: true,
      flagId,
      flagLabel,
      newValue
    });
  };

  const handleConfirmChange = async () => {
    const { flagId, flagLabel, newValue } = confirmModal;
    setConfirmModal(prev => ({ ...prev, open: false }));

    const updatedFlags = {
      ...clientFlags,
      [flagId]: newValue
    };

    // Registrar en historial
    const newHistoryItem = {
      flagId,
      flagLabel,
      de: clientFlags[flagId] ? 'Habilitado' : 'Desactivado',
      a: newValue ? 'Habilitado' : 'Desactivado',
      timestamp: new Date().toLocaleString('es-CO')
    };

    const updatedHistory = [newHistoryItem, ...historyList].slice(0, 15);

    try {
      if (!dbInstance) return;
      const clientRef = doc(dbInstance, 'clientes_control', selectedClientId);
      await setDoc(clientRef, {
        flags: updatedFlags,
        flagHistory: updatedHistory
      }, { merge: true });

      setClientFlags(updatedFlags);
      setHistoryList(updatedHistory);
      showToast(`Feature Flag "${flagLabel}" actualizada con éxito ✓`, { type: 'success' });
    } catch (err) {
      showToast(`Error al guardar: ${err.message}`, { type: 'error' });
    }
  };

  const handleBulkAction = async (actionType) => {
    const activeCore = selectedClientData?.template || 'ventas';
    const activeFlags = coresMetadata[activeCore]?.manifest?.featureFlags || CORE_FLAGS;
    activeFlags.forEach(flag => {
      updatedFlags[flag.id] = actionType === 'enable';
    });

    const newHistoryItem = {
      flagId: 'all',
      flagLabel: actionType === 'enable' ? 'Habilitar todas' : 'Desactivar todas',
      de: 'Varios',
      a: actionType === 'enable' ? 'Todos Habilitados' : 'Todos Desactivados',
      timestamp: new Date().toLocaleString('es-CO')
    };

    const updatedHistory = [newHistoryItem, ...historyList].slice(0, 15);

    try {
      if (!dbInstance) return;
      const clientRef = doc(dbInstance, 'clientes_control', selectedClientId);
      await setDoc(clientRef, {
        flags: updatedFlags,
        flagHistory: updatedHistory
      }, { merge: true });

      setClientFlags(updatedFlags);
      setHistoryList(updatedHistory);
      showToast(actionType === 'enable' ? 'Todas las flags habilitadas ✓' : 'Todas las flags desactivadas ✓', { type: 'success' });
    } catch (err) {
      showToast(`Error al guardar: ${err.message}`, { type: 'error' });
    }
  };

  const filteredClientes = clientes.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      (c.nombre || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q) ||
      (c.template || '').toLowerCase().includes(q)
    );
  });

  const selectedClientData = clientes.find(c => c.id === selectedClientId);
  const activeCoreKey = selectedClientData?.template || 'ventas';
  const activeFlagsList = coresMetadata[activeCoreKey]?.manifest?.featureFlags || CORE_FLAGS;

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden text-[var(--color-text)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <ToggleRight className="text-indigo-400 w-6 h-6" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">Feature Flag Manager</h2>
            <span className="text-[10px] text-[var(--color-text-muted)] block font-semibold mt-0.5">Control de Capacidades y Módulos de Clientes en Caliente</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel Izquierdo: Directorio de Clientes (30%) */}
        <div className="w-80 border-r border-[var(--color-border)] overflow-y-auto p-4 space-y-3 bg-[var(--color-bg)]/20">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <input 
              type="text"
              placeholder="Buscar por nombre, ID o core..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-8 py-2 text-xs focus:border-indigo-500 outline-none text-[var(--color-text)] placeholder:text-slate-600 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-[var(--color-text)] transition-colors text-[10px] font-bold leading-none"
              >✕</button>
            )}
          </div>

          {/* Contador */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Clientes Registrados</span>
            <span className="text-[9px] font-bold text-slate-600">
              {filteredClientes.length}/{clientes.length}
            </span>
          </div>

          {/* Lista */}
          <div className="space-y-1">
            {filteredClientes.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-center">
                <Search size={18} className="text-slate-600" />
                <span className="text-[10px] text-slate-500 font-semibold italic leading-relaxed">
                  Sin resultados para<br/>"{searchTerm}"
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2"
                >Limpiar</button>
              </div>
            ) : (
              filteredClientes.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelectClient(c.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                    selectedClientId === c.id
                      ? 'bg-indigo-950/35 border-indigo-500/25 text-indigo-300 [.light_&]:bg-indigo-50 [.light_&]:border-indigo-200 [.light_&]:text-indigo-700 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] text-[var(--color-text-muted)]'
                  }`}
                >
                  <Users size={15} className={`shrink-0 ${selectedClientId === c.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black tracking-wide truncate">{c.nombre}</h4>
                    <span className={`text-[9px] font-semibold block truncate ${
                      selectedClientId === c.id ? 'text-indigo-400/60 [.light_&]:text-indigo-600/70' : 'text-slate-500'
                    }`}>{c.id}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Panel Derecho: Feature Flags Grid (70%) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Cabecera del Cliente Seleccionado */}
            {selectedClientData && (
              <div className="flex justify-between items-center bg-[var(--color-surface-2)]/30 p-5 rounded-2xl border border-[var(--color-border)]">
                <div>
                  <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest block">Instancia Cliente Seleccionada</span>
                  <h3 className="text-base font-black text-[var(--color-text)] mt-0.5">{selectedClientData.nombre}</h3>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">Core Base: {selectedClientData.template || 'template-core-seed'}</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBulkAction('enable')}
                    className="px-3.5 py-2 bg-indigo-950/35 hover:bg-indigo-900/50 border border-indigo-500/10 text-indigo-400 [.light_&]:bg-indigo-50 [.light_&]:hover:bg-indigo-100 [.light_&]:border-indigo-100 [.light_&]:text-indigo-650 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    <CheckSquare size={11} /> Habilitar Todas
                  </button>
                  <button 
                    onClick={() => handleBulkAction('disable')}
                    className="px-3.5 py-2 bg-red-950/20 hover:bg-red-900/35 border border-red-500/10 text-red-400 [.light_&]:bg-red-50 [.light_&]:hover:bg-red-100 [.light_&]:border-red-100 [.light_&]:text-red-600 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    <XSquare size={11} /> Desactivar Todas
                  </button>
                </div>
              </div>
            )}

            {/* Grid de Flags */}
            <div className="grid grid-cols-2 gap-4">
              {activeFlagsList.map(flag => {
                const isActive = !!clientFlags[flag.id];
                return (
                  <div key={flag.id} className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-4 rounded-2xl flex justify-between items-start gap-4 hover:border-[var(--color-border)] transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-600'}`} />
                        <h4 className="text-xs font-black tracking-wide text-[var(--color-text)]">{flag.label}</h4>
                      </div>
                      <p className="text-[9px] text-slate-500 font-semibold leading-relaxed max-w-[220px]">{flag.description || flag.desc}</p>
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => openConfirmModal(flag.id, flag.label, !isActive)}
                      className={`w-12 h-7 rounded-full p-1 transition-all shrink-0 cursor-pointer ${isActive ? 'bg-emerald-600/80 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-slate-750'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-all ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial de Cambios del Cliente */}
          <div className="bg-[var(--color-bg)]/20 border border-[var(--color-border)] p-5 rounded-2xl space-y-3 mt-6">
            <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
              <History size={14} /> Historial de Cambios de Flags
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto text-[10px]">
              {historyList.length === 0 ? (
                <span className="text-slate-500 font-semibold italic block py-2">No se registran cambios recientes de feature flags para esta instancia.</span>
              ) : (
                historyList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[var(--color-bg)]/40 p-2.5 rounded-xl border border-[var(--color-border)]/50">
                    <div className="flex items-center gap-2.5">
                      <Clock size={12} className="text-slate-500" />
                      <span className="font-bold text-[var(--color-text)]">{item.flagLabel}</span>
                      <span className="text-slate-500">→ de: <span className="font-semibold text-[var(--color-text-muted)]">{item.de}</span> a: <span className="font-semibold text-indigo-400">{item.a}</span></span>
                    </div>
                    <span className="text-slate-500 font-bold">{item.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmación Modal */}
      {confirmModal.open && (
        <>
          <div className="fixed inset-0 bg-[var(--color-surface-2)]/30/60 backdrop-blur-xs z-[9998]" onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))} />
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-sm w-full p-6 text-[var(--color-text)] shadow-2xl space-y-4">
              <div className="flex items-center gap-3.5 text-amber-400">
                <AlertCircle size={24} />
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">Confirmación Requerida</h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                ¿Estás seguro de que deseas cambiar el estado de la feature flag 
                <span className="font-bold text-[var(--color-text)]"> "{confirmModal.flagLabel}"</span> a 
                <span className="font-black text-indigo-400"> {confirmModal.newValue ? 'Habilitado' : 'Desactivado'}</span> para este cliente? Esto modificará las capacidades del Core en caliente.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmChange}
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold rounded-xl text-white cursor-pointer"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
