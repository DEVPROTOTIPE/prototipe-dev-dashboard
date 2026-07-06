import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  TrendingUp, CheckCircle, Clock, Users,
  Search, Download, ChevronLeft, ChevronRight,
  X, FileText, Landmark, BarChart3, MessageCircle,
  ArrowRightCircle, AlertCircle, RefreshCw, Filter
} from 'lucide-react'
import { exportGeneralMetricsPDF } from '../../services/pdfService'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatPeriod = (p) => {
  if (!p) return ''
  const [y, m] = p.split('-')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthIdx = parseInt(m, 10) - 1
  return `${months[monthIdx] || m} ${y.substring(2)}`
}

// Calcula cuántos días han pasado desde un periodo "YYYY-MM"
const daysSincePeriod = (periodo) => {
  if (!periodo) return 0
  const [y, m] = periodo.split('-').map(Number)
  const periodoDate = new Date(y, m - 1, 28) // día 28 como referencia de vencimiento
  const now = new Date()
  return Math.floor((now - periodoDate) / (1000 * 60 * 60 * 24))
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function ComisionesPanel({
  periodReports = [],
  clientesSaas = [],
  showToast,
  projMetrics = {},
  onTogglePayment,
  onGoToRecaudo
}) {
  // ─── Estados ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]           = useState('')
  const [statusFilter, setStatusFilter]         = useState('todos')
  const [currentPage, setCurrentPage]           = useState(1)
  const [selectedClientDetail, setSelectedClientDetail] = useState(null)
  const [sortField, setSortField]               = useState('periodo')
  const [sortDirection, setSortDirection]       = useState('desc')
  const [yearFilter, setYearFilter]             = useState('todos')   // B1
  const [togglingReportId, setTogglingReportId] = useState(null)      // A3 — spinner por fila

  const itemsPerPage = 10

  // ─── Años disponibles para filtro B1 ────────────────────────────────────────
  const availableYears = useMemo(() => {
    const years = [...new Set(periodReports.map(r => r.periodo?.split('-')[0]).filter(Boolean))].sort((a, b) => b - a)
    return years
  }, [periodReports])

  // ─── Reportes filtrados por año (aplica a KPIs + aportes + tabla) ───────────
  const yearFilteredReports = useMemo(() => {
    if (yearFilter === 'todos') return periodReports
    return periodReports.filter(r => r.periodo?.startsWith(yearFilter))
  }, [periodReports, yearFilter])

  // ─── Mapa de clientes indexado ───────────────────────────────────────────────
  const clientsMap = useMemo(() => {
    const map = new Map()
    clientesSaas.forEach(c => map.set(c.id.toLowerCase(), c))
    return map
  }, [clientesSaas])

  // ─── KPIs Generales ─────────────────────────────────────────────────────────
  const totalComision  = useMemo(() => yearFilteredReports.reduce((s, r) => s + (r.comisionValor || 0), 0), [yearFilteredReports])
  const totalCobrado   = useMemo(() => yearFilteredReports.reduce((s, r) => (r.estadoPago || 'pendiente').toLowerCase() === 'pagado' ? s + (r.comisionValor || 0) : s, 0), [yearFilteredReports])
  const totalPendiente = useMemo(() => yearFilteredReports.reduce((s, r) => (r.estadoPago || 'pendiente').toLowerCase() !== 'pagado' ? s + (r.comisionValor || 0) : s, 0), [yearFilteredReports])
  const clientesActivos = useMemo(() => new Set(yearFilteredReports.map(r => r.clientId)).size, [yearFilteredReports])
  const collectionRate  = useMemo(() => totalComision > 0 ? (totalCobrado / totalComision) * 100 : 100, [totalComision, totalCobrado])

  // ─── Agrupación por Cliente ──────────────────────────────────────────────────
  const clientAggregated = useMemo(() => {
    const initialMap = {}
    clientesSaas.forEach(c => {
      initialMap[c.id.toLowerCase()] = { name: c.id, totalSales: 0, totalCommission: 0, reportCount: 0, pendingCount: 0 }
    })
    return yearFilteredReports.reduce((acc, r) => {
      const cId = r.clientId.toLowerCase()
      if (!acc[cId]) acc[cId] = { name: r.clientId, totalSales: 0, totalCommission: 0, reportCount: 0, pendingCount: 0 }
      acc[cId].totalSales      += (r.totalVentas   || 0)
      acc[cId].totalCommission += (r.comisionValor || 0)
      acc[cId].reportCount     += 1
      if ((r.estadoPago || 'pendiente').toLowerCase() === 'pendiente') acc[cId].pendingCount += 1
      return acc
    }, initialMap)
  }, [yearFilteredReports, clientesSaas])

  const chartData = useMemo(() =>
    Object.values(clientAggregated).sort((a, b) => b.totalCommission - a.totalCommission),
  [clientAggregated])

  // ─── Filtrado + Ordenamiento + Paginación ────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return yearFilteredReports.filter(r => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = r.clientId.toLowerCase().includes(q) || r.periodo.toLowerCase().includes(q)
      const status = (r.estadoPago || 'pendiente').toLowerCase()
      const matchesStatus = statusFilter === 'todos' || status === statusFilter
      return matchesSearch && matchesStatus
    }).sort((a, b) => {
      let valA = sortField === 'periodo' ? (a.periodo || '') : Number(a[sortField] || 0)
      let valB = sortField === 'periodo' ? (b.periodo || '') : Number(b[sortField] || 0)
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [yearFilteredReports, searchQuery, statusFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage])

  const requestSort = (field) => {
    setSortField(field)
    setSortDirection(prev => sortField === field && prev === 'asc' ? 'desc' : 'asc')
  }

  // ─── A3: Toggle de pago inline ───────────────────────────────────────────────
  const handleInlineToggle = async (e, report) => {
    e.stopPropagation()
    if (!onTogglePayment || togglingReportId === report.id) return
    setTogglingReportId(report.id)
    try {
      await onTogglePayment(report)
    } finally {
      setTogglingReportId(null)
    }
  }

  // ─── Exportar PDF ────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    try {
      exportGeneralMetricsPDF(
        { totalComision, totalCobrado, totalPendiente, clientesActivos },
        chartData,
        projMetrics
      )
      if (showToast) showToast('Reporte consolidado exportado a PDF.', 'success')
    } catch (err) {
      console.error(err)
      if (showToast) showToast('Error al exportar reporte PDF.', 'error')
    }
  }

  // ─── A2: WhatsApp rápido desde drawer ───────────────────────────────────────
  const handleWhatsApp = (cMeta, clientId, pendingAmount) => {
    const phone = cMeta?.whatsappAdmin || cMeta?.telefono || ''
    const msg = `Hola *${clientId}*, te contactamos de parte de PROTOTIPE. Tienes una comisión pendiente de *$${pendingAmount.toLocaleString('es-CO')}*. Por favor comunícate con nosotros para gestionar el pago. ¡Gracias! 🙏`
    const encoded = encodeURIComponent(msg)
    const url = phone
      ? `https://api.whatsapp.com/send/?phone=${phone.replace(/\D/g, '')}&text=${encoded}`
      : `https://api.whatsapp.com/send/?text=${encoded}`
    window.open(url, '_blank')
    if (showToast) showToast('Abriendo WhatsApp...', 'success')
  }

  // ─── Drawer de Detalle de Cliente (A2 + A3 + C1) ────────────────────────────
  const renderDetailDrawer = () => {
    if (!selectedClientDetail) return null
    const cMeta          = clientsMap.get(selectedClientDetail.toLowerCase())
    const clientReports  = periodReports.filter(r => r.clientId.toLowerCase() === selectedClientDetail.toLowerCase())
    const clientCommission = clientReports.reduce((s, r) => s + (r.comisionValor || 0), 0)
    const clientPaid       = clientReports.filter(r => r.estadoPago === 'pagado').reduce((s, r) => s + (r.comisionValor || 0), 0)
    const clientPending    = clientCommission - clientPaid
    const clientRate       = clientCommission > 0 ? Math.round((clientPaid / clientCommission) * 100) : 100

    return createPortal(
      <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in bg-slate-950/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={() => setSelectedClientDetail(null)} />

        <div className="relative w-full max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl h-full flex flex-col animate-slide-left overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-500 font-black text-sm">
                {selectedClientDetail.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] uppercase tracking-wide">{selectedClientDetail}</h3>
                <span className="text-[10px] text-[var(--color-text-muted)] font-semibold block">{cMeta?.name || 'Cliente del Sistema'}</span>
              </div>
            </div>
            <button onClick={() => setSelectedClientDetail(null)}
              className="p-1.5 hover:bg-[var(--color-surface-2)] rounded-lg text-slate-500 hover:text-[var(--color-text)] transition-colors cursor-pointer">
              <X size={15} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Info del Cliente */}
            <div className="bg-[var(--color-surface-2)]/40 p-4 rounded-2xl border border-[var(--color-border)] space-y-2">
              <h4 className="text-[9px] uppercase font-black tracking-widest text-indigo-400">Información del Cliente</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Plan / Tipo</span>
                  <span className="text-[var(--color-text)] font-semibold">{cMeta?.tipo || 'SaaS Cliente'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Ciudad</span>
                  <span className="text-[var(--color-text)] font-semibold">{cMeta?.ciudad || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Contacto Administrativo</span>
                  <span className="text-[var(--color-text)] font-semibold">{cMeta?.contactoNombre || 'N/A'}</span>
                </div>
                {(cMeta?.whatsappAdmin || cMeta?.telefono) && (
                  <div className="col-span-2">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block">WhatsApp</span>
                    <span className="text-[var(--color-text)] font-semibold font-mono">{cMeta?.whatsappAdmin || cMeta?.telefono}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Efectividad de Cobro — Gauge visual simple */}
            <div className="bg-[var(--color-surface-2)]/30 p-4 rounded-2xl border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Efectividad de Cobro</span>
                <span className={`text-xs font-black ${clientRate >= 80 ? 'text-emerald-400' : clientRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {clientRate}%
                </span>
              </div>
              <div className="w-full bg-[var(--color-surface-2)] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${clientRate >= 80 ? 'bg-emerald-500' : clientRate >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                  style={{ width: `${clientRate}%` }}
                />
              </div>
            </div>

            {/* Métricas 3-celdas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-violet-600/5 border border-violet-500/10 rounded-xl">
                <span className="text-[8px] uppercase font-bold text-violet-400 tracking-wider">Aporte Acumulado</span>
                <p className="text-sm font-black font-mono text-[var(--color-text)] mt-1">${clientCommission.toLocaleString('es-CO')}</p>
              </div>
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <span className="text-[8px] uppercase font-bold text-emerald-400 tracking-wider">Total Cobrado</span>
                <p className="text-sm font-black font-mono text-[var(--color-text)] mt-1">${clientPaid.toLocaleString('es-CO')}</p>
              </div>
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl col-span-2">
                <span className="text-[8px] uppercase font-bold text-amber-400 tracking-wider">Por Recaudar / Pendiente</span>
                <p className="text-sm font-black font-mono text-[var(--color-text)] mt-1">${clientPending.toLocaleString('es-CO')}</p>
              </div>
            </div>

            {/* Acciones rápidas — A2 + C1 */}
            <div className="grid grid-cols-2 gap-2">
              {/* A2: WhatsApp */}
              <button
                onClick={() => handleWhatsApp(cMeta, selectedClientDetail, clientPending)}
                disabled={clientPending <= 0}
                className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageCircle size={13} />
                Cobrar por WhatsApp
              </button>
              {/* C1: Ir a Recaudo */}
              <button
                onClick={() => { setSelectedClientDetail(null); if (onGoToRecaudo) onGoToRecaudo(selectedClientDetail) }}
                className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                <ArrowRightCircle size={13} />
                Ver en Recaudación
              </button>
            </div>

            {/* Desglose de Periodos — A3: toggle inline */}
            <div className="space-y-2">
              <h4 className="text-[9px] uppercase font-black tracking-widest text-indigo-400">Desglose de Periodos</h4>
              {clientReports.length === 0 ? (
                <p className="text-[10px] text-[var(--color-text-muted)] italic p-3 text-center">Sin periodos registrados.</p>
              ) : (
                <div className="border border-[var(--color-border)] rounded-xl overflow-hidden text-[10px]">
                  <div className="bg-[var(--color-surface-2)] p-2 grid grid-cols-4 font-bold uppercase text-[8px] text-[var(--color-text-muted)] tracking-wider border-b border-[var(--color-border)]">
                    <span>Periodo</span>
                    <span className="text-right">Venta</span>
                    <span className="text-right">Comisión</span>
                    <span className="text-center">Estado</span>
                  </div>
                  <div className="divide-y divide-[var(--color-border)]/40 max-h-64 overflow-y-auto">
                    {clientReports.sort((a,b) => b.periodo?.localeCompare(a.periodo || '') || 0).map((r, idx) => {
                      const isPaid = (r.estadoPago || 'pendiente').toLowerCase() === 'pagado'
                      const isLoading = togglingReportId === r.id
                      const overdue = !isPaid && daysSincePeriod(r.periodo) > 60
                      return (
                        <div key={idx} className={`p-2.5 grid grid-cols-4 items-center font-mono text-[9px] ${overdue ? 'bg-amber-500/5' : 'hover:bg-[var(--color-surface-2)]/30'} transition-all`}>
                          <div className="font-sans font-bold flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : overdue ? 'bg-red-500' : 'bg-amber-500'}`} />
                            {formatPeriod(r.periodo)}
                          </div>
                          <span className="text-right text-[var(--color-text-muted)]">${Number(r.totalVentas || 0).toLocaleString('es-CO')}</span>
                          <span className="text-right font-bold text-violet-400">${Number(r.comisionValor || 0).toLocaleString('es-CO')}</span>
                          {/* A3: Toggle */}
                          <div className="flex justify-center">
                            {onTogglePayment ? (
                              <button
                                onClick={(e) => handleInlineToggle(e, r)}
                                disabled={isLoading}
                                title={isPaid ? 'Marcar pendiente' : 'Marcar pagado'}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer border-none ${
                                  isPaid
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                } disabled:opacity-50`}
                              >
                                {isLoading ? '...' : isPaid ? '✓ Pagado' : '⏳ Pend.'}
                              </button>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {isPaid ? 'Pagado' : 'Pend.'}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--color-border)] px-6 py-4 shrink-0">
            <button
              onClick={() => setSelectedClientDetail(null)}
              className="w-full py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cerrar Detalles
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // ─── RENDER PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 tab-content-enter">

      {/* Cabecera + Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <TrendingUp size={20} className="text-violet-500" />
            Comisiones Acumuladas
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Detalle y desglose de aportes, comisiones consolidadas y efectividad histórica por cliente.
          </p>
        </div>

        {/* B1: Filtro por año + PDF */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Selector de año */}
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-1.5">
            <Filter size={11} className="text-[var(--color-text-muted)]" />
            <select
              value={yearFilter}
              onChange={e => { setYearFilter(e.target.value); setCurrentPage(1) }}
              className="bg-transparent border-0 outline-none text-xs text-[var(--color-text)] cursor-pointer font-semibold"
            >
              <option value="todos">Todos los años</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/25 text-violet-400 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
          >
            <Download size={13} />
            Exportar Reporte General
          </button>
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Comisión Acumulada',    val: totalComision,   icon: TrendingUp,  col: 'from-violet-500/15 to-violet-500/5', iconCol: 'text-violet-500',  isCurrency: true },
          { label: 'Comisiones Cobradas',   val: totalCobrado,    icon: CheckCircle, col: 'from-emerald-500/15 to-emerald-500/5', iconCol: 'text-emerald-500', isCurrency: true },
          { label: 'Comisiones Pendientes', val: totalPendiente,  icon: Clock,       col: 'from-amber-500/15 to-amber-500/5', iconCol: 'text-amber-500',   isCurrency: true },
          { label: 'Tasa de Efectividad',   val: collectionRate,  icon: Landmark,    col: 'from-cyan-500/15 to-cyan-500/5', iconCol: 'text-cyan-500',    isRate: true },
        ].map((card, idx) => (
          <div key={idx} className={`p-5 bg-gradient-to-br ${card.col} bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-none">{card.label}</span>
              <div className="p-1 rounded bg-[var(--color-surface-2)]/70">
                <card.icon size={13} className={card.iconCol} />
              </div>
            </div>
            <p className="text-xl font-extrabold mt-2 tracking-tight text-[var(--color-text)]">
              {card.isRate ? `${card.val.toFixed(1)}%` : `$${card.val.toLocaleString('es-CO')}`}
            </p>
          </div>
        ))}
      </div>

      {/* Grid: Aportes + Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Panel Aportes por Cliente */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
              <BarChart3 size={14} className="text-violet-400" />
              Aportes por Cliente
            </h3>
            <span className="text-[8px] bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-bold">
              TOP {chartData.filter(c => c.totalCommission > 0).length || chartData.length}
            </span>
          </div>

          {/* C3: Contador total */}
          <p className="text-[9px] text-[var(--color-text-muted)] -mt-1">
            {filteredTransactions.length} registros · {availableYears.length > 0 && yearFilter !== 'todos' ? yearFilter : 'histórico completo'}
          </p>

          <div className="space-y-3">
            {chartData.length === 0 ? (
              <p className="text-[10px] text-[var(--color-text-muted)] italic text-center py-6">Sin datos para el periodo seleccionado.</p>
            ) : chartData.map((client, idx) => {
              const pct = totalComision > 0 ? ((client.totalCommission / totalComision) * 100) : 0
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedClientDetail(client.name)}
                  className="p-3.5 bg-[var(--color-bg)]/40 hover:bg-violet-500/5 border border-[var(--color-border)] hover:border-violet-500/25 rounded-xl transition-all cursor-pointer group flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[var(--color-text)] group-hover:text-violet-400 transition-colors uppercase tracking-wide truncate max-w-[120px]">{client.name}</span>
                      {/* B3: Badge vencido si tiene pendientes */}
                      {client.pendingCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[7px] font-bold rounded-full shrink-0">
                          {client.pendingCount} pend.
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black font-mono text-violet-400">${client.totalCommission.toLocaleString('es-CO')}</span>
                      <span className="text-[8px] text-[var(--color-text-muted)] font-mono">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-[var(--color-surface-2)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-violet-500 h-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel Historial de Transacciones */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" />
                Historial de Transacciones
              </h3>
              {/* C3: Contador de registros */}
              <span className="text-[9px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-full font-semibold">
                {filteredTransactions.length} de {yearFilteredReports.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Buscador */}
              <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-1.5 rounded-xl w-full sm:w-48 focus-within:border-indigo-500/50 transition-all">
                <Search size={12} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar cliente o periodo..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0"
                />
              </div>

              {/* Filtros de estado */}
              <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl">
                {['todos', 'pendiente', 'pagado'].map(f => (
                  <button
                    key={f}
                    onClick={() => { setStatusFilter(f); setCurrentPage(1) }}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-none ${
                      statusFilter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : 'Pagados'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto border border-[var(--color-border)] rounded-2xl">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-b border-[var(--color-border)] font-bold text-[8px] uppercase tracking-wider select-none">
                  <th className="p-3 cursor-pointer hover:text-[var(--color-text)]" onClick={() => requestSort('periodo')}>
                    Periodo {sortField === 'periodo' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3 cursor-pointer hover:text-[var(--color-text)]" onClick={() => requestSort('clientId')}>
                    Cliente {sortField === 'clientId' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3 text-right cursor-pointer hover:text-[var(--color-text)]" onClick={() => requestSort('totalVentas')}>
                    Venta Bruta {sortField === 'totalVentas' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3 text-right cursor-pointer hover:text-[var(--color-text)]" onClick={() => requestSort('comisionValor')}>
                    Comisión {sortField === 'comisionValor' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/40 font-mono text-[9px] text-[var(--color-text-muted)]">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
                        <FileText size={28} className="opacity-20" />
                        <span className="font-sans italic text-xs">Ningún cobro coincide con los filtros.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((r, idx) => {
                    const isPaid = (r.estadoPago || 'pendiente').toLowerCase() === 'pagado'
                    const isLoading = togglingReportId === r.id
                    // B3: vencido si pendiente y más de 60 días
                    const overdue = !isPaid && daysSincePeriod(r.periodo) > 60
                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedClientDetail(r.clientId)}
                        className={`transition-all cursor-pointer ${overdue ? 'bg-amber-500/5 border-l-2 border-amber-500/40' : 'hover:bg-violet-500/5'}`}
                      >
                        <td className="p-3 font-sans font-bold text-[var(--color-text)]">
                          <div className="flex items-center gap-1.5">
                            {formatPeriod(r.periodo)}
                            {/* B3: badge vencido */}
                            {overdue && (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[7px] font-bold rounded-full flex items-center gap-0.5">
                                <AlertCircle size={8} />
                                Vencido
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-sans text-[var(--color-text)] font-semibold uppercase">{r.clientId}</td>
                        <td className="p-3 text-right">${Number(r.totalVentas || 0).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-right text-violet-400 font-bold">${Number(r.comisionValor || 0).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-center">
                          {/* A3: Toggle en tabla */}
                          {onTogglePayment ? (
                            <button
                              onClick={(e) => handleInlineToggle(e, r)}
                              disabled={isLoading}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer border-none ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                              } disabled:opacity-50`}
                            >
                              {isLoading
                                ? <RefreshCw size={10} className="animate-spin mx-auto" />
                                : isPaid ? '✓ pagado' : '⏳ pend.'}
                            </button>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {r.estadoPago || 'pendiente'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación + C3: Contador */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 select-none">
            <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">
              Página {currentPage} de {totalPages} · <strong>{filteredTransactions.length}</strong> registros
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Portal */}
      {renderDetailDrawer()}
    </div>
  )
}
