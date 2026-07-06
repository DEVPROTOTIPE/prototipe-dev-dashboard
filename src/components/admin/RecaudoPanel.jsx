import React, { useState, useMemo } from 'react'
import {
  Clock, Coins, Users, TrendingUp, Search, Filter,
  ArrowUpDown, ChevronRight, Copy, ExternalLink,
  CheckCircle, MessageSquare, Building, ChevronLeft,
  X, AlertTriangle, FileText, Check
} from 'lucide-react'

// ─── Helpers de formato ──────────────────────────────────────────────────────
const formatPeriod = (p) => {
  if (!p) return ''
  const [y, m] = p.split('-')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthIdx = parseInt(m, 10) - 1
  return `${months[monthIdx] || m} ${y.substring(2)}`
}

const isReportVencido = (periodoStr) => {
  if (!periodoStr) return false
  const [year, month] = periodoStr.split('-').map(Number)
  const currentDate = new Date()
  const diffMonths = (currentDate.getFullYear() - year) * 12 + (currentDate.getMonth() - (month - 1))
  return diffMonths >= 2 // Mayor a 30 días de vencimiento
}

// ─── Plantillas de WhatsApp ──────────────────────────────────────────────────
const WA_TEMPLATES = {
  friendly: {
    name: 'Recordatorio Cortés',
    body: (client, periodos, comision, ventas) => 
      `¡Hola! Te saludamos del equipo de PROTOTIPE. 🌟 Queremos recordarte que la cuenta de comisión para tu app *${client}* correspondiente a *${periodos}* está lista. \n\n📊 *Métricas del periodo:*\n- Ventas registradas: $${ventas.toLocaleString('es-CO')}\n- Comisión: *$${comision.toLocaleString('es-CO')}*\n\nAgradecemos tu oportuno pago para mantener los servicios al día. ¡Que tengas un excelente día! 🚀`
  },
  formal: {
    name: 'Recordatorio Formal',
    body: (client, periodos, comision, ventas) => 
      `Estimado cliente, le informamos que la factura de comisión correspondiente al periodo *${periodos}* para la aplicación *${client}* se encuentra pendiente de recaudo. \n\n📈 *Resumen Operativo:*\n- Ventas Brutas: $${ventas.toLocaleString('es-CO')}\n- Valor de Comisión: *$${comision.toLocaleString('es-CO')}*\n\nAgradecemos registrar la transferencia bancaria y enviarnos el comprobante de pago. Quedamos atentos.`
  },
  urgent: {
    name: 'Alerta de Vencimiento',
    body: (client, periodos, comision, ventas) => 
      `⚠️ *AVISO DE CARTERA VENCIDA - PROTOTIPE* ⚠️\n\nLe recordamos que presenta un saldo pendiente de *$${comision.toLocaleString('es-CO')}* por concepto de comisiones de los periodos *${periodos}* en su aplicación *${client}*.\n\nEvite suspensiones del canal de telemetría y hosting. Agradecemos reportar el comprobante de transferencia a la brevedad.`
  }
}

