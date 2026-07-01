import React, { useState, useEffect } from 'react'
import { 
  Activity, ShieldAlert, Cpu, CheckCircle, 
  AlertTriangle, Clock, RefreshCw, Layers, 
  ChevronRight, ArrowRight, HeartPulse, Terminal
} from 'lucide-react'

// Determinar las coordenadas polares estables de forma determinista para cada cliente
function getClientPolarCoords(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  // R (distancia desde el centro) entre 20% y 42% para no salirse del radar
  const r = 20 + Math.abs((hash >> 8) % 23)
  // Ángulo en radianes (0 a 2*PI)
  const angle = Math.abs(hash % 360) * (Math.PI / 180)
  return { r, angle }
}

export default function HealthRadar({ 
  clientesSaas = [], 
  failures = [], 
  setActiveTab, 
  setSelectedErrorClientFilter 
}) {
  const [selectedClient, setSelectedClient] = useState(null)
  const [coreFilter, setCoreFilter] = useState('todos')
  const [scanPulse, setScanPulse] = useState(0)

  // Intervalo cosmético para simular el barrido y actualizar latencias en caliente
  useEffect(() => {
    const timer = setInterval(() => {
      setScanPulse(prev => prev + 1)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Auto-seleccionar primer cliente al montar
  useEffect(() => {
    if (clientesSaas.length > 0 && !selectedClient) {
      setSelectedClient(clientesSaas[0])
    }
  }, [clientesSaas, selectedClient])

  // Obtener lista de tipos de Cores disponibles para el filtrado
  const availableCores = ['todos', ...new Set(clientesSaas.map(c => c.template || 'ventas'))]

  // Filtrar clientes
  const filteredClients = clientesSaas.filter(c => {
    if (coreFilter === 'todos') return true
    return (c.template || 'ventas') === coreFilter
  })

  // Estadísticas globales del Radar
  const totalClients = filteredClients.length
  const activeFailures = failures.filter(f => !f.resolved)
  const clientsWithFailures = new Set(activeFailures.map(f => f.clientId.toLowerCase()))
  const healthyCount = filteredClients.filter(c => !clientsWithFailures.has(c.id.toLowerCase())).length
  const failedCount = filteredClients.filter(c => clientsWithFailures.has(c.id.toLowerCase())).length
  const uptimeRate = totalClients > 0 ? Math.round((healthyCount / totalClients) * 100) : 100

  // Calcular latencia promedio global
  const avgLatency = Math.round(
    filteredClients.reduce((acc, c) => {
      const isFailed = clientsWithFailures.has(c.id.toLowerCase())
      const baseLat = isFailed ? 4500 : 80 + (c.id.length * 17) % 180
      return acc + baseLat
    }, 0) / (totalClients || 1)
  )

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Halo de luz trasera glassmorphic */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      
      {/* Encabezado e Indicadores de Filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)]/60 mb-6">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
            <HeartPulse size={10} className="text-violet-400 animate-pulse" />
            Sistemas Monitoreados en Vivo
          </span>
          <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2">
            <Activity size={16} className="text-violet-400" />
            Radar de Salud de Instancias
          </h3>
        </div>

        {/* Core Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {availableCores.map(core => (
            <button
              key={core}
              onClick={() => setCoreFilter(core)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                coreFilter === core
                  ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-950/20'
                  : 'bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
              }`}
            >
              {core === 'todos' ? 'Ver Todos' : `Core ${core}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid General: Radar Sonar + Lista Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sonar Radar Canvas (Visualizador) - 5 columnas en lg */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-[var(--color-border)]/55 rounded-3xl relative overflow-hidden backdrop-blur-sm w-full">
          <div className="absolute inset-0 bg-dots-grid opacity-[0.03] pointer-events-none" />
          
          {/* Radar Screen (Circular Container) */}
          <div className="w-full aspect-square max-w-[260px] rounded-full border border-violet-500/20 relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_24px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.1)] bg-slate-950/80">
            {/* Concentric Circles Grid */}
            <div className="absolute w-[25%] h-[25%] rounded-full border border-violet-500/10 pointer-events-none" />
            <div className="absolute w-[50%] h-[50%] rounded-full border border-violet-500/10 pointer-events-none" />
            <div className="absolute w-[75%] h-[75%] rounded-full border border-violet-500/10 pointer-events-none" />
            <div className="absolute w-[100%] h-[100%] rounded-full border border-violet-500/15 pointer-events-none" />
            
            {/* Quadrant Ejes lines */}
            <div className="absolute w-full h-[1px] bg-violet-500/10 pointer-events-none" />
            <div className="absolute h-full w-[1px] bg-violet-500/10 pointer-events-none" />
            
            {/* Sonar Sweep Ray */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(139,92,246,0.22)_0deg,rgba(6,182,212,0.08)_60deg,transparent_140deg)] rounded-full animate-radar-sweep pointer-events-none" />

            {/* Plotting Blips */}
            {filteredClients.map(client => {
              const { r, angle } = getClientPolarCoords(client.id)
              const clientFailures = failures.filter(f => f.clientId.toLowerCase() === client.id.toLowerCase() && !f.resolved)
              const hasFailure = clientFailures.length > 0
              const isWarning = client.id === 'tienda-calzado-x' // regla estática de demo anterior
              
              // Convert polar to cartesian coordinates relative to 50% center
              // r is in %, angle is in rad
              const x = 50 + r * Math.cos(angle)
              const y = 50 + r * Math.sin(angle)

              const isSelected = selectedClient && selectedClient.id === client.id

              let blipColor = 'bg-emerald-500 shadow-emerald-500/60'
              if (hasFailure) {
                blipColor = 'bg-red-500 shadow-red-500/60 animate-pulse'
              } else if (isWarning) {
                blipColor = 'bg-amber-500 shadow-amber-500/60'
              }

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute w-3.5 h-3.5 -ml-1.75 -mt-1.75 rounded-full flex items-center justify-center transition-all duration-300 z-30 cursor-pointer ${
                    isSelected ? 'scale-[1.3] z-40' : 'hover:scale-[1.2]'
                  }`}
                  title={`${client.id} (${hasFailure ? 'Alerta' : 'Online'})`}
                >
                  {/* Ping ripple animation for active errors or hovered */}
                  {(hasFailure || isSelected) && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-blip-ping ${
                      hasFailure ? 'bg-red-400' : 'bg-violet-400'
                    }`} />
                  )}
                  {/* Outer ring for selected item */}
                  {isSelected && (
                    <span className="absolute w-5 h-5 rounded-full border border-violet-400/80 animate-ping opacity-60" />
                  )}
                  {/* Core blip center */}
                  <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all ${blipColor} ${
                    isSelected ? 'ring-2 ring-white border border-violet-650' : 'border border-slate-900/60'
                  }`} />
                </button>
              )
            })}
          </div>

          {/* Sonar sweep ticker */}
          <div className="mt-3.5 flex items-center gap-1.5 text-[9px] font-mono text-slate-500 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500/40 animate-pulse" />
            <span>SWEEP TICKER: {(scanPulse % 360).toString().padStart(3, '0')}° CLK</span>
          </div>
        </div>

        {/* Instancias List / Grid - 7 columnas en lg */}
        <div className="lg:col-span-7 space-y-4 w-full">
          
          {/* Fichas de Estadísticas Rápidas */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[var(--color-surface-2)]/45 p-3 rounded-2xl border border-[var(--color-border)]/60 text-center flex flex-col justify-center">
              <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Uptime Central</span>
              <span className="text-sm font-black font-mono text-emerald-400 mt-1">{uptimeRate}%</span>
            </div>
            <div className="bg-[var(--color-surface-2)]/45 p-3 rounded-2xl border border-[var(--color-border)]/60 text-center flex flex-col justify-center">
              <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Promedio Ping</span>
              <span className="text-sm font-black font-mono text-violet-400 mt-1">{avgLatency} ms</span>
            </div>
            <div className="bg-[var(--color-surface-2)]/45 p-3 rounded-2xl border border-[var(--color-border)]/60 text-center flex flex-col justify-center">
              <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Incidentes</span>
              <span className={`text-sm font-black font-mono mt-1 ${activeFailures.length > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {activeFailures.length}
              </span>
            </div>
          </div>

          {/* Lista Compacta de Clientes Filtrados */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredClients.map(client => {
              const clientFailures = failures.filter(f => f.clientId.toLowerCase() === client.id.toLowerCase() && !f.resolved)
              const hasFailure = clientFailures.length > 0
              const isWarning = client.id === 'tienda-calzado-x'
              
              let latency = 80 + (client.id.length * 17) % 180
              let lastSeenText = 'en línea'
              let statusColor = 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5'

              if (hasFailure) {
                latency = 4200 + (clientFailures.length * 450)
                lastSeenText = `hace ${5 + (client.id.length % 10)}s`
                statusColor = 'text-red-400 border-red-500/25 bg-red-500/5'
              } else if (isWarning) {
                latency = 3150
                lastSeenText = 'hace 18 min'
                statusColor = 'text-amber-400 border-amber-500/25 bg-amber-500/5'
              }

              const isSelected = selectedClient && selectedClient.id === client.id

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-violet-600/10 border-violet-500/40 shadow-sm'
                      : 'bg-[var(--color-surface-2)]/25 border-[var(--color-border)]/50 hover:bg-[var(--color-surface-2)]/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-2 w-2 relative shrink-0">
                      {hasFailure && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        hasFailure ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-[var(--color-text)] truncate block font-mono leading-none">{client.id}</span>
                      <span className="text-[8px] text-[var(--color-text-muted)] block mt-1 font-mono uppercase tracking-wider">{client.template || 'ventas'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-[8px] font-black font-mono border px-1.5 py-0.5 rounded-md ${statusColor}`}>
                      {latency} ms
                    </span>
                    <ChevronRight size={12} className={`text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-violet-400' : ''}`} />
                  </div>
                </div>
              )
            })}
            {filteredClients.length === 0 && (
              <div className="text-center p-6 text-xs text-[var(--color-text-muted)] italic">
                No hay instancias registradas para este Core.
              </div>
            )}
          </div>

          {/* Tarjeta de Detalle del Cliente Seleccionado (Ficha Sonar) */}
          {selectedClient && (() => {
            const clientFailures = failures.filter(f => f.clientId.toLowerCase() === selectedClient.id.toLowerCase() && !f.resolved)
            const hasFailure = clientFailures.length > 0
            const isWarning = selectedClient.id === 'tienda-calzado-x'
            
            let statusText = 'SISTEMA SEGURO Y OPERATIVO ✓'
            let statusClass = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'
            let latencyText = `${80 + (selectedClient.id.length * 17) % 180}ms (Latencia óptima)`

            if (hasFailure) {
              statusText = `${clientFailures.length} INCIDENTE(S) ACTIVO(S) ✕`
              statusClass = 'text-red-400 bg-red-500/5 border-red-500/10 animate-pulse'
              latencyText = `${4200 + (clientFailures.length * 450)}ms (Alerta de Time-out)`
            } else if (isWarning) {
              statusText = 'ADVERTENCIA EN LATENCIA ⚠️'
              statusClass = 'text-amber-400 bg-amber-500/5 border-amber-500/10'
              latencyText = '3150ms (Falla de enrutamiento)'
            }

            return (
              <div className="p-4 bg-slate-950/20 border border-[var(--color-border)] rounded-2xl space-y-3.5 backdrop-blur-md relative overflow-hidden animate-scale-up">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Header Ficha */}
                <div className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-2">
                  <span className="text-[10px] font-black text-slate-400 font-mono tracking-tight uppercase">Ficha de Telemetría</span>
                  <span className={`text-[8px] font-black font-mono border px-2 py-0.5 rounded-full ${statusClass}`}>
                    {statusText}
                  </span>
                </div>

                {/* Grid de Datos */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                  <div>
                    <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block">ID Cliente</span>
                    <span className="font-mono font-bold text-[var(--color-text)] truncate block mt-0.5">{selectedClient.id}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block">Core Utilizado</span>
                    <span className="font-bold text-[var(--color-text)] flex items-center gap-1 mt-0.5">
                      <Layers size={10} className="text-violet-400" />
                      <span className="capitalize">{selectedClient.template || 'ventas'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block">Último Ping</span>
                    <span className="font-mono text-slate-300 block mt-0.5">{latencyText}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block">Mapeo HSL</span>
                    <span className="font-mono text-slate-300 block mt-0.5">HSL({(selectedClient.id.length * 40) % 360}, 70%, 50%)</span>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="pt-2.5 border-t border-[var(--color-border)]/40 flex items-center justify-end gap-2.5">
                  {hasFailure ? (
                    <button
                      onClick={() => {
                        setSelectedErrorClientFilter(selectedClient.id)
                        setActiveTab('errors')
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 border border-red-500/25 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-lg shadow-red-950/20"
                    >
                      <ShieldAlert size={10} />
                      Consola de Incidentes
                      <ArrowRight size={9} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Ir al CRM de este cliente
                        setActiveTab('crm')
                      }}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 border border-violet-500/25 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-lg shadow-violet-950/20"
                    >
                      <Terminal size={10} />
                      Gestionar en CRM
                      <ArrowRight size={9} />
                    </button>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
