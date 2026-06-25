import React, { useState, useEffect, useMemo } from 'react';
import { useDevStore } from '../../stores/devStore';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useToast from '../../hooks/useToast';
import { useAlertConfirm } from '../../components/common/AlertConfirmContext';
import { 
  CreditCard, Layers, Search, RefreshCw, MessageSquare, Send, Copy, ChevronDown, Check 
} from 'lucide-react';
import CustomSelect from '../../components/ui/CustomSelect';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function BillingPage() {
  const { 
    reports, 
    setReports, 
    clientesSaas, 
    isSimulated, 
    isLoading, 
    addLog 
  } = useDevStore();
  
  const { showToast } = useToast();
  const { showConfirm } = useAlertConfirm();
  const [isCopied, copy] = useCopyToClipboard();

  // Estados de filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedReport, setSelectedReport] = useState(null);

  // Estados de Gestor de WhatsApp
  const [waTemplates, setWaTemplates] = useState([
    {
      id: 'recordatorio-simple',
      name: 'Recordatorio Simple',
      body: 'Hola *{cliente}*, te informamos que la comisión del periodo *{periodo}* por valor de *${comision}* está pendiente. ¡Gracias por tu atención!'
    },
    {
      id: 'recordatorio-urgente',
      name: 'Recordatorio Urgente',
      body: '⚠️ *{cliente}*, tu saldo de comisión del mes *{periodo}* por *${comision}* aún no ha sido recibido. Por favor regulariza para evitar inconvenientes con el servicio.'
    },
    {
      id: 'confirmacion-pago',
      name: 'Confirmación de Pago Recibido',
      body: '✅ Hola *{cliente}*, confirmamos recibo del pago de comisión correspondiente al periodo *{periodo}* por *${comision}*. ¡Muchas gracias!'
    }
  ]);
  const [selectedWaTemplate, setSelectedWaTemplate] = useState('recordatorio-simple');
  const [waClientId, setWaClientId] = useState('');
  const [waPeriodo, setWaPeriodo] = useState(() => new Date().toISOString().substring(0, 7));
  const [waComision, setWaComision] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingTemplateBody, setEditingTemplateBody] = useState('');

  // Filtrado de reportes
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchSearch = 
        report.clientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.periodo?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = 
        statusFilter === 'todos' || 
        report.estadoPago?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  // Agrupado de clientes para selector de WhatsApp
  const clientAggregated = useMemo(() => {
    const groups = {};
    reports.forEach(r => {
      if (!groups[r.clientId]) {
        groups[r.clientId] = {
          name: r.clientId,
          pendingCount: 0,
          totalSales: 0,
          totalCommission: 0
        };
      }
      if ((r.estadoPago || 'pendiente') === 'pendiente') {
        groups[r.clientId].pendingCount += 1;
        groups[r.clientId].totalCommission += (r.comisionValor || 0);
      }
      groups[r.clientId].totalSales += (r.totalVentas || 0);
    });
    return groups;
  }, [reports]);

  // Toggle estado de pago
  const handleTogglePayment = async (report) => {
    const nuevoEstado = (report.estadoPago || 'pendiente').toLowerCase() === 'pagado' ? 'pendiente' : 'pagado';
    
    const confirmed = await showConfirm({
      title: nuevoEstado === 'pagado' ? 'Aprobar Pago' : 'Marcar como Pendiente',
      message: `¿Estás seguro de que deseas marcar el reporte de ${report.clientId} (${report.periodo}) como ${nuevoEstado.toUpperCase()}?`,
      confirmText: nuevoEstado === 'pagado' ? 'Sí, Aprobar' : 'Sí, Pendiente',
      cancelText: 'Cancelar',
      variant: nuevoEstado === 'pagado' ? 'success' : 'warning'
    });
    
    if (!confirmed) return;

    addLog(`Cambiando estado de pago para ${report.clientId} (${report.periodo}) a ${nuevoEstado.toUpperCase()}...`, "info");
    
    if (isSimulated) {
      setReports(reports.map(r => r.id === report.id ? { 
        ...r, 
        estadoPago: nuevoEstado,
        updatedAt: { toDate: () => new Date() }
      } : r));
      
      if (selectedReport && selectedReport.id === report.id) {
        setSelectedReport({ 
          ...selectedReport, 
          estadoPago: nuevoEstado, 
          updatedAt: { toDate: () => new Date() } 
        });
      }
      addLog(`[Sandbox] Estado de pago actualizado localmente para ${report.clientId}.`, "success");
      showToast(`[Sandbox] Pago actualizado a ${nuevoEstado}`, { type: 'success' });
      return;
    }

    try {
      const docRef = doc(db, 'reportesBilling', report.id);
      await updateDoc(docRef, {
        estadoPago: nuevoEstado,
        updatedAt: serverTimestamp()
      });
      addLog(`[Firestore] Estado de pago guardado para ${report.clientId}.`, "success");
      showToast(`Pago de ${report.clientId} actualizado a ${nuevoEstado}`, { type: 'success' });
    } catch (err) {
      console.error("Error actualizando pago:", err);
      addLog(`Error al guardar estado de pago: ${err.message}`, "error");
      showToast(`Error al actualizar pago: ${err.message}`, { type: 'error' });
    }
  };

  // Obtener preview del mensaje WhatsApp
  const getWaPreview = () => {
    const tmpl = waTemplates.find(t => t.id === selectedWaTemplate);
    if (!tmpl) return '';
    const clientPending = reports
      .filter(r => r.clientId === waClientId && (r.estadoPago || 'pendiente') === 'pendiente')
      .reduce((sum, r) => sum + (r.comisionValor || 0), 0);
    const comVal = waComision || clientPending.toLocaleString('es-CO');
    return tmpl.body
      .replace(/{cliente}/g, waClientId || '{cliente}')
      .replace(/{periodo}/g, waPeriodo || '{periodo}')
      .replace(/{comision}/g, comVal || '{comision}');
  };

  const handleSendWhatsApp = () => {
    const msg = getWaPreview();
    if (!msg.trim()) {
      showToast('Completa los campos del mensaje', { type: 'error' });
      return;
    }
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    showToast('Abriendo WhatsApp con el mensaje...', { type: 'success' });
  };

  const handleCopyWaMessage = () => {
    const msg = getWaPreview();
    copy(msg);
    showToast('Mensaje copiado al portapapeles ✓', { type: 'success' });
  };

  return (
    <div className="space-y-6 tab-content-enter">
      <div>
        <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
          <CreditCard size={20} className="text-emerald-400" />
          Facturación y Cobros
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Consolidado de comisiones, estado de pagos y herramientas de cobro.</p>
      </div>

      {/* Listado de reportes */}
      <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] transition-colors duration-300">
        <div className="p-5 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="font-extrabold text-sm flex items-center gap-2 text-[var(--color-text)]">
            <Layers size={15} className="text-indigo-400" />
            Consolidado Mensual
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2 rounded-xl w-full sm:w-56 shadow-sm focus-within:border-indigo-500/50 transition-all">
              <Search size={13} className="text-slate-500" />
              <input type="text" placeholder="Buscar cliente o periodo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0" />
            </div>
            <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm">
              {['todos', 'pendiente', 'pagado'].map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    statusFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}>{f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : 'Pagados'}
                </button>
              ))}
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-3">
            <RefreshCw size={22} className="mx-auto animate-spin text-indigo-400" />
            <p className="font-semibold uppercase tracking-wider text-[10px]">Cargando datos...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">Ningún reporte coincide con los filtros.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface-2)]/70 font-bold">
                  <th className="p-4 pl-5 uppercase tracking-wider text-[10px]">App Cliente</th>
                  <th className="p-4 uppercase tracking-wider text-[10px]">Periodo</th>
                  <th className="p-4 text-right uppercase tracking-wider text-[10px]">Ventas</th>
                  <th className="p-4 text-center uppercase tracking-wider text-[10px]">Tarifa</th>
                  <th className="p-4 text-right uppercase tracking-wider text-[10px]">Comisión</th>
                  <th className="p-4 text-center uppercase tracking-wider text-[10px]">Estado</th>
                  <th className="p-4 pr-5 text-right uppercase tracking-wider text-[10px]">Transmisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredReports.map(report => (
                  <tr key={report.id} onClick={() => setSelectedReport(report)}
                    className={`hover:bg-[var(--color-surface-2)]/40 transition-colors cursor-pointer group ${
                      selectedReport && selectedReport.id === report.id ? 'bg-[var(--color-surface-2)]/60' : ''
                    }`}>
                    <td className="p-4 pl-5 font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${report.estadoPago === 'pagado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {report.clientId}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[var(--color-text)] opacity-90">{report.periodo}</td>
                    <td className="p-4 text-right font-mono text-[var(--color-text)]">${report.totalVentas.toLocaleString('es-CO')}</td>
                    <td className="p-4 text-center font-bold text-[var(--color-text-muted)]">
                      {(() => {
                        const cfg = clientesSaas.find(c => c.id.toLowerCase() === report.clientId.toLowerCase());
                        const mode = cfg?.billingMode || 'percentage';
                        if (mode === 'fixed_per_service') return `$${(cfg?.montoFijoServicio || 500).toLocaleString('es-CO')} c/u`;
                        if (mode === 'flat_monthly') return `$${((cfg?.pagoMensualFijo || 50000) / 1000).toFixed(0)}k/mes`;
                        return `${report.comisionPorcentaje || cfg?.comisionPorcentaje || 1.5}%`;
                      })()}
                    </td>
                    <td className="p-4 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-300">${report.comisionValor.toLocaleString('es-CO')}</td>
                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleTogglePayment(report)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 mx-auto ${
                          report.estadoPago === 'pagado'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${report.estadoPago === 'pagado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {report.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                      </button>
                    </td>
                    <td className="p-4 pr-5 text-right font-mono text-[10px] text-[var(--color-text-muted)] opacity-80">
                      {report.updatedAt?.toDate ? report.updatedAt.toDate().toLocaleDateString('es-CO') : 'Reciente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GESTOR DE PLANTILLAS WHATSAPP */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] transition-colors duration-300">
        <div className="mb-5">
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Herramienta de Cobro</span>
          <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2 mt-0.5">
            <MessageSquare size={16} className="text-emerald-400" />
            Gestor de Plantillas WhatsApp
          </h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Personaliza y envía recordatorios de cobro con campos dinámicos a tus clientes.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel Izquierdo: Configuración */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Plantilla</label>
              <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl gap-1 flex-wrap">
                {waTemplates.map(t => (
                  <button key={t.id} onClick={() => setSelectedWaTemplate(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      selectedWaTemplate === t.id ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}>{t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Cliente ({'{cliente}'})</label>
                <CustomSelect
                  value={waClientId}
                  onChange={e => setWaClientId(e.target.value)}
                  options={[{ id: '', name: '-- Seleccionar --' }, ...Object.keys(clientAggregated).map(k => ({ id: k, name: k }))]}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Periodo ({'{periodo}'})</label>
                <input type="month" value={waPeriodo} onChange={e => setWaPeriodo(e.target.value)}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-emerald-500 w-full" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Comisión Manual ({'{comision}'}) <span className="font-normal">— Opcional, se auto-calcula si está vacío</span></label>
                <input type="text" placeholder="Ej: 102,750 (dejar vacío para auto-calcular)" value={waComision} onChange={e => setWaComision(e.target.value)}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-emerald-500 w-full font-mono" />
              </div>
            </div>
            {/* Editor de plantilla */}
            {editingTemplate === selectedWaTemplate ? (
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Editar cuerpo de la plantilla</label>
                <textarea rows={4} value={editingTemplateBody} onChange={e => setEditingTemplateBody(e.target.value)}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-emerald-500 w-full resize-none font-mono" />
                <div className="flex gap-2">
                  <button onClick={() => {
                      setWaTemplates(prev => prev.map(t => t.id === editingTemplate ? { ...t, body: editingTemplateBody } : t));
                      setEditingTemplate(null);
                      showToast('Plantilla actualizada', { type: 'success' });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors">Guardar</button>
                  <button onClick={() => setEditingTemplate(null)}
                    className="px-3 py-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl text-[10px] font-bold cursor-pointer border border-[var(--color-border)] transition-colors">Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setEditingTemplate(selectedWaTemplate); setEditingTemplateBody(waTemplates.find(t => t.id === selectedWaTemplate)?.body || ''); }}
                className="text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer underline">
                Editar texto de esta plantilla
              </button>
            )}
          </div>
          {/* Panel Derecho: Preview + Acciones */}
          <div className="space-y-3">
            <div>
              <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block mb-2">Vista Previa del Mensaje</label>
              <div className="bg-[#075E54]/10 border border-[#075E54]/20 rounded-2xl p-4 min-h-[120px] relative">
                <div className="absolute top-3 right-3 w-5 h-5 bg-[#25D366]/20 rounded-full flex items-center justify-center">
                  <MessageSquare size={10} className="text-[#25D366]" />
                </div>
                <p className="text-xs text-[var(--color-text)] leading-relaxed whitespace-pre-wrap font-sans">
                  {getWaPreview() || <span className="text-[var(--color-text-muted)] italic">Selecciona un cliente para ver la vista previa...</span>}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleSendWhatsApp}
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(37,211,102,0.2)]">
                <Send size={13} />
                Abrir en WhatsApp
              </button>
              <button onClick={handleCopyWaMessage}
                className="w-full py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-[var(--color-border)] active:scale-[0.98]">
                <Copy size={13} />
                Copiar Mensaje
              </button>
            </div>
            <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
              <p className="text-[9px] text-[var(--color-text-muted)] font-mono leading-relaxed">
                Variables disponibles: <span className="text-indigo-400">{'{cliente}'}</span> · <span className="text-indigo-400">{'{periodo}'}</span> · <span className="text-indigo-400">{'{comision}'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