export default function RecaudoPanel({
  periodReports = [],
  clientesSaas = [],
  onTogglePayment,
  onGoToCrm,
  showToast
}) {
  // ─── Estados ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState('all')       // all | vencidos | mes_actual
  const [groupByClient, setGroupByClient] = useState(false)  // true: consolidar por cliente, false: detallado por periodo
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClientDetail, setSelectedClientDetail] = useState(null) // ID del cliente seleccionado para el drawer
  const [waTemplateType, setWaTemplateType] = useState('friendly')
  const [copiedText, setCopiedText] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const itemsPerPage = 10

  // Clientes indexados por ID para búsqueda rápida
  const clientsMap = useMemo(() => {
    const map = new Map()
    clientesSaas.forEach(c => map.set(c.id.toLowerCase(), c))
    return map
  }, [clientesSaas])

  // ─── Cálculos de Métricas Generales (KPIs) ──────────────────────────────────
  const stats = useMemo(() => {
    const pendingReports = periodReports.filter(r => r.estadoPago !== 'pagado')
    const paidReports = periodReports.filter(r => r.estadoPago === 'pagado')

    const totalPendiente = pendingReports.reduce((sum, r) => sum + (r.comisionValor || 0), 0)
    const totalCobrado = paidReports.reduce((sum, r) => sum + (r.comisionValor || 0), 0)
    const totalGenerado = totalPendiente + totalCobrado

    const clientesMorosos = new Set(pendingReports.map(r => r.clientId.toLowerCase())).size
    const periodosVencidos = pendingReports.filter(r => isReportVencido(r.periodo)).length
    const collectionRate = totalGenerado > 0 ? (totalCobrado / totalGenerado) * 100 : 100

    return {
      totalPendiente,
      clientesMorosos,
      periodosVencidos,
      collectionRate
    }
  }, [periodReports])

  // ─── Filtrado y Agrupación ─────────────────────────────────────────────────
  const processedData = useMemo(() => {
    const pendingReports = periodReports.filter(r => r.estadoPago !== 'pagado')

    // 1. Filtrar por texto (búsqueda por nombre de cliente o periodo)
    let filtered = pendingReports.filter(r => {
      const matchesSearch = 
        r.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.periodo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatPeriod(r.periodo).toLowerCase().includes(searchQuery.toLowerCase())
      
      if (!matchesSearch) return false

      // 2. Filtrar por antigüedad
      if (filterMode === 'vencidos') {
        return isReportVencido(r.periodo)
      }
      if (filterMode === 'mes_actual') {
        const currentDate = new Date()
        const currentPeriodStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
        return r.periodo === currentPeriodStr
      }
      return true
    })

    // 3. Agrupar por Cliente si corresponde
    if (groupByClient) {
      const groupsMap = new Map()
      filtered.forEach(r => {
        const key = r.clientId.toLowerCase()
        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            id: key,
            clientId: r.clientId,
            totalVentas: 0,
            totalComision: 0,
            periodos: [],
            reports: []
          })
        }
        const g = groupsMap.get(key)
        g.totalVentas += Number(r.totalVentas || 0)
        g.totalComision += Number(r.comisionValor || 0)
        g.periodos.push(r.periodo)
        g.reports.push(r)
      })
      // Ordenar por el que debe más comisión
      return Array.from(groupsMap.values()).sort((a, b) => b.totalComision - a.totalComision)
    }

    // Por defecto (detallado), ordenar del periodo más antiguo al más reciente
    return filtered.sort((a, b) => a.periodo.localeCompare(b.periodo))
  }, [periodReports, searchQuery, filterMode, groupByClient])

  // Paginación
  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1
  const currentPageSafe = Math.min(currentPage, totalPages)
  const paginatedData = useMemo(() => {
    const start = (currentPageSafe - 1) * itemsPerPage
    return processedData.slice(start, start + itemsPerPage)
  }, [processedData, currentPageSafe])

  // ─── Detalle del Cliente Seleccionado (Drawer) ─────────────────────────────
  const clientDetailData = useMemo(() => {
    if (!selectedClientDetail) return null
    const lowerId = selectedClientDetail.toLowerCase()
    
    // Configuración del cliente en SaaS
    const saasConfig = clientsMap.get(lowerId) || {
      id: selectedClientDetail,
      niche: 'Retail / Ecommerce / POS',
      billingMode: 'percentage',
      comisionPorcentaje: 1.5,
      montoFijoServicio: 0
    }

    // Reportes de este cliente
    const clientReports = periodReports.filter(r => r.clientId.toLowerCase() === lowerId)
    const pending = clientReports.filter(r => r.estadoPago !== 'pagado')
    const paid = clientReports.filter(r => r.estadoPago === 'pagado').sort((a, b) => b.periodo.localeCompare(a.periodo))

    const accumulatedDebt = pending.reduce((sum, r) => sum + (r.comisionValor || 0), 0)
    const accumulatedSales = pending.reduce((sum, r) => sum + (r.totalVentas || 0), 0)

    return {
      config: saasConfig,
      pending,
      paid,
      accumulatedDebt,
      accumulatedSales
    }
  }, [selectedClientDetail, periodReports, clientsMap])

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleCopyWAMessage = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
    if (showToast) showToast('Mensaje copiado al portapapeles', 'success')
  }

  const handleRegisterSinglePayment = async (report) => {
    setIsProcessingPayment(true)
    try {
      await onTogglePayment(report)
      if (showToast) showToast(`Pago registrado con éxito para ${report.clientId}`, 'success')
    } catch (err) {
      if (showToast) showToast(`Error al registrar pago: ${err.message}`, 'error')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleRegisterAllPayments = async (reportsList) => {
    setIsProcessingPayment(true)
    let count = 0
    try {
      for (const r of reportsList) {
        await onTogglePayment(r)
        count++
      }
      if (showToast) showToast(`Se registraron ${count} pagos exitosamente`, 'success')
      setSelectedClientDetail(null)
    } catch (err) {
      if (showToast) showToast(`Error al procesar lote: ${err.message}`, 'error')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="space-y-6 tab-content-enter">
      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
          <Coins size={20} className="text-amber-500" />
          Cartera y Recaudación de Comisiones
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          Monitorea y gestiona los cobros de comisiones pendientes, genera recordatorios para WhatsApp y liquida pagos.
        </p>
      </div>

      {/* ─── Grid de KPIs (Ajustado a Escala) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[8px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-wider">Total por Recaudar</span>
          <p className="text-xl font-black text-amber-500 mt-1">
            ${stats.totalPendiente.toLocaleString('es-CO')}
          </p>
          <span className="text-[8px] text-[var(--color-text-muted)] mt-0.5 font-mono">Cuentas por cobrar activas</span>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[8px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-wider">Clientes Morosos</span>
          <p className="text-xl font-black text-red-400 mt-1">
            {stats.clientesMorosos}
          </p>
          <span className="text-[8px] text-[var(--color-text-muted)] mt-0.5 font-mono">Con facturas pendientes</span>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[8px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-wider">Periodos Vencidos</span>
          <p className="text-xl font-black text-orange-400 mt-1">
            {stats.periodosVencidos}
          </p>
          <span className="text-[8px] text-[var(--color-text-muted)] mt-0.5 font-mono">Con antigüedad &gt; 30 días</span>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[8px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-wider">Tasa de Efectividad</span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {stats.collectionRate.toFixed(1)}%
          </p>
          <span className="text-[8px] text-[var(--color-text-muted)] mt-0.5 font-mono">Comisiones cobradas / generadas</span>
        </div>
      </div>

      {/* ─── Tabla y Filtros ────────────────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        
        {/* Controles de Filtros */}
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Buscador */}
          <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-1.5 rounded-xl w-full md:w-64 focus-within:border-amber-500/50 transition-all">
            <Search size={12} className="text-[var(--color-text-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Buscar por cliente o periodo..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle de Agrupación */}
            <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => { setGroupByClient(false); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  !groupByClient ? 'bg-amber-500 text-slate-950' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Por Periodo
              </button>
              <button
                type="button"
                onClick={() => { setGroupByClient(true); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  groupByClient ? 'bg-amber-500 text-slate-950' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Por Cliente
              </button>
            </div>

            {/* Filtros de Antigüedad */}
            <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm shrink-0">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'vencidos', label: 'Vencidos (>30d)' },
                { id: 'mes_actual', label: 'Mes Actual' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setFilterMode(f.id); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filterMode === f.id ? 'bg-amber-500 text-slate-950' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)] font-bold border-b border-[var(--color-border)] text-[9px] uppercase tracking-wider">
                <th className="p-4 pl-5">Cliente</th>
                {groupByClient ? (
                  <th className="p-4">Periodos Pendientes</th>
                ) : (
                  <th className="p-4">Periodo</th>
                )}
                <th className="p-4 text-right">Venta Bruta</th>
                <th className="p-4 text-center">Tarifa / Modo</th>
                <th className="p-4 text-right">Comisión adeudada</th>
                <th className="p-4 pr-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/45 text-[11px]">
              {paginatedData.map((item, idx) => {
                const clientId = groupByClient ? item.clientId : item.clientId
                const saasConfig = clientsMap.get(clientId.toLowerCase())

                // Determinar badge de comisión
                const isFixed = saasConfig?.billingMode === 'fixed'
                const rateText = isFixed 
                  ? `$${(saasConfig.pagoMensualFijo || saasConfig.montoFijoServicio || 0).toLocaleString('es-CO')} Fijo`
                  : `${saasConfig?.comisionPorcentaje || 1.5}%`

                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedClientDetail(clientId)}
                    className={`hover:bg-[var(--color-surface-2)]/20 transition-colors cursor-pointer group ${
                      selectedClientDetail && selectedClientDetail.toLowerCase() === clientId.toLowerCase()
                        ? 'bg-amber-500/5 border-l-2 border-amber-500/40'
                        : ''
                    }`}
                  >
                    <td className="p-4 pl-5 font-bold text-[var(--color-text)]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-[10px] text-amber-400 font-extrabold uppercase">
                          {clientId.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-xs leading-tight">{clientId}</p>
                          <p className="text-[9px] text-[var(--color-text-muted)] font-normal">{saasConfig?.niche || 'Cliente SaaS'}</p>
                        </div>
                      </div>
                    </td>

                    {groupByClient ? (
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {item.periodos.length} periodos ({item.periodos.map(p => formatPeriod(p).split(' ')[0]).join(', ')})
                        </span>
                      </td>
                    ) : (
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                          isReportVencido(item.periodo) 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-zinc-800 text-[var(--color-text)] border border-[var(--color-border)]'
                        }`}>
                          {formatPeriod(item.periodo)}
                          {isReportVencido(item.periodo) && ' ⚠️ Vencido'}
                        </span>
                      </td>
                    )}

                    <td className="p-4 text-right font-mono text-xs">
                      ${(groupByClient ? item.totalVentas : (item.totalVentas || 0)).toLocaleString('es-CO')}
                    </td>

                    <td className="p-4 text-center">
                      <span className="text-[10px] font-semibold bg-[var(--color-bg)] px-2.5 py-0.5 rounded-full border border-[var(--color-border)]">
                        {rateText}
                      </span>
                    </td>

                    <td className="p-4 text-right font-mono text-xs font-black text-amber-500">
                      ${(groupByClient ? item.totalComision : (item.comisionValor || 0)).toLocaleString('es-CO')}
                    </td>

                    <td className="p-4 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onGoToCrm(clientId)}
                          className="px-2.5 py-1 text-[9px] font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-all cursor-pointer"
                        >
                          CRM
                        </button>
                        {!groupByClient && (
                          <button
                            type="button"
                            disabled={isProcessingPayment}
                            onClick={() => handleRegisterSinglePayment(item)}
                            className="px-2.5 py-1 text-[9px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-550 text-white transition-all cursor-pointer disabled:opacity-50"
                          >
                            Registrar Pago
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {processedData.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-xs text-[var(--color-text-muted)] italic">
                    <CheckCircle className="mx-auto text-emerald-500 mb-2" size={24} />
                    ¡Sin comisiones pendientes! Excelente salud de cartera.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              Página {currentPageSafe} de {totalPages} (Mostrando {paginatedData.length} de {processedData.length} registros)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPageSafe === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 text-[var(--color-text)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-2)] transition-all disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={currentPageSafe === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 text-[var(--color-text)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-2)] transition-all disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── SIDE DRAWER: DETALLE DE RECAUDO INDIVIDUAL/GRUPO ─────────────────── */}
      {selectedClientDetail && clientDetailData && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div 
            onClick={() => setSelectedClientDetail(null)}
            className="absolute inset-0 cursor-pointer" 
          />
          
          <div className="relative w-full max-w-md h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col p-6 animate-slide-in overflow-y-auto">
            
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-2.5">
                <Building className="text-amber-500" size={16} />
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--color-text)]">{clientDetailData.config.id}</h3>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500">{clientDetailData.config.niche}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientDetail(null)}
                className="p-1 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 py-5 space-y-6">
              {/* Resumen de Deuda */}
              <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Deuda Acumulada</span>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {clientDetailData.pending.length} periodos vencidos
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-black text-amber-500">
                    ${clientDetailData.accumulatedDebt.toLocaleString('es-CO')}
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    sobre ${clientDetailData.accumulatedSales.toLocaleString('es-CO')} en ventas
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between text-[10px]">
                  <span className="text-[var(--color-text-muted)] font-semibold">Esquema comercial:</span>
                  <span className="font-bold text-[var(--color-text)]">
                    {clientDetailData.config.billingMode === 'fixed' 
                      ? `Monto Fijo: $${(clientDetailData.config.pagoMensualFijo || clientDetailData.config.montoFijoServicio || 0).toLocaleString('es-CO')}/mes`
                      : `Comisión Variable: ${clientDetailData.config.comisionPorcentaje || 1.5}%`
                    }
                  </span>
                </div>
              </div>

              {/* Herramienta: Recordatorio WhatsApp (Billing Reminder) */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={11} className="text-emerald-400" />
                  Herramienta de Cobranza (WhatsApp)
                </h4>
                
                {/* Selector de plantilla */}
                <div className="flex bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] p-1 rounded-xl gap-1">
                  {Object.entries(WA_TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setWaTemplateType(key)}
                      className={`flex-1 text-[9px] font-bold py-1 px-2 rounded-lg transition-all cursor-pointer ${
                        waTemplateType === key 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>

                {/* Previsualización del cuerpo redactado */}
                <div className="relative group">
                  <textarea
                    readOnly
                    rows={8}
                    value={WA_TEMPLATES[waTemplateType].body(
                      clientDetailData.config.id,
                      clientDetailData.pending.map(p => formatPeriod(p.periodo)).join(', '),
                      clientDetailData.accumulatedDebt,
                      clientDetailData.accumulatedSales
                    )}
                    className="w-full bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl p-3 text-[10px] text-[var(--color-text)] outline-none resize-none font-mono leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyWAMessage(
                      WA_TEMPLATES[waTemplateType].body(
                        clientDetailData.config.id,
                        clientDetailData.pending.map(p => formatPeriod(p.periodo)).join(', '),
                        clientDetailData.accumulatedDebt,
                        clientDetailData.accumulatedSales
                      )
                    )}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
                  >
                    {copiedText ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Listado de Periodos Incluidos */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">
                  Desglose de Periodos Pendientes
                </h4>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {clientDetailData.pending.map((report, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl text-[10px]">
                      <div>
                        <span className="font-bold text-[var(--color-text)]">{formatPeriod(report.periodo)}</span>
                        <p className="text-[8px] text-[var(--color-text-muted)] font-mono">Ventas: ${report.totalVentas?.toLocaleString('es-CO')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-500 text-xs">${report.comisionValor?.toLocaleString('es-CO')}</span>
                        <button
                          type="button"
                          disabled={isProcessingPayment}
                          onClick={() => handleRegisterSinglePayment(report)}
                          className="p-1 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                        >
                          <CheckCircle size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial Reciente de Pagos */}
              {clientDetailData.paid.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">
                    Historial de Cobros Recientes
                  </h4>
                  <div className="space-y-2">
                    {clientDetailData.paid.slice(0, 3).map((report, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)]/50 rounded-xl text-[10px]">
                        <div>
                          <span className="font-bold text-[var(--color-text)]">{formatPeriod(report.periodo)}</span>
                          <span className="ml-1 text-[8px] text-emerald-400 px-1 py-0.5 bg-emerald-500/5 rounded font-bold border border-emerald-500/10">Pagado</span>
                        </div>
                        <span className="font-mono font-bold text-[var(--color-text-muted)]">${report.comisionValor?.toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Drawer */}
            <div className="border-t border-[var(--color-border)] pt-4 mt-auto space-y-2">
              {clientDetailData.pending.length > 1 && (
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => handleRegisterAllPayments(clientDetailData.pending)}
                  className="w-full h-10 flex items-center justify-center gap-2 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  Registrar Pago del Lote (${clientDetailData.accumulatedDebt.toLocaleString('es-CO')})
                </button>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedClientDetail(null); onGoToCrm(clientDetailData.config.id) }}
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] transition-all cursor-pointer"
                >
                  Ver Perfil CRM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams({
                      phone: '573123456789', // Teléfono placeholder o configurado del cliente
                      text: WA_TEMPLATES[waTemplateType].body(
                        clientDetailData.config.id,
                        clientDetailData.pending.map(p => formatPeriod(p.periodo)).join(', '),
                        clientDetailData.accumulatedDebt,
                        clientDetailData.accumulatedSales
                      )
                    })
                    window.open(`https://api.whatsapp.com/send?${params.toString()}`, '_blank')
                  }}
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                >
                  Enviar WhatsApp
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
