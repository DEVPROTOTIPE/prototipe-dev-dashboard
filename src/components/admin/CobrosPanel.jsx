import React, { useState, useMemo } from 'react'
import {
  CheckCircle, Coins, Search, Filter,
  ArrowUpDown, ChevronRight, ChevronLeft,
  RotateCcw, FileText, Calendar, Building,
  ArrowUpRight, Award, TrendingUp, X
} from 'lucide-react'

// ─── Helpers de formato ──────────────────────────────────────────────────────
const formatPeriod = (p) => {
  if (!p) return ''
  const [y, m] = p.split('-')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthIdx = parseInt(m, 10) - 1
  return `${months[monthIdx] || m} ${y.substring(2)}`
}

export default function CobrosPanel({
  periodReports = [],
  clientesSaas = [],
  onTogglePayment,
  showToast
}) {
  // ─── Estados ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all')       // all | 2026 | 2025 | etc.
  const [groupByClient, setGroupByClient] = useState(false)     // true: consolidar por cliente, false: detallado por periodo
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClientDetail, setSelectedClientDetail] = useState(null) // ID del cliente para el drawer
  const [sortField, setSortField] = useState('periodo')         // periodo | comisionValor | totalVentas
  const [sortDirection, setSortDirection] = useState('desc')    // asc | desc
  const [updatingId, setUpdatingId] = useState(null)

  const itemsPerPage = 10

  // Clientes indexados por ID para búsqueda rápida y estilos de color
  const clientsMap = useMemo(() => {
    const map = new Map()
    clientesSaas.forEach(c => map.set(c.id.toLowerCase(), c))
    return map
  }, [clientesSaas])

  // ─── Cálculos de Métricas Generales (KPIs) ──────────────────────────────────
  const stats = useMemo(() => {
    const paidReports = periodReports.filter(r => r.estadoPago === 'pagado')
    const pendingReports = periodReports.filter(r => r.estadoPago !== 'pagado')

    const totalCobrado = paidReports.reduce((sum, r) => sum + (r.comisionValor || 0) - (r.comisionesDeducidas || 0), 0)
    const totalPendiente = pendingReports.reduce((sum, r) => sum + (r.comisionValor || 0) - (r.comisionesDeducidas || 0), 0)
    const totalGenerado = totalCobrado + totalPendiente

    const totalVentasCobradas = paidReports.reduce((sum, r) => sum + (r.totalVentas || 0), 0)
    const totalTransacciones = paidReports.length
    const promedioCobrado = totalTransacciones > 0 ? totalCobrado / totalTransacciones : 0
    const collectionRate = totalGenerado > 0 ? (totalCobrado / totalGenerado) * 100 : 100

    return {
      totalCobrado,
      totalVentasCobradas,
      totalTransacciones,
      promedioCobrado,
      collectionRate
    }
  }, [periodReports])

  // ─── Filtrado y Agrupación ─────────────────────────────────────────────────
  const processedData = useMemo(() => {
    const paidReports = periodReports.filter(r => r.estadoPago === 'pagado')

    // 1. Filtrar por texto (búsqueda por nombre de cliente o periodo)
    let filtered = paidReports.filter(r => {
      const matchesSearch = 
        r.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.periodo.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesPeriod = 
        filterPeriod === 'all' || 
        r.periodo.startsWith(filterPeriod)

      return matchesSearch && matchesPeriod
    })

    // 2. Ordenar datos brutos
    filtered.sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]

      if (sortField === 'periodo') {
        valA = a.periodo || ''
        valB = b.periodo || ''
      } else {
        valA = Number(valA || 0)
        valB = Number(valB || 0)
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    // 3. Agrupación (Consolidado por Cliente si aplica)
    if (groupByClient) {
      const groupedMap = new Map()
      filtered.forEach(r => {
        const clientKey = r.clientId.toLowerCase()
        if (!groupedMap.has(clientKey)) {
          groupedMap.set(clientKey, {
            clientId: r.clientId,
            periodos: [],
            totalVentas: 0,
            comisionValor: 0,
            count: 0,
            originalReports: []
          })
        }
        const group = groupedMap.get(clientKey)
        group.periodos.push(r.periodo)
        group.totalVentas += r.totalVentas || 0
        group.comisionValor += (r.comisionValor || 0) - (r.comisionesDeducidas || 0)
        group.count += 1
        group.originalReports.push(r)
      })

      const groupedArray = Array.from(groupedMap.values())
      // Ordenar agrupados por comisión acumulada de mayor a menor por defecto
      groupedArray.sort((a, b) => b.comisionValor - a.comisionValor)
      return groupedArray
    }

    return filtered
  }, [periodReports, searchQuery, filterPeriod, groupByClient, sortField, sortDirection])

  // ─── Paginación ────────────────────────────────────────────────────────────
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return processedData.slice(start, start + itemsPerPage)
  }, [processedData, currentPage])

  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // ─── Ordenación ────────────────────────────────────────────────────────────
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  // ─── Manejo de Reversión de Pago con Estado Local de Carga ───────────────────
  const handleRevertPayment = async (report) => {
    if (updatingId) return
    setUpdatingId(report.id || `${report.clientId}-${report.periodo}`)
    try {
      await onTogglePayment(report)
      if (showToast) {
        showToast(`Pago del periodo ${formatPeriod(report.periodo)} de ${report.clientId} revertido a pendiente`, { type: 'success' })
      }
    } catch (err) {
      console.error(err)
      if (showToast) {
        showToast('Error al revertir el pago', { type: 'error' })
      }
    } finally {
      setUpdatingId(null)
    }
  }

  // ─── Descarga del Comprobante PDF (Mock o simulación local de llamada a export) ───
  const handleExportPDF = (report) => {
    if (showToast) {
      showToast(`Generando comprobante de cobro PDF para ${report.clientId}...`, { type: 'success' })
    }
    setTimeout(() => {
      if (showToast) {
        showToast(`PDF de comisión descargado con éxito.`, { type: 'success' })
      }
    }, 1500)
  }

  // Años únicos disponibles para el filtro
  const uniqueYears = useMemo(() => {
    const years = new Set()
    periodReports.filter(r => r.estadoPago === 'pagado').forEach(r => {
      if (r.periodo) {
        const [year] = r.periodo.split('-')
        years.add(year)
      }
    })
    return Array.from(years).sort().reverse()
  }, [periodReports])

  // Obtener HSL del cliente seleccionado para el drawer
  const selectedClientMeta = useMemo(() => {
    if (!selectedClientDetail) return null
    const cMeta = clientsMap.get(selectedClientDetail.toLowerCase())
    if (cMeta && cMeta.primaryColor) {
      return cMeta.primaryColor
    }
    return 'hsl(142, 70%, 45%)'
  }, [selectedClientDetail, clientsMap])

  // Desglose de cobros del cliente seleccionado
  const clientDetailReports = useMemo(() => {
    if (!selectedClientDetail) return []
    return periodReports.filter(r => r.clientId.toLowerCase() === selectedClientDetail.toLowerCase() && r.estadoPago === 'pagado')
  }, [selectedClientDetail, periodReports])

  return (
    <div className="space-y-6 tab-content-enter pb-12">
      {/* ─── Encabezado del Módulo ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <CheckCircle size={20} className="text-emerald-400" />
            Historial de Cobros
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Registro consolidado de comisiones recaudadas y archivadas en el ecosistema.
          </p>
        </div>
      </div>

      {/* ─── Malla de KPIs Premium ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recaudado */}
        <div className="p-5 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 relative overflow-hidden group shadow-sm hover-glow-card">
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-[var(--color-bg)] text-emerald-500">
            <Coins size={14} />
          </div>
          <span className="text-[9px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-none">Total Recaudado</span>
          <p className="text-2xl font-black mt-2 text-[var(--color-text)] tracking-tight">
            ${stats.totalCobrado.toLocaleString('es-CO')}
          </p>
          <span className="text-[9px] font-medium text-emerald-500 flex items-center gap-1 mt-1">
            <ArrowUpRight size={10} />
            Ingresos directos por comisiones
          </span>
        </div>

        {/* Transacciones */}
        <div className="p-5 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 dark:from-indigo-500/10 dark:to-indigo-500/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 relative overflow-hidden group shadow-sm hover-glow-card">
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-[var(--color-bg)] text-indigo-400">
            <CheckCircle size={14} />
          </div>
          <span className="text-[9px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-none">Periodos Cobrados</span>
          <p className="text-2xl font-black mt-2 text-[var(--color-text)] tracking-tight">
            {stats.totalTransacciones} <span className="text-xs font-normal text-[var(--color-text-muted)]">meses</span>
          </p>
          <span className="text-[9px] font-medium text-[var(--color-text-muted)] mt-1">
            Respaldos comisionales liquidados
          </span>
        </div>

        {/* Comisión Promedio */}
        <div className="p-5 bg-gradient-to-br from-violet-500/20 to-violet-500/5 dark:from-violet-500/10 dark:to-violet-500/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 relative overflow-hidden group shadow-sm hover-glow-card">
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-[var(--color-bg)] text-violet-400">
            <Award size={14} />
          </div>
          <span className="text-[9px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-none">Promedio Mensual</span>
          <p className="text-2xl font-black mt-2 text-[var(--color-text)] tracking-tight">
            ${Math.round(stats.promedioCobrado).toLocaleString('es-CO')}
          </p>
          <span className="text-[9px] font-medium text-[var(--color-text-muted)] mt-1">
            Por transacción liquidada
          </span>
        </div>

        {/* Efectividad */}
        <div className="p-5 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 dark:from-cyan-500/10 dark:to-cyan-500/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1 relative overflow-hidden group shadow-sm hover-glow-card">
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-[var(--color-bg)] text-cyan-400">
            <TrendingUp size={14} />
          </div>
          <span className="text-[9px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-none">Efectividad de Cobro</span>
          <p className="text-2xl font-black mt-2 text-[var(--color-text)] tracking-tight">
            {stats.collectionRate.toFixed(1)}%
          </p>
          <div className="w-full bg-[var(--color-bg)] h-1 rounded-full mt-2 overflow-hidden border border-[var(--color-border)]">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* ─── Panel de Filtros e Historial ─────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-md overflow-hidden">
        {/* Controles de Búsqueda y Filtros */}
        <div className="p-5 border-b border-[var(--color-border)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Buscador */}
            <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2.5 rounded-xl w-full sm:w-64 shadow-sm focus-within:border-indigo-500/50 transition-all">
              <Search size={14} className="text-slate-500" />
              <input
                type="text"
                placeholder="Buscar cliente o periodo..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0"
              />
            </div>

            {/* Filtro de Año */}
            <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2.5 rounded-xl w-full sm:w-44 shadow-sm">
              <Calendar size={13} className="text-slate-500" />
              <select
                value={filterPeriod}
                onChange={e => { setFilterPeriod(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none outline-none text-xs w-full text-[var(--color-text)] cursor-pointer focus:ring-0"
              >
                <option value="all" className="bg-[var(--color-surface)] text-[var(--color-text)]">Todos los Años</option>
                {uniqueYears.map(yr => (
                  <option key={yr} value={yr} className="bg-[var(--color-surface)] text-[var(--color-text)]">{yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Switch de Agrupación por Cliente */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm select-none">
              <button
                onClick={() => { setGroupByClient(false); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  !groupByClient ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Detalle Periodos
              </button>
              <button
                onClick={() => { setGroupByClient(true); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  groupByClient ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Consolidar Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Listado y Tabla */}
        {processedData.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs italic">
            Ningún cobro coincide con los criterios de búsqueda o no se han liquidado comisiones.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--color-surface-2)]/70 text-[var(--color-text-muted)] border-b border-[var(--color-border)] font-bold">
                  <th className="p-4 pl-5 uppercase tracking-wider text-[9px]">Cliente</th>
                  {!groupByClient && (
                    <th 
                      onClick={() => toggleSort('periodo')}
                      className="p-4 uppercase tracking-wider text-[9px] cursor-pointer hover:text-[var(--color-text)] select-none"
                    >
                      <div className="flex items-center gap-1">
                        Periodo
                        <ArrowUpDown size={10} className="text-slate-500" />
                      </div>
                    </th>
                  )}
                  {groupByClient && (
                    <th className="p-4 uppercase tracking-wider text-[9px]">
                      Meses Cobrados
                    </th>
                  )}
                  <th 
                    onClick={() => toggleSort('totalVentas')}
                    className="p-4 text-right uppercase tracking-wider text-[9px] cursor-pointer hover:text-[var(--color-text)] select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Ventas Brutas
                      <ArrowUpDown size={10} className="text-slate-500" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('comisionValor')}
                    className="p-4 text-right uppercase tracking-wider text-[9px] cursor-pointer hover:text-[var(--color-text)] select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Comisión Cobrada
                      <ArrowUpDown size={10} className="text-slate-500" />
                    </div>
                  </th>
                  <th className="p-4 text-center uppercase tracking-wider text-[9px] w-24">Estado</th>
                  <th className="p-4 pr-5 text-right uppercase tracking-wider text-[9px] w-36">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/50 font-mono text-[10px] text-[var(--color-text-muted)]">
                {paginatedData.map((item, idx) => {
                  const clientKey = item.clientId.toLowerCase()
                  const clientMeta = clientsMap.get(clientKey)

                  return (
                    <tr key={idx} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                      {/* Cliente */}
                      <td className="p-4 pl-5 font-sans font-bold text-[var(--color-text)]">
                        <button
                          onClick={() => setSelectedClientDetail(item.clientId)}
                          className="flex items-center gap-2 hover:text-indigo-400 cursor-pointer text-left transition-colors border-none bg-transparent p-0 outline-none"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs leading-none">{item.clientId}</span>
                            <span className="text-[9px] text-[var(--color-text-muted)] font-normal font-sans mt-0.5">
                              {clientMeta?.name || 'Cliente SaaS'}
                            </span>
                          </div>
                        </button>
                      </td>

                      {/* Periodo o Meses Cobrados */}
                      {!groupByClient ? (
                        <td className="p-4 text-xs font-semibold font-sans text-[var(--color-text)] opacity-95">
                          {formatPeriod(item.periodo)}
                        </td>
                      ) : (
                        <td className="p-4 font-sans text-[10px]">
                          <span className="px-2 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[9px] font-bold text-[var(--color-text)]">
                            {item.count} {item.count === 1 ? 'periodo' : 'periodos'}
                          </span>
                        </td>
                      )}

                      {/* Ventas Brutas */}
                      <td className="p-4 text-right text-[11px] font-medium">
                        ${item.totalVentas.toLocaleString('es-CO')}
                      </td>

                      {/* Comisión Cobrada */}
                      <td className="p-4 text-right text-emerald-500 font-extrabold text-[11px] tracking-tight">
                        ${(item.comisionValor - (item.comisionesDeducidas || 0)).toLocaleString('es-CO')}
                        {item.comisionesDeducidas > 0 && (
                          <div className="text-[9px] text-amber-500 font-medium">
                            (Deducido: ${item.comisionesDeducidas.toLocaleString('es-CO')})
                          </div>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                          Cobrado
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="p-4 pr-5 text-right flex items-center justify-end gap-1.5">
                        {!groupByClient ? (
                          <>
                            <button
                              onClick={() => handleRevertPayment(item)}
                              disabled={updatingId === item.id}
                              title="Revertir comisión a pendiente"
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 border border-amber-500/15 rounded-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw size={12} className={updatingId === item.id ? 'animate-spin' : ''} />
                            </button>
                            <button
                              onClick={() => handleExportPDF(item)}
                              title="Descargar Comprobante PDF"
                              className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/15 rounded-lg active:scale-95 transition-all cursor-pointer"
                            >
                              <FileText size={12} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedClientDetail(item.clientId)}
                            className="px-2.5 py-1 bg-[var(--color-bg)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)] hover:text-indigo-400 text-[9px] font-bold border border-[var(--color-border)] hover:border-indigo-500/20 rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                          >
                            Ver Desglose
                            <ChevronRight size={10} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex items-center justify-between select-none">
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
              Mostrando página {currentPage} de {totalPages} ({processedData.length} registros)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-border)] rounded-xl text-[var(--color-text)] active:scale-[0.95] cursor-pointer transition-all"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed border border-[var(--color-border)] rounded-xl text-[var(--color-text)] active:scale-[0.95] cursor-pointer transition-all"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Side Drawer de Detalle del Cliente ────────────────────────────────── */}
      {selectedClientDetail && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in bg-slate-950/60 backdrop-blur-sm">
          {/* Clic fuera cierra */}
          <div className="absolute inset-0" onClick={() => setSelectedClientDetail(null)} />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl h-full flex flex-col animate-slide-left p-6 space-y-6 overflow-y-auto">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                  style={{ backgroundColor: selectedClientMeta }}
                >
                  {selectedClientDetail.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[var(--color-text)] uppercase tracking-wider leading-none">
                    {selectedClientDetail}
                  </h3>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">
                    {clientsMap.get(selectedClientDetail.toLowerCase())?.name || 'Cliente del Sistema'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="p-1.5 hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl cursor-pointer transition-all border-none bg-transparent"
              >
                <X size={15} />
              </button>
            </div>

            {/* Resumen Histórico del Cliente */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black text-[var(--color-text-muted)] tracking-wider">Historial de Recaudos</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                  <span className="text-[8px] font-extrabold text-[var(--color-text-muted)] uppercase block">Total Cobrado</span>
                  <span className="text-sm font-black text-emerald-500 font-mono mt-1 block">
                    ${clientDetailReports.reduce((sum, r) => sum + (r.comisionValor || 0), 0).toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                  <span className="text-[8px] font-extrabold text-[var(--color-text-muted)] uppercase block">Meses Pagados</span>
                  <span className="text-sm font-black text-[var(--color-text)] mt-1 block">
                    {clientDetailReports.length} periodos
                  </span>
                </div>
              </div>
            </div>

            {/* Listado de Periodos Cobrados */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              <h5 className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Periodos Liquidados</h5>
              {clientDetailReports.map((report, index) => (
                <div key={index} className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[var(--color-text)]">{formatPeriod(report.periodo)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 font-mono">
                      Pagado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 text-[10px] font-mono text-[var(--color-text-muted)]">
                    <div>
                      <span className="text-[8px] font-sans block text-[var(--color-text-muted)]">Ventas Brutas:</span>
                      <span className="font-semibold text-[var(--color-text)]">${(report.totalVentas || 0).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-sans block text-[var(--color-text-muted)]">Comisión:</span>
                      <span className="font-black text-emerald-500">${(report.comisionValor || 0).toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[var(--color-border)]/50 shrink-0">
                    <button
                      onClick={() => handleRevertPayment(report)}
                      disabled={updatingId === report.id}
                      className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-bold rounded cursor-pointer border border-amber-500/10 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCcw size={10} className={updatingId === report.id ? 'animate-spin' : ''} />
                      Revertir
                    </button>
                    <button
                      onClick={() => handleExportPDF(report)}
                      className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[9px] font-bold rounded cursor-pointer border border-indigo-500/10 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <FileText size={10} />
                      Soporte PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Drawer */}
            <div className="pt-4 border-t border-[var(--color-border)] shrink-0">
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="w-full py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] font-extrabold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
