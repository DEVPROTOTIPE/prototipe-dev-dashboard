import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  TrendingUp, Users, CheckCircle, Clock, Calendar, ChevronDown, ChevronLeft, ChevronRight, 
  Database, Download, FileText, BarChart3, Activity, Search, Calculator, DollarSign, Terminal, ArrowUpRight
} from 'lucide-react';
import { useDevStore } from '../../stores/devStore';
import { useAlertConfirm } from '../../components/common/AlertConfirmContext';
import useToast from '../../hooks/useToast';
import GuidedToast from '../../components/ui/GuidedToast';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  exportGeneralMetricsPDF, 
  exportConsolidatedReconciliationPDF, 
  exportClientDetailPDF 
} from '../../services/pdfService';
import { db } from '../../services/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function DevDashboard() {
  const { showConfirm } = useAlertConfirm();
  const { toast, showToast, hideToast } = useToast();

  // Estados globales de Zustand
  const { 
    reports, 
    clientesSaas, 
    failures, 
    logs: systemLogs, 
    addLog, 
    isSimulated, 
    setIsSimulated,
    setReports
  } = useDevStore();

  // Estados locales del Selector de Periodo
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const periodPickerRef = useRef(null);

  // Estados locales de UI
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [activeMetricModal, setActiveMetricModal] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // Simulador de Proyecciones Financieras
  const [projNewClients, setProjNewClients] = useState(0);
  const [projAvgSales, setProjAvgSales] = useState(12000000);
  const [projRate, setProjRate] = useState(1.5);
  const [projMonths, setProjMonths] = useState(12);

  // Filtros del Live Monitor de Telemetría
  const [telemetryTypeFilter, setTelemetryTypeFilter] = useState('todos');
  const [telemetrySearchQuery, setTelemetrySearchQuery] = useState('');
  const [telemetryClientFilter, setTelemetryClientFilter] = useState('todos');
  const [logPage, setLogPage] = useState(1);

  // Manejador del click fuera para cerrar el selector de periodo
  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event) {
      if (periodPickerRef.current && !periodPickerRef.current.contains(event.target)) {
        setIsPeriodPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- CALCULO Y MEMOIZACION DE METRICAS ---

  const filteredPeriodReports = useMemo(() => {
    if (!selectedPeriod) return reports;
    return reports.filter(r => r.periodo === selectedPeriod);
  }, [reports, selectedPeriod]);

  const totalComision = useMemo(() => {
    return filteredPeriodReports.reduce((sum, r) => sum + (r.comisionValor || 0), 0);
  }, [filteredPeriodReports]);

  const totalCobrado = useMemo(() => {
    return filteredPeriodReports.reduce((sum, r) => 
      (r.estadoPago || 'pendiente').toLowerCase() === 'pagado' ? sum + (r.comisionValor || 0) : sum, 0
    );
  }, [filteredPeriodReports]);

  const totalPendiente = useMemo(() => {
    return totalComision - totalCobrado;
  }, [totalComision, totalCobrado]);

  const clientesActivos = useMemo(() => {
    return new Set(filteredPeriodReports.map(r => r.clientId)).size;
  }, [filteredPeriodReports]);

  const clientAggregated = useMemo(() => {
    const initialMap = clientesSaas.reduce((acc, c) => {
      acc[c.id] = {
        name: c.id,
        totalSales: 0,
        totalCommission: 0,
        reportCount: 0,
        pendingCount: 0
      };
      return acc;
    }, {});

    return filteredPeriodReports.reduce((acc, r) => {
      if (!acc[r.clientId]) {
        acc[r.clientId] = {
          name: r.clientId,
          totalSales: 0,
          totalCommission: 0,
          reportCount: 0,
          pendingCount: 0
        };
      }
      acc[r.clientId].totalSales += (r.totalVentas || 0);
      acc[r.clientId].totalCommission += (r.comisionValor || 0);
      acc[r.clientId].reportCount += 1;
      const reportStatus = (r.estadoPago || 'pendiente').toLowerCase();
      if (reportStatus === 'pendiente') {
        acc[r.clientId].pendingCount += 1;
      }
      return acc;
    }, initialMap);
  }, [filteredPeriodReports, clientesSaas]);

  const chartData = useMemo(() => {
    return Object.values(clientAggregated)
      .sort((a, b) => b.totalCommission - a.totalCommission)
      .slice(0, 5);
  }, [clientAggregated]);

  const maxChartValue = useMemo(() => {
    return chartData.length > 0 ? Math.max(...chartData.map(c => c.totalCommission)) : 1;
  }, [chartData]);

  const generalChartData = useMemo(() => {
    const periodMap = reports.reduce((acc, r) => {
      const p = r.periodo || 'N/A';
      if (!acc[p]) {
        acc[p] = { periodo: p, comisiones: 0, ventas: 0, count: 0 };
      }
      acc[p].comisiones += (r.comisionValor || 0);
      acc[p].ventas += (r.totalVentas || 0);
      acc[p].count += 1;
      return acc;
    }, {});

    return Object.values(periodMap)
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [reports]);

  const getClientHistoryData = (clientName) => {
    const clientReports = reports.filter(r => r.clientId.toLowerCase() === clientName.toLowerCase());
    const periodMap = clientReports.reduce((acc, r) => {
      const p = r.periodo || 'N/A';
      if (!acc[p]) {
        acc[p] = { periodo: p, comisiones: 0, ventas: 0 };
      }
      acc[p].comisiones += (r.comisionValor || 0);
      acc[p].ventas += (r.totalVentas || 0);
      return acc;
    }, {});

    return Object.values(periodMap)
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  };

  const formatPeriod = (periodStr) => {
    if (!periodStr || periodStr === 'N/A') return periodStr || '';
    const parts = periodStr.split('-');
    if (parts.length !== 2) return periodStr;
    const year = parts[0].substring(2);
    const monthIndex = parseInt(parts[1]) - 1;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[monthIndex]} ${year}`;
  };

  const getPeriodLabel = (periodStr) => {
    if (!periodStr) return 'Histórico Completo';
    const parts = periodStr.split('-');
    if (parts.length !== 2) return periodStr;
    const [y, m] = parts;
    const monthsFull = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mIndex = parseInt(m, 10) - 1;
    return `${monthsFull[mIndex]}, ${y}`;
  };

  // Proyecciones
  const projExistingMonthly = useMemo(() => {
    return clientesSaas.reduce((sum, c) => {
      const mode = c.billingMode || 'percentage';
      if (mode === 'percentage') {
        const rate = c.comisionPorcentaje !== undefined ? parseFloat(c.comisionPorcentaje) : 1.5;
        return sum + (projAvgSales * rate / 100);
      } else if (mode === 'flat_monthly') {
        return sum + (parseFloat(c.pagoMensualFijo) || 0);
      } else if (mode === 'fixed_per_service') {
        return sum + ((parseFloat(c.montoFijoServicio) || 0) * 12);
      }
      return sum;
    }, 0);
  }, [clientesSaas, projAvgSales]);

  const projNewMonthly = useMemo(() => {
    const count = typeof projNewClients === 'number' ? projNewClients : parseInt(projNewClients) || 0;
    const avgSales = typeof projAvgSales === 'number' ? projAvgSales : parseInt(projAvgSales) || 0;
    const rate = typeof projRate === 'number' ? projRate : parseFloat(projRate) || 0;
    return count * (avgSales * rate / 100);
  }, [projNewClients, projAvgSales, projRate]);

  const projTotalMonthly = useMemo(() => {
    return projExistingMonthly + projNewMonthly;
  }, [projExistingMonthly, projNewMonthly]);

  const projTotalYear = useMemo(() => {
    const months = typeof projMonths === 'number' ? projMonths : parseInt(projMonths) || 1;
    return projTotalMonthly * months;
  }, [projTotalMonthly, projMonths]);

  // BI y Márgenes Netos
  const nicheChartData = useMemo(() => {
    const dataMap = {};
    clientesSaas.forEach(c => {
      const clientReports = filteredPeriodReports.filter(r => r.clientId.toLowerCase() === c.id.toLowerCase());
      const value = clientReports.reduce((sum, r) => sum + (r.comisionValor || 0), 0);
      const nicheLabel = c.niche || 'general';
      dataMap[nicheLabel] = (dataMap[nicheLabel] || 0) + value;
    });
    
    const list = Object.entries(dataMap).map(([niche, val]) => ({
      name: niche.replace('_', ' ').toUpperCase(),
      value: val || 0
    })).filter(item => item.value > 0);
    
    if (list.length === 0) {
      return [
        { name: 'RETAIL CLOTHING', value: 350000 },
        { name: 'TECHNICAL SERVICES', value: 150000 },
        { name: 'REFRIGERATION AC', value: 120000 }
      ];
    }
    return list;
  }, [clientesSaas, filteredPeriodReports]);

  const biMetrics = useMemo(() => {
    let totalDianCost = 0;
    clientesSaas.forEach(c => {
      if (c.enableDianBilling) {
        const clientReports = filteredPeriodReports.filter(r => r.clientId.toLowerCase() === c.id.toLowerCase());
        totalDianCost += clientReports.length * (c.costoPorFacturaDian || 150);
      }
    });
    
    const existingNet = Math.max(totalComision - totalDianCost, 0);
    
    let projectedDianCost = 0;
    clientesSaas.forEach(c => {
      if (c.enableDianBilling) {
        projectedDianCost += 12 * (c.costoPorFacturaDian || 150);
      }
    });
    
    if (projNewClients > 0) {
      projectedDianCost += (projNewClients * 0.5) * 12 * 150;
    }
    
    const projectedNetMonthly = Math.max(projTotalMonthly - projectedDianCost, 0);
    const projectedNetPeriod = projectedNetMonthly * (parseInt(projMonths) || 1);
    
    return {
      existingDianCost: totalDianCost,
      existingNet,
      projectedDianCost,
      projectedNetMonthly,
      projectedNetPeriod
    };
  }, [clientesSaas, filteredPeriodReports, totalComision, projTotalMonthly, projNewClients, projMonths]);

  // Telemetría logs
  const filteredTelemetryLogs = useMemo(() => {
    return systemLogs.filter(log => {
      const matchesClient = telemetryClientFilter === 'todos' || (log.client && log.client.toLowerCase() === telemetryClientFilter.toLowerCase());
      
      let matchesType = true;
      if (telemetryTypeFilter === 'error') {
        matchesType = log.type === 'error';
      } else if (telemetryTypeFilter === 'billing') {
        matchesType = log.type === 'success' && (log.message.includes('facturación') || log.message.includes('cobro') || log.message.includes('Billing') || log.message.includes('reportes'));
      } else if (telemetryTypeFilter === 'info_warning') {
        matchesType = log.type === 'info' || log.type === 'warning';
      }
      
      const queryText = telemetrySearchQuery.toLowerCase();
      const matchesSearch = !queryText || 
        (log.message && log.message.toLowerCase().includes(queryText)) ||
        (log.client && log.client.toLowerCase().includes(queryText)) ||
        (log.type && log.type.toLowerCase().includes(queryText));

      return matchesClient && matchesType && matchesSearch;
    });
  }, [systemLogs, telemetryClientFilter, telemetryTypeFilter, telemetrySearchQuery]);

  // --- HANDLERS ---

  const handleCreateTestReport = async () => {
    const selectedClientObj = clientesSaas.length > 0
      ? clientesSaas[Math.floor(Math.random() * clientesSaas.length)]
      : null;
    const targetClient = selectedClientObj 
      ? selectedClientObj.id 
      : (isSimulated ? 'cliente-simulado-sandbox' : 'ventas-smartfix');
      
    const testPeriod = new Date().toISOString().substring(0, 7);
    const reportId = `${targetClient}_${testPeriod}`;
    const sales = Math.floor(Math.random() * 8000000) + 2000000;
    
    let pct = 1.5;
    let comValue = 0;
    if (selectedClientObj) {
      const mode = selectedClientObj.billingMode || 'percentage';
      if (mode === 'percentage') {
        pct = selectedClientObj.comisionPorcentaje !== undefined ? parseFloat(selectedClientObj.comisionPorcentaje) : 1.5;
        comValue = (sales * pct) / 100;
      } else if (mode === 'flat_monthly') {
        pct = 0;
        comValue = parseFloat(selectedClientObj.pagoMensualFijo) || 50000;
      } else if (mode === 'fixed_per_service') {
        pct = 0;
        comValue = (parseFloat(selectedClientObj.montoFijoServicio) || 500) * 12;
      }
    } else {
      pct = 1.5;
      comValue = (sales * pct) / 100;
    }
    
    addLog(`Generando telemetría de prueba para ${targetClient} ($${sales.toLocaleString()} Ventas, ${pct}%)`, "info", targetClient);

    if (isSimulated) {
      const newRep = {
        id: reportId,
        clientId: targetClient,
        periodo: testPeriod,
        totalVentas: sales,
        comisionPorcentaje: pct,
        comisionValor: comValue,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date() }
      };
      setReports([newRep, ...reports.filter(r => r.id !== reportId)]);
      addLog(`[Sandbox] Reporte simulado insertado correctamente.`, "success", targetClient);
      showToast(`[Sandbox] Telemetría creada para ${targetClient}`, { type: 'success' });
      return;
    }

    try {
      // Registrar en Firestore central real
      const docRef = doc(db, 'reportesBilling', reportId);
      await setDoc(docRef, {
        clientId: targetClient,
        periodo: testPeriod,
        totalVentas: sales,
        comisionPorcentaje: pct,
        comisionValor: comValue,
        estadoPago: 'pendiente',
        updatedAt: serverTimestamp()
      });
      addLog(`[Firestore] Telemetría enviada con éxito a la nube central.`, "success", targetClient);
      showToast(`Telemetría real registrada para ${targetClient}`, { type: 'success' });
    } catch (err) {
      console.error(err);
      addLog(`Error al enviar telemetría: ${err.message}`, "error");
      showToast(`Error al enviar: ${err.message}`, { type: 'error' });
    }
  };

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

  return (
    <div className="space-y-6 tab-content-enter">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5 flex-wrap">
            <BarChart3 size={20} className="text-indigo-400" />
            <span>Dashboard General</span>
            <button 
              onClick={() => { 
                setIsSimulated(!isSimulated); 
                addLog(`Modo: ${!isSimulated ? 'SANDBOX' : 'CONECTADO'}`, 'warning');
              }}
              className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all cursor-pointer select-none active:scale-[0.95] ${
                isSimulated 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
              title="Haz clic para alternar el origen de los datos"
            >
              ● {isSimulated ? 'Modo Sandbox' : 'Conectado a Firestore'}
            </button>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-semibold">Visión consolidada de ingresos y estado del sistema en tiempo real.</p>
        </div>
        <div className="grid grid-cols-1 sm:flex sm:flex-row gap-2 w-full lg:w-auto items-center shrink-0">
          {/* Selector de Periodo Premium */}
          <div ref={periodPickerRef} className="relative w-full sm:w-auto">
            <button 
              onClick={() => setIsPeriodPickerOpen(!isPeriodPickerOpen)}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-between sm:justify-center gap-2 transition-all border active:scale-[0.98] cursor-pointer w-full sm:w-auto ${
                selectedPeriod 
                  ? 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/30' 
                  : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-[var(--color-border)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className={selectedPeriod ? 'text-violet-400' : 'text-indigo-400'} />
                <span>{selectedPeriod ? getPeriodLabel(selectedPeriod) : 'Histórico Completo'}</span>
              </div>
              <ChevronDown size={12} className={`transition-transform duration-200 ${isPeriodPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPeriodPickerOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-950/85 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl shadow-2xl z-50 animate-fade-in space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                  <button 
                    type="button"
                    onClick={() => setPickerYear(prev => prev - 1)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-[var(--color-text)] transition-colors animate-none"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-black text-[var(--color-text)] font-mono tracking-wider">{pickerYear}</span>
                  <button 
                    type="button"
                    onClick={() => setPickerYear(prev => prev + 1)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-[var(--color-text)] transition-colors animate-none"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: '01', label: 'Ene' }, { val: '02', label: 'Feb' }, { val: '03', label: 'Mar' },
                    { val: '04', label: 'Abr' }, { val: '05', label: 'May' }, { val: '06', label: 'Jun' },
                    { val: '07', label: 'Jul' }, { val: '08', label: 'Ago' }, { val: '09', label: 'Sep' },
                    { val: '10', label: 'Oct' }, { val: '11', label: 'Nov' }, { val: '12', label: 'Dic' }
                  ].map(m => {
                    const periodKey = `${pickerYear}-${m.val}`;
                    const isSelected = selectedPeriod === periodKey;
                    const hasData = reports.some(r => r.periodo === periodKey);
                    
                    return (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(periodKey);
                          setIsPeriodPickerOpen(false);
                          addLog(`Periodo filtrado: ${getPeriodLabel(periodKey)}`, 'success');
                        }}
                        className={`py-2 rounded-xl text-[11px] font-bold transition-all relative ${
                          isSelected
                            ? 'bg-violet-600 hover:bg-violet-550 text-white shadow-lg shadow-violet-500/20'
                            : hasData
                              ? 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/[0.05]'
                              : 'bg-transparent hover:bg-white/[0.02] text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {m.label}
                        {hasData && !isSelected && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedPeriod && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(null);
                      setIsPeriodPickerOpen(false);
                      addLog('Filtro de periodo restablecido. Mostrando histórico.', 'info');
                    }}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/[0.05] hover:border-white/[0.1] text-violet-400 hover:text-violet-300 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
                  >
                    Ver Histórico Completo
                  </button>
                )}
              </div>
            )}
          </div>

          <button onClick={handleCreateTestReport}
            className="px-3.5 py-2.5 sm:py-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-[var(--color-border)] active:scale-[0.98] cursor-pointer w-full sm:w-auto">
            <Database size={13} className="text-indigo-400" />
            <span>Test Telemetría</span>
          </button>
          <button onClick={() => {
              exportGeneralMetricsPDF(
                { totalComision, totalCobrado, totalPendiente, clientesActivos },
                chartData,
                { projNewClients, projAvgSales, projRate, projMonths, projExistingMonthly, projTotalMonthly, projTotalYear }
              );
              addLog('Reporte de rendimiento y métricas generales PDF exportado.', 'success');
            }}
            className="px-3.5 py-2.5 sm:py-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-[var(--color-border)] active:scale-[0.98] cursor-pointer w-full sm:w-auto">
            <Download size={13} className="text-indigo-400" />
            <span>Exportar Métricas</span>
          </button>
          <button onClick={() => {
              const period = new Date().toISOString().substring(0, 7);
              exportConsolidatedReconciliationPDF(period, clientesSaas, reports);
              addLog(`Reporte de conciliación PDF exportado para el periodo ${period}.`, 'success');
            }}
            className="px-3.5 py-2.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer border-none shadow-sm shadow-indigo-500/10 w-full sm:w-auto">
            <FileText size={13} />
            <span>Conciliación PDF</span>
          </button>
        </div>
      </div>

      {/* Métricas - Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Comisión Acumulada', val: totalComision, icon: TrendingUp, col: 'from-violet-500/20 to-violet-500/5 dark:from-violet-500/10 dark:to-violet-500/2', iconCol: 'text-violet-600 dark:text-violet-400', type: 'comision' },
          { label: 'Cobrado', val: totalCobrado, icon: CheckCircle, col: 'from-emerald-500/20 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/2', iconCol: 'text-emerald-600 dark:text-emerald-400', type: 'cobrado' },
          { label: 'Por Recaudar', val: totalPendiente, icon: Clock, col: 'from-amber-500/20 to-amber-500/5 dark:from-amber-500/10 dark:to-amber-500/2', iconCol: 'text-amber-600 dark:text-amber-400', type: 'pendiente' },
          { label: 'Clientes Activos', val: clientesActivos, icon: Users, col: 'from-cyan-500/20 to-cyan-500/5 dark:from-cyan-500/10 dark:to-cyan-500/2', iconCol: 'text-cyan-600 dark:text-cyan-400', isNumber: true, type: 'clientes' }
        ].map((card, idx) => (
          <div key={idx} onClick={() => card.type === 'clientes' ? window.location.assign('/crm') : setActiveMetricModal(card.type)}
            className={`p-5 bg-gradient-to-br ${card.col} bg-[var(--color-surface)] rounded-2xl flex flex-col gap-2 shadow-sm relative overflow-hidden group active:scale-[0.98] cursor-pointer border border-[var(--color-border)] hover-glow-card`}>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-tight">{card.label}</span>
              <div className={`p-1.5 rounded-lg bg-[var(--color-bg)] ${card.iconCol}`}>
                <card.icon size={14} />
              </div>
            </div>
            <p className="text-2xl font-extrabold mt-2 tracking-tight text-[var(--color-text)]">
              {card.isNumber ? card.val : `$${card.val.toLocaleString('es-CO')}`}
            </p>
          </div>
        ))}
      </div>

      {/* Charts + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Gráfico de barras */}
        <div className="lg:col-span-2 bg-[var(--color-surface)] p-6 rounded-2xl flex flex-col shadow-sm relative overflow-hidden transition-colors duration-300 border border-[var(--color-border)]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/3 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">Métricas</span>
              <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2">
                <BarChart3 size={16} className="text-violet-600 dark:text-violet-400" />
                Comisiones Generales
              </h3>
            </div>
            {selectedPeriod && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-violet-500/10 text-violet-400 border border-violet-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                Filtrado: {formatPeriod(selectedPeriod)}
              </div>
            )}
          </div>

          {/* Gráfico General Consolidado */}
          {generalChartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-500 text-xs">Sin datos consolidados.</div>
          ) : (
            <div className="h-[220px] w-full mb-6 relative">
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <AreaChart data={generalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGeneralComisiones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorGeneralVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.05}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="periodo" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatPeriod}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${val.toLocaleString('es-CO', { notation: 'compact' })}`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950/90 backdrop-blur-md border border-white/[0.08] p-3 rounded-2xl shadow-2xl text-left text-[10px] space-y-1">
                            <p className="font-extrabold text-[var(--color-text)] uppercase">{formatPeriod(data.periodo)}</p>
                            <p className="text-violet-400 font-semibold">Comisión: <span className="font-bold font-mono">${data.comisiones.toLocaleString('es-CO')}</span></p>
                            <p className="text-cyan-400 font-semibold">Ventas: <span className="font-bold font-mono">${data.ventas.toLocaleString('es-CO')}</span></p>
                            <p className="text-[var(--color-text-muted)] text-[8px]">{data.count} reportes en este mes</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="ventas" stroke="#0ea5e9" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorGeneralVentas)" name="Ventas" />
                  <Area type="monotone" dataKey="comisiones" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGeneralComisiones)" name="Comisiones" />
                  {selectedPeriod && (
                    <ReferenceLine 
                      x={selectedPeriod} 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      strokeDasharray="4 4" 
                      strokeOpacity={0.6}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Divisor */}
          <div className="flex items-center gap-2 border-t border-[var(--color-border)]/50 pt-5 pb-3">
            <span className="text-[10px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-none">Desglose por Cliente</span>
            <div className="h-px bg-[var(--color-border)]/30 flex-1" />
          </div>

          {chartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-500 text-xs font-semibold">Sin datos suficientes.</div>
          ) : (
            <div className="space-y-3">
              {chartData.map((client, idx) => {
                const isExpanded = expandedClientId === client.name;
                const clientHistory = getClientHistoryData(client.name);
                const colorSet = [
                  { text: 'text-violet-650 dark:text-violet-400', bg: 'bg-violet-500/10', bar: 'bg-violet-500', stroke: '#8b5cf6' },
                  { text: 'text-cyan-650 dark:text-cyan-400', bg: 'bg-cyan-500/10', bar: 'bg-cyan-500', stroke: '#0ea5e9' },
                  { text: 'text-emerald-650 dark:text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', stroke: '#10b981' },
                  { text: 'text-amber-650 dark:text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500', stroke: '#f59e0b' },
                  { text: 'text-pink-650 dark:text-pink-400', bg: 'bg-pink-500/10', bar: 'bg-pink-500', stroke: '#ec4899' }
                ][idx % 5];
                
                const clientCfg = clientesSaas.find(c => c.id.toLowerCase() === client.name.toLowerCase()) || {};
                const billingText = clientCfg.billingMode === 'percentage' 
                  ? `${clientCfg.comisionPorcentaje || 1.5}% Ventas` 
                  : clientCfg.billingMode === 'flat_monthly' 
                    ? `$${(clientCfg.pagoMensualFijo || 50000).toLocaleString('es-CO')} / Mes` 
                    : `$${(clientCfg.montoFijoServicio || 500).toLocaleString('es-CO')} / Serv`;

                return (
                  <div key={client.name} 
                    className={`p-3 bg-[var(--color-surface-2)]/25 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col ${
                      isExpanded 
                        ? 'border-violet-500/40 bg-[var(--color-surface-2)]/60' 
                        : 'border-[var(--color-border)]/50 hover:bg-[var(--color-surface-2)]/50'
                    }`}
                  >
                    <div 
                      onClick={() => setExpandedClientId(isExpanded ? null : client.name)}
                      className="flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <div className={`w-8 h-8 rounded-xl ${colorSet.bg} ${colorSet.text} font-black flex items-center justify-center text-xs shrink-0 border border-current/10`}>
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-[var(--color-text)] truncate max-w-[100px]" title={client.name}>{client.name}</h4>
                          <p className="text-[9px] text-[var(--color-text-muted)] font-bold">{client.reportCount} reportes</p>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1 hidden sm:block px-4">
                        <div className="flex items-center justify-between text-[9px] text-[var(--color-text-muted)]">
                          <span className="font-bold">Ventas Brutas</span>
                          <span className="font-mono font-bold">${client.totalSales.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="h-1 bg-[var(--color-bg)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ease-out ${colorSet.bar}`} style={{ width: `${Math.max((client.totalCommission / maxChartValue) * 100, 3)}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right min-w-[90px] justify-end">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block leading-none">Comisión</span>
                          <span className={`text-xs font-black font-mono mt-0.5 block ${colorSet.text}`}>${client.totalCommission.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {client.pendingCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">{client.pendingCount} pend.</span>
                          )}
                          <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-violet-400' : ''}`} />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-[var(--color-border)]/40 mt-3 space-y-4">
                            {clientHistory.length === 0 ? (
                              <p className="text-[9px] text-[var(--color-text-muted)] italic text-center py-4 font-semibold">Sin datos de tendencia suficientes para este cliente.</p>
                            ) : (
                              <div className="h-28 w-full">
                                <ResponsiveContainer width="100%" height={112} minWidth={0}>
                                  <AreaChart data={clientHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id={`colorClientComisiones-${client.name}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colorSet.stroke} stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor={colorSet.stroke} stopOpacity={0.0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                    <XAxis dataKey="periodo" stroke="rgba(255,255,255,0.15)" fontSize={8} tickLine={false} tickFormatter={formatPeriod} />
                                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={8} tickLine={false} tickFormatter={(val) => `$${val.toLocaleString('es-CO', { notation: 'compact' })}`} />
                                    <Tooltip 
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                          const data = payload[0].payload;
                                          return (
                                            <div className="bg-slate-950/90 backdrop-blur-md border border-white/[0.08] p-2.5 rounded-xl shadow-2xl text-left text-[9px] space-y-0.5">
                                              <p className="font-extrabold text-[var(--color-text)]">{formatPeriod(data.periodo)}</p>
                                              <p className={`${colorSet.text}`}>Comisión: <span className="font-bold font-mono">${data.comisiones.toLocaleString('es-CO')}</span></p>
                                              <p className="text-slate-400">Ventas: <span className="font-bold font-mono">${data.ventas.toLocaleString('es-CO')}</span></p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Area type="monotone" dataKey="comisiones" stroke={colorSet.stroke} strokeWidth={2} fillOpacity={1} fill={`url(#colorClientComisiones-${client.name})`} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] bg-[var(--color-surface)]/45 p-2.5 rounded-xl border border-[var(--color-border)]/40">
                              <div>
                                <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-extrabold block">Esquema Facturación</span>
                                <span className="font-black text-[var(--color-text)] block mt-0.5">{billingText}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-extrabold block">Nicho de Negocio</span>
                                <span className="font-black text-[var(--color-text)] block mt-0.5 capitalize">{(clientCfg.niche || 'N/A').replace('_', ' ')}</span>
                              </div>
                              <div className="flex items-center gap-1.5 justify-end">
                                <button 
                                  onClick={() => {
                                    const clientFailures = failures.filter(f => f.clientId.toLowerCase() === client.name.toLowerCase());
                                    exportClientDetailPDF(client.name, clientCfg, reports.filter(r => r.clientId.toLowerCase() === client.name.toLowerCase()), clientFailures);
                                    addLog(`Ficha PDF de cliente ${client.name} descargada.`, 'success');
                                  }}
                                  className="p-1.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 border border-slate-500/20 rounded-lg cursor-pointer transition-all active:scale-95"
                                  title="Exportar Reporte Ficha PDF"
                                >
                                  <Download size={11} />
                                </button>
                                <button 
                                  onClick={() => {
                                    window.location.assign(`/crm?clientId=${encodeURIComponent(client.name)}`);
                                  }}
                                  className="px-2.5 py-1 bg-violet-650 hover:bg-violet-600 text-white rounded-lg text-[9px] font-extrabold cursor-pointer active:scale-95 transition-all shadow-sm border-none"
                                >
                                  Gestionar CRM
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Radar de Salud + Telemetría */}
        <div className="space-y-5">
          {/* Radar de Salud de Instancias */}
          <div className="bg-[var(--color-surface)] p-5 rounded-2xl flex flex-col shadow-sm relative overflow-hidden transition-colors duration-300 border border-[var(--color-border)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-1 mb-4">
              <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Health Radar</span>
              <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2">
                <Activity size={16} className="text-indigo-655 dark:text-indigo-400" />
                Radar de Salud de Instancias
              </h3>
            </div>
            
            <div className="space-y-2.5">
              {clientesSaas.map(client => {
                const failuresCount = failures.filter(f => f.clientId.toLowerCase() === client.id.toLowerCase() && !f.resolved).length;
                
                let latency = 80 + (client.id.length * 17) % 180;
                let lastSeenText = 'en línea';
                let status = 'green';
                
                if (failuresCount > 0) {
                  status = 'red';
                  latency = 4200 + (failuresCount * 450);
                  lastSeenText = `hace ${5 + (client.id.length % 10)}s (Error)`;
                } else if (client.id === 'tienda-calzado-x') {
                  status = 'yellow';
                  latency = 3150;
                  lastSeenText = 'hace 18 min';
                } else if (client.id === 'restaurante-gourmet') {
                  latency = 95;
                  lastSeenText = 'hace 3 min';
                } else {
                  lastSeenText = 'en línea';
                }

                return (
                  <div 
                    key={client.id}
                    onClick={() => {
                      if (status === 'red') {
                        window.location.assign('/errors');
                      }
                    }}
                    className={`p-2.5 bg-[var(--color-surface-2)]/20 hover:bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/50 rounded-xl flex items-center justify-between gap-3 transition-all duration-200 ${
                      status === 'red' ? 'cursor-pointer hover:border-red-500/35 hover:shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-2 w-2 relative shrink-0">
                        {status === 'red' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                        {status === 'yellow' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'red' ? 'bg-red-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      </span>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-[var(--color-text)] truncate block font-mono">{client.id}</span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-bold block leading-none mt-0.5">{lastSeenText}</span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)]">{latency} ms</span>
                      {failuresCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] font-black border border-red-500/20">
                          {failuresCount} err
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consola de Telemetría */}
          <div className="bg-[var(--color-surface)] rounded-2xl flex flex-col shadow-sm transition-colors duration-300 border border-[var(--color-border)] overflow-hidden">
            <div className="bg-[var(--color-surface-2)]/60 px-4 py-2 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/85 block" />
                <span className="w-2 h-2 rounded-full bg-amber-500/85 block" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/85 block" />
              </div>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider">telemetry_monitor.sh</span>
              <span className="w-6" />
            </div>
            
            <div className="p-5 flex flex-col flex-1 gap-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">Live Monitor</span>
                  <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2">
                    <Activity size={16} className="text-violet-400 animate-pulse" />
                    Telemetría
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 shrink-0" />
                  <span className="truncate font-semibold text-[var(--color-text-muted)]">
                    {isSimulated ? 'Sandbox' : 'Firestore'}
                  </span>
                </div>
                <div className="p-2 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="truncate font-semibold text-[var(--color-text-muted)] uppercase">
                    {telemetryTypeFilter === 'todos' ? 'Todos' : telemetryTypeFilter}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex bg-[var(--color-surface-2)]/60 p-0.5 rounded-xl border border-[var(--color-border)] justify-between">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'error', label: 'Fallas' },
                    { id: 'billing', label: 'Cobros' },
                    { id: 'info_warning', label: 'Sistema' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTelemetryTypeFilter(t.id); setLogPage(1); }}
                      className={`flex-1 text-center py-1 rounded-lg text-[8px] font-bold transition-all cursor-pointer border-none ${
                        telemetryTypeFilter === t.id 
                          ? 'bg-indigo-650 text-white shadow-sm' 
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 bg-transparent'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar en logs..." 
                    value={telemetrySearchQuery}
                    onChange={(e) => { setTelemetrySearchQuery(e.target.value); setLogPage(1); }}
                    className="h-7 pl-7 pr-6 w-full bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] text-[9px] text-[var(--color-text)] placeholder-[var(--color-text-muted)]/60 rounded-xl focus:outline-none focus:border-indigo-500/70 focus:bg-[var(--color-surface)] transition-all font-semibold"
                  />
                  <Search size={10} className="absolute left-2.5 top-2 text-[var(--color-text-muted)]" />
                  {telemetrySearchQuery && (
                    <button 
                      onClick={() => setTelemetrySearchQuery('')}
                      className="absolute right-2 top-1.5 text-[8px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer bg-transparent border-none"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {telemetryClientFilter !== 'todos' && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full self-start">
                  <span className="text-[8px] font-bold uppercase text-indigo-400">Cliente:</span>
                  <span className="text-[8px] font-extrabold text-[var(--color-text)] font-mono truncate max-w-[90px]">{telemetryClientFilter}</span>
                  <button 
                    onClick={() => setTelemetryClientFilter('todos')}
                    className="text-[7px] text-indigo-300 hover:text-white ml-1 font-bold cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 h-[240px] overflow-y-auto scrollbar-thin flex flex-col gap-2">
                {filteredTelemetryLogs.length === 0 ? (
                  <div className="text-[var(--color-text-muted)] italic text-xs text-center my-auto flex flex-col items-center justify-center gap-1 select-none font-semibold">
                    <Activity size={18} className="text-slate-655 dark:text-slate-700 animate-pulse mb-1" />
                    <span>Sin transmisiones registradas</span>
                    <span className="text-[8px] text-slate-500 font-bold">Prueba cambiando los filtros</span>
                  </div>
                ) : (
                  (() => {
                    const LOGS_PER_PAGE = 5;
                    const totalLogPages = Math.ceil(filteredTelemetryLogs.length / LOGS_PER_PAGE) || 1;
                    const currentPage = Math.min(logPage, totalLogPages);
                    const paginatedLogs = filteredTelemetryLogs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE);
                    return paginatedLogs.map((log, index) => {
                      const isClickable = log.type === 'error';
                      const hoverStyle = isClickable ? 'cursor-pointer hover:bg-red-500/10 active:scale-[0.99] transition-all' : '';
                      const cardStyle = { 
                        info: 'bg-[var(--color-surface-2)]/45 text-[var(--color-text-muted)] border-[var(--color-border)]', 
                        warning: 'bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20', 
                        error: 'bg-red-500/5 text-red-700 dark:text-red-400 border-red-500/20', 
                        success: 'bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                      }[log.type];
                      const badgeStyle = { 
                        info: 'bg-slate-500/10 text-slate-500 dark:text-slate-400', 
                        warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', 
                        error: 'bg-red-500/10 text-red-600 dark:text-red-400', 
                        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      }[log.type];
                      const label = { info: 'INFO', warning: 'WARN', error: 'ERR', success: 'OK' }[log.type];
                      
                      return (
                        <div 
                          key={index} 
                          onClick={isClickable ? () => window.location.assign('/errors') : undefined}
                          className={`p-2 rounded-xl border ${cardStyle} ${hoverStyle} text-[9px] flex flex-col gap-1`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className={`px-1 py-0.5 rounded text-[7px] font-bold ${badgeStyle}`}>{label}</span>
                              {log.client && (
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTelemetryClientFilter(log.client);
                                  }}
                                  className="px-1 py-0.2 bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:text-indigo-400 rounded text-[7px] font-mono cursor-pointer"
                                >
                                  {log.client}
                                </span>
                              )}
                            </div>
                            <span className="text-[7.5px] text-[var(--color-text-muted)] font-bold font-mono">{log.timestamp}</span>
                          </div>
                          <p className="font-mono leading-relaxed break-words pl-0.5 font-bold">
                            {log.message}
                            {index === 0 && <span className="w-1.5 h-3 bg-violet-400 animate-cursor-blink inline-block ml-1" />}
                          </p>
                        </div>
                      );
                    });
                  })()
                )}
              </div>

              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                <button 
                  onClick={() => { useDevStore.setState({ logs: [] }); setLogPage(1); }} 
                  className="text-[9px] font-bold text-slate-500 hover:text-slate-400 transition-colors cursor-pointer bg-transparent border-none"
                >
                  Limpiar
                </button>
                {filteredTelemetryLogs.length > 5 && (
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <button 
                      disabled={logPage === 1} 
                      onClick={() => setLogPage(p => Math.max(p - 1, 1))} 
                      className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] disabled:opacity-30 cursor-pointer font-bold"
                    >
                      ◀
                    </button>
                    <span className="font-mono text-[8.5px] text-[var(--color-text-muted)] font-bold">
                      {logPage}/{Math.ceil(filteredTelemetryLogs.length / 5)}
                    </span>
                    <button 
                      disabled={logPage >= Math.ceil(filteredTelemetryLogs.length / 5)} 
                      onClick={() => setLogPage(p => p + 1)} 
                      className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] disabled:opacity-30 cursor-pointer font-bold"
                    >
                      ▶
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULADOR DE PROYECCIONES DE INGRESOS */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] transition-colors duration-300">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Herramienta Financiera</span>
            <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2 mt-0.5">
              <Calculator size={16} className="text-indigo-400" />
              Simulador de Proyecciones de Ingresos
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-semibold">Proyecta tu crecimiento añadiendo nuevas tiendas sobre la base actual de clientes.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold text-[var(--color-text-muted)] block">Nuevas Tiendas a Añadir</label>
            <input type="number" min="0" value={projNewClients === 0 ? '' : projNewClients} onChange={e => setProjNewClients(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 w-full font-mono font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold text-[var(--color-text-muted)] block">Ventas Promedio/Tienda ($)</label>
            <input type="number" min="0" step="500000" value={projAvgSales === 0 ? '' : projAvgSales} onChange={e => setProjAvgSales(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 w-full font-mono font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold text-[var(--color-text-muted)] block">Tasa Nuevas Tiendas (%)</label>
            <input type="number" min="0" step="0.1" value={projRate === 0 ? '' : projRate} onChange={e => setProjRate(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 w-full font-mono font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold text-[var(--color-text-muted)] block">Horizonte (Meses)</label>
            <input type="number" min="1" max="60" value={projMonths === 0 ? '' : projMonths} onChange={e => setProjMonths(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 w-full font-mono font-bold" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-[var(--color-text-muted)] block">Ingresos Actuales / Mes</span>
            <p className="text-lg font-black font-mono text-[var(--color-text)] mt-1">${projExistingMonthly.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            <p className="text-[9px] text-[var(--color-text-muted)] font-bold">{clientesSaas.length} clientes activos</p>
          </div>
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-xl">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-indigo-400 block">Proyección Total / Mes</span>
            <p className="text-lg font-black font-mono text-indigo-400 mt-1">${projTotalMonthly.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            <p className="text-[9px] text-indigo-400/70 font-bold">+{projNewClients} tiendas nuevas</p>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-400 block">Proyección {projMonths} Meses</span>
            <p className="text-lg font-black font-mono text-emerald-400 mt-1">${projTotalYear.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            <p className="text-[9px] text-emerald-400/70 font-bold">Acumulado total estimado</p>
          </div>
        </div>

        {/* Inteligencia de Negocios (BI) */}
        <div className="border-t border-[var(--color-border)]/50 pt-5 mt-6 flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="flex-1 min-w-[280px] bg-[var(--color-surface-2)]/25 border border-[var(--color-border)]/45 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5 mb-3 font-sans">
                <TrendingUp size={12} className="text-violet-400" />
                Rentabilidad por Nicho (Participación)
              </h4>
              <div className="h-[160px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={160} minWidth={0}>
                  <PieChart>
                    <Pie
                      data={nicheChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {nicheChartData.map((entry, index) => {
                        const colors = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-950/95 backdrop-blur-md border border-white/[0.08] p-2 rounded-xl text-[9px] text-left">
                              <p className="font-extrabold text-[var(--color-text)] uppercase">{data.name}</p>
                              <p className="text-indigo-400 font-bold font-mono">${data.value.toLocaleString('es-CO')}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-extrabold">Total</span>
                  <span className="text-xs font-black font-mono text-[var(--color-text)]">${nicheChartData.reduce((sum, d) => sum + d.value, 0).toLocaleString('es-CO', { notation: 'compact' })}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
              {nicheChartData.slice(0, 4).map((entry, index) => {
                const colors = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
                return (
                  <div key={index} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
                    <span className="text-[7.5px] uppercase font-bold text-[var(--color-text-muted)] font-mono max-w-[80px] truncate">{entry.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-[280px] bg-[var(--color-surface-2)]/25 border border-[var(--color-border)]/45 p-4 rounded-xl flex flex-col justify-between font-mono text-[10px]">
            <div>
              <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5 mb-3 font-sans">
                <DollarSign size={12} className="text-emerald-400" />
                Eficiencia Financiera (Márgenes Netos)
              </h4>
              <p className="text-[8px] text-[var(--color-text-muted)] font-bold leading-relaxed mb-4 font-sans">
                Costo DIAN restado de la facturación comisional ($150 COP por reporte emitido con DIAN activo).
              </p>
              
              <div className="space-y-2.5 font-bold">
                <div className="flex justify-between items-center text-[10px] border-b border-[var(--color-border)]/40 pb-2">
                  <span className="text-[9px] text-[var(--color-text-muted)] font-sans">Costo DIAN Histórico</span>
                  <span className="font-bold text-red-400">-${biMetrics.existingDianCost.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-b border-[var(--color-border)]/40 pb-2">
                  <span className="text-[9px] text-[var(--color-text-muted)] font-sans">Margen Neto Histórico</span>
                  <span className="font-black text-emerald-400">${biMetrics.existingNet.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-b border-[var(--color-border)]/40 pb-2">
                  <span className="text-[9px] text-[var(--color-text-muted)] font-sans">Costo DIAN Proyectado / Mes</span>
                  <span className="font-bold text-red-400">-${biMetrics.projectedDianCost.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-b border-[var(--color-border)]/40 pb-2">
                  <span className="text-[9px] text-[var(--color-text-muted)] font-sans">Margen Neto Proyectado / Mes</span>
                  <span className="font-black text-emerald-400">${biMetrics.projectedNetMonthly.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] pt-1">
                  <span className="text-[9px] font-black text-indigo-400 font-sans">Acumulado Neto Proyectado ({projMonths}m)</span>
                  <span className="font-black text-indigo-400">${biMetrics.projectedNetPeriod.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL DE DETALLE DE COMISION ACUMULADA ===== */}
      {mounted && activeMetricModal === 'comision' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-violet-500" size={18} />
                <h3 className="font-extrabold text-sm uppercase text-[var(--color-text)] tracking-wider">
                  Detalle de Comisiones Acumuladas
                </h3>
              </div>
              <button 
                onClick={() => setActiveMetricModal(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]/50 rounded-2xl p-4 space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Aportes por Cliente</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {chartData.map((client, idx) => {
                  const pct = totalComision > 0 ? ((client.totalCommission / totalComision) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={idx} className="p-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)]/40 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-[var(--color-text-muted)] truncate block">{client.name}</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xs font-black font-mono text-violet-400">${client.totalCommission.toLocaleString('es-CO')}</span>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-mono font-bold">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Historial de Transacciones</h4>
                <button
                  onClick={() => {
                    exportGeneralMetricsPDF({ totalComision, totalCobrado, totalPendiente, clientesActivos }, chartData, { projExistingMonthly, projTotalMonthly, projTotalYear });
                    addLog('Reporte general de métricas exportado a PDF.', 'success');
                  }}
                  className="px-2.5 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/30 text-violet-400 text-[9px] font-bold rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                >
                  <Download size={10} />
                  Exportar PDF
                </button>
              </div>

              <div className="overflow-x-auto border border-[var(--color-border)] rounded-2xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-b border-[var(--color-border)] font-bold text-[8px] uppercase tracking-wider">
                      <th className="p-3">Periodo</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3 text-right">Venta Bruta</th>
                      <th className="p-3 text-right">Comisión</th>
                      <th className="p-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]/40 font-mono text-[9px] text-[var(--color-text-muted)] font-bold">
                    {filteredPeriodReports.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[var(--color-surface-2)]/20 transition-all">
                        <td className="p-3 font-sans font-bold text-[var(--color-text)]">{formatPeriod(r.periodo)}</td>
                        <td className="p-3 font-sans text-[var(--color-text)] font-semibold">{r.clientId}</td>
                        <td className="p-3 text-right">${Number(r.totalVentas || 0).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-right text-violet-400 font-bold">${Number(r.comisionValor || 0).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            r.estadoPago === 'pagado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {r.estadoPago || 'pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--color-border)]">
              <button 
                onClick={() => setActiveMetricModal(null)}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ===== MODAL DE DETALLE DE COMISION COBRADA ===== */}
      {mounted && activeMetricModal === 'cobrado' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={18} />
                <h3 className="font-extrabold text-sm uppercase text-[var(--color-text)] tracking-wider">
                  Detalle de Comisiones Cobradas
                </h3>
              </div>
              <button 
                onClick={() => setActiveMetricModal(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Comisiones Recaudadas (Pagadas)</h4>
                <span className="text-xs font-black font-mono text-emerald-400">Total: ${totalCobrado.toLocaleString('es-CO')}</span>
              </div>

              <div className="overflow-x-auto border border-[var(--color-border)] rounded-2xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-b border-[var(--color-border)] font-bold text-[8px] uppercase tracking-wider">
                      <th className="p-3">Periodo</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3 text-right">Venta Bruta</th>
                      <th className="p-3 text-right">Comisión</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]/40 font-mono text-[9px] text-[var(--color-text-muted)] font-bold">
                    {filteredPeriodReports.filter(r => r.estadoPago === 'pagado').map((r, idx) => (
                      <tr key={idx} className="hover:bg-[var(--color-surface-2)]/20 transition-all">
                        <td className="p-3 font-sans font-bold text-[var(--color-text)]">{formatPeriod(r.periodo)}</td>
                        <td className="p-3 font-sans text-[var(--color-text)] font-semibold">{r.clientId}</td>
                        <td className="p-3 text-right">${Number(r.totalVentas || 0).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">${Number(r.comisionValor || 0).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleTogglePayment(r)}
                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[8px] font-bold rounded cursor-pointer border border-amber-500/10 active:scale-95 transition-all"
                          >
                            Revertir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredPeriodReports.filter(r => r.estadoPago === 'pagado').length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-xs text-[var(--color-text-muted)] italic font-sans font-semibold">
                          No se han registrado comisiones cobradas en este periodo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--color-border)]">
              <button 
                onClick={() => setActiveMetricModal(null)}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ===== MODAL DE DETALLE DE COMISION PENDIENTE ===== */}
      {mounted && activeMetricModal === 'pendiente' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="text-amber-550 dark:text-amber-400" size={18} />
                <h3 className="font-extrabold text-sm uppercase text-[var(--color-text)] tracking-wider">
                  Detalle de Comisiones Pendientes
                </h3>
              </div>
              <button 
                onClick={() => setActiveMetricModal(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Cuentas por Cobrar</h4>
                <span className="text-xs font-black font-mono text-amber-500">Total: ${totalPendiente.toLocaleString('es-CO')}</span>
              </div>

              <div className="overflow-x-auto border border-[var(--color-border)] rounded-2xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-b border-[var(--color-border)] font-bold text-[8px] uppercase tracking-wider">
                      <th className="p-3">Periodo</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3 text-right">Venta Bruta</th>
                      <th className="p-3 text-right">Comisión</th>
                      <th className="p-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]/40 font-mono text-[9px] text-[var(--color-text-muted)] font-bold">
                    {filteredPeriodReports.filter(r => r.estadoPago !== 'pagado').map((r, idx) => (
                      <tr key={idx} className="hover:bg-[var(--color-surface-2)]/20 transition-all">
                        <td className="p-3 font-sans font-bold text-[var(--color-text)]">{formatPeriod(r.periodo)}</td>
                        <td className="p-3 font-sans text-[var(--color-text)] font-semibold">{r.clientId}</td>
                        <td className="p-3 text-right">${Number(r.totalVentas || 0).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-right text-amber-500 font-bold">${Number(r.comisionValor || 0).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-center flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setActiveMetricModal(null);
                              window.location.assign(`/crm?clientId=${encodeURIComponent(r.clientId)}`);
                            }}
                            className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[8px] font-bold rounded cursor-pointer border border-indigo-500/10 active:scale-95 transition-all"
                          >
                            Gestionar CRM
                          </button>
                          <button
                            onClick={() => handleTogglePayment(r)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-550 text-white text-[8px] font-bold rounded cursor-pointer active:scale-95 transition-all shadow-sm border-none"
                          >
                            Registrar Pago
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredPeriodReports.filter(r => r.estadoPago !== 'pagado').length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-xs text-[var(--color-text-muted)] italic font-sans font-semibold">
                          ¡No hay comisiones pendientes de cobro! Excelente salud financiera.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--color-border)]">
              <button 
                onClick={() => setActiveMetricModal(null)}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Toast Notificación */}
      {toast.isVisible && (
        <GuidedToast 
          message={toast.message} 
          type={toast.type} 
          actionText={toast.actionText} 
          onActionClick={toast.onActionClick} 
          onClose={hideToast}
        />
      )}
    </div>
  );
}
