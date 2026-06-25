import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { useAuthStore } from '../../../stores/authStore';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  limit 
} from 'firebase/firestore';
import { provisioningService } from '../../../services/provisioningService';
import ProvisioningStepper from './ProvisioningStepper';
import CustomSelect from '../../ui/CustomSelect';
import useToast from '../../../hooks/useToast';
import { 
  Terminal, ShieldCheck, RefreshCw, XCircle, CheckCircle, 
  Play, StopCircle, RefreshCw as RetryIcon, Calendar, ArrowRight,
  Filter, Search, AlertTriangle, Cpu, Circle, Check 
} from 'lucide-react';

const STATUS_LABELS = {
  pending: 'Pendiente de Aprobación',
  approved: 'Orden Aprobada',
  deploying: 'Desplegando Servidores',
  seeding: 'Sembrando Base',
  testing: 'Control de Calidad (QA)',
  completed: 'Instancia Completada',
  failed: 'Instancia Fallida',
  cancelled: 'Proceso Cancelado'
};

const STATUS_COLORS = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  deploying: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse',
  seeding: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse',
  testing: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

export default function CrmProvisioningView() {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qaReport, setQaReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Suscripción reactiva a todas las órdenes de aprovisionamiento
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'provisioning_orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(list);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching provisioning orders:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 2. Suscripción reactiva a reportes de QA de la orden seleccionada
  useEffect(() => {
    if (!selectedOrder) {
      setQaReport(null);
      return;
    }

    const q = query(
      collection(db, 'qa_reports'),
      where('orderId', '==', selectedOrder.id),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setQaReport(snap.docs[0].data());
      } else {
        setQaReport(null);
      }
    });

    return unsubscribe;
  }, [selectedOrder]);

  // Sincronizar selectedOrder cuando la lista de órdenes cambia (por ejemplo, si cambia su status en segundo plano)
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

  // Acciones de Orquestación
  const handleApprove = async (orderId) => {
    setActionLoading(true);
    try {
      await provisioningService.approveProvisioningOrder(orderId, user);
      showToast('Orden aprobada comercialmente.', { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('Error al aprobar la orden.', { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartDeploy = async (orderId) => {
    setActionLoading(true);
    try {
      await provisioningService.startProvisioning(orderId, user);
      showToast('Proceso de despliegue inicializado.', { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('Error al iniciar el despliegue.', { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    setActionLoading(true);
    try {
      await provisioningService.cancelProvisioning(orderId, user);
      showToast('Aprovisionamiento cancelado correctamente.', { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('Error al cancelar el proceso.', { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async (orderId) => {
    setActionLoading(true);
    try {
      await provisioningService.retryProvisioning(orderId, user);
      showToast('Reintentando despliegue de instancia.', { type: 'success' });
    } catch (err) {
      console.error(err);
      showToast('Error al reintentar despliegue.', { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtrado de órdenes
  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = o.clientId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        o.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* ===== HEADER Y BUSCADORES ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Buscar por ID de cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-surface-2)]/65 border border-[var(--color-border)]/60 rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-medium"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: 'all', name: 'Todos los Estados' },
              { id: 'pending', name: 'Pendientes' },
              { id: 'approved', name: 'Aprobados' },
              { id: 'deploying', name: 'Desplegando' },
              { id: 'completed', name: 'Completados' },
              { id: 'failed', name: 'Fallidos' },
              { id: 'cancelled', name: 'Cancelados' }
            ]}
          />
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          Total: {filteredOrders.length} ordenes registradas
        </span>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs space-y-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
          <RefreshCw size={22} className="mx-auto animate-spin text-indigo-400" />
          <p className="font-semibold uppercase tracking-wider text-[10px]">Cargando consola de aprovisionamiento...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center text-slate-500 text-xs bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
          No se encontraron órdenes de aprovisionamiento registradas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map(order => {
            const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString();
            return (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-5 rounded-2xl border bg-[var(--color-surface)] shadow-md hover:border-indigo-500/30 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-44 ${
                  selectedOrder?.id === order.id ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-[var(--color-border)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono font-medium">Ref: {order.id.substring(0, 8)}</span>
                  </div>

                  <h4 className="text-sm font-black text-slate-200 mt-3 flex items-center gap-1.5 uppercase tracking-wide">
                    🏢 {order.clientId}
                  </h4>
                  
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-1">
                    <Calendar size={12} />
                    <span>Registrada el {dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-border)]/40 pt-3">
                  <span className="text-[10px] font-bold text-slate-400">
                    Aprobación: {order.approved ? '✅ Aprobado' : '⏳ Pendiente'}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                    Inspeccionar <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== SIDE DRAWER PARA DETALLE DE ORDEN ===== */}
      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[600px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between animate-slideLeft">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-200 uppercase tracking-wider">
                Orden de Aprovisionamiento
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">ID: {selectedOrder.id}</p>
            </div>
            <button 
              onClick={() => setSelectedOrder(null)}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 cursor-pointer"
            >
              <XCircle size={16} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left scrollbar-thin">
            {/* Tarjeta de Información General */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950 border border-slate-900 rounded-xl">
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">ID Cliente</span>
                <span className="text-xs font-bold text-slate-300">{selectedOrder.clientId}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Estado Orden</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider inline-block mt-1 ${STATUS_COLORS[selectedOrder.status]}`}>
                  {STATUS_LABELS[selectedOrder.status]}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Propuesta Relacionada</span>
                <span className="text-xs font-bold text-indigo-400 block truncate">{selectedOrder.proposalId}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Aprobado</span>
                <span className="text-xs font-bold text-slate-300 block">{selectedOrder.approved ? 'Sí (Operación Autorizada)' : 'No (Pendiente aprobación)'}</span>
              </div>
            </div>

            {/* Stepper del Pipeline */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flujo de Aprovisionamiento</h4>
              <ProvisioningStepper orderId={selectedOrder.id} orderStatus={selectedOrder.status} />
            </div>

            {/* Reporte de QA (Si está disponible) */}
            {qaReport && (
              <div className="p-5 border border-dashed border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    Reporte del Control de Calidad (QA)
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                    {qaReport.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col justify-center items-center p-3 bg-slate-950 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Puntaje Global</span>
                    <span className="text-xl font-black text-emerald-400 mt-1">{qaReport.score}/100</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {Object.entries(qaReport.checks || {}).map(([check, passed]) => (
                      <div key={check} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">{check}</span>
                        {passed ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">✓ Ok</span>
                        ) : (
                          <span className="text-red-400 font-bold flex items-center gap-0.5">✗ Fallo</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Actions */}
          <div className="p-6 border-t border-slate-800 bg-slate-900 flex gap-3">
            {selectedOrder.status === 'pending' && (
              <button 
                disabled={actionLoading}
                onClick={() => handleApprove(selectedOrder.id)}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle size={14} />
                Aprobar Orden Manualmente
              </button>
            )}

            {selectedOrder.status === 'approved' && (
              <button 
                disabled={actionLoading}
                onClick={() => handleStartDeploy(selectedOrder.id)}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play size={14} />
                Iniciar Aprovisionamiento
              </button>
            )}

            {(selectedOrder.status === 'deploying' || selectedOrder.status === 'seeding' || selectedOrder.status === 'testing') && (
              <button 
                disabled={actionLoading}
                onClick={() => handleCancel(selectedOrder.id)}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-red-950/60 border border-red-500/20 hover:bg-red-900/40 text-red-400 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <StopCircle size={14} />
                Cancelar Aprovisionamiento
              </button>
            )}

            {selectedOrder.status === 'failed' && (
              <button 
                disabled={actionLoading}
                onClick={() => handleRetry(selectedOrder.id)}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={14} />
                Reintentar Proceso Fallido
              </button>
            )}

            {selectedOrder.status === 'completed' && (
              <div className="w-full p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center rounded-xl flex items-center justify-center gap-1.5">
                <CheckCircle size={14} />
                Instancia Activa en Producción
              </div>
            )}

            {selectedOrder.status === 'cancelled' && (
              <div className="w-full p-3 bg-slate-800 text-slate-400 text-xs font-bold text-center rounded-xl">
                Orden Cancelada
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
