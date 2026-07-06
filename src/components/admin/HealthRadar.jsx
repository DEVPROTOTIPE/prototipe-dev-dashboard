import React, { useState, useEffect } from 'react'
import { 
  Activity, ShieldAlert, Cpu, CheckCircle, 
  AlertTriangle, Clock, RefreshCw, Layers, 
  ChevronRight, ArrowRight, HeartPulse, Terminal,
  Database, HardDrive
} from 'lucide-react'

// Helper component for horizontal resource bars
const ResourceRow = ({ value, max = 100, label, colorClass, icon: Icon, suffix = '%' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="bg-[var(--color-surface-3)]/20 border border-[var(--color-border)]/40 rounded-xl p-2 px-3 space-y-1 transition-all duration-300 hover:border-[var(--color-primary)]/30 w-full shrink-0">
      <div className="flex items-center justify-between text-[10px] font-mono leading-none">
        <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] min-w-0">
          <Icon size={11} className="text-[var(--color-primary)]/80 shrink-0" />
          <span className="font-bold uppercase tracking-wider text-[8px] truncate">{label}</span>
        </div>
        <span className="font-black text-[var(--color-text)] shrink-0 ml-2">{value}{suffix}</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--color-surface-3)]/60 border border-[var(--color-border)]/30 rounded-full overflow-hidden relative mt-1">
        <div className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function HealthRadar({ 
  clientesSaas = [], 
  failures = [], 
  setActiveTab, 
  setSelectedErrorClientFilter 
}) {
  const [selectedClient, setSelectedClient] = useState(null)
  const [coreFilter, setCoreFilter] = useState('todos')
  
  const [resourceStats, setResourceStats] = useState({
    cpu: 32,
    ram: 58,
    storage: 45,
    db: 12
  })
  
  const [cpuHistory, setCpuHistory] = useState([30, 32, 35, 34, 30, 31, 33, 35, 32, 30])

  useEffect(() => {
    if (!selectedClient) return
    const baseCpu = 25 + (selectedClient.id.length * 7) % 40
    const baseRam = 45 + (selectedClient.id.length * 3) % 35
    const baseStorage = 20 + (selectedClient.id.length * 9) % 55
    const baseDb = 4 + (selectedClient.id.length * 2) % 18
    setResourceStats({ cpu: baseCpu, ram: baseRam, storage: baseStorage, db: baseDb })
    setCpuHistory([baseCpu - 2, baseCpu + 1, baseCpu - 1, baseCpu, baseCpu + 2, baseCpu - 1, baseCpu + 3, baseCpu, baseCpu - 2, baseCpu])
  }, [selectedClient])

  useEffect(() => {
    const interval = setInterval(() => {
      setResourceStats(prev => {
        const jitter = (val, max, min = 0) => {
          const delta = Math.floor(Math.random() * 5) - 2
          return Math.max(min, Math.min(max, val + delta))
        }
        const nextCpu = jitter(prev.cpu, 95, 10)
        setCpuHistory(hist => [...hist.slice(1), nextCpu])
        return { cpu: nextCpu, ram: jitter(prev.ram, 98, 20), storage: prev.storage, db: jitter(prev.db, 30, 2) }
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (clientesSaas.length > 0 && !selectedClient) setSelectedClient(clientesSaas[0])
  }, [clientesSaas, selectedClient])

  const availableCores = ['todos', ...new Set(clientesSaas.map(c => c.template || 'ventas'))]
  const filteredClients = clientesSaas.filter(c => coreFilter === 'todos' ? true : (c.template || 'ventas') === coreFilter)
  const totalClients = filteredClients.length
  const activeFailures = failures.filter(f => !f.resolved)
  const clientsWithFailures = new Set(activeFailures.map(f => f.clientId.toLowerCase()))
  const healthyCount = filteredClients.filter(c => !clientsWithFailures.has(c.id.toLowerCase())).length
  const uptimeRate = totalClients > 0 ? Math.round((healthyCount / totalClients) * 100) : 100

  const avgLatency = Math.round(
    filteredClients.reduce((acc, c) => {
      const isFailed = clientsWithFailures.has(c.id.toLowerCase())
      const baseLat = isFailed ? 4500 : 80 + (c.id.length * 17) % 180
      return acc + baseLat
    }, 0) / (totalClients || 1)
  )

  const sparklinePoints = cpuHistory.map((val, idx) => `${idx * 16},${32 - (val / 100) * 28}`).join(' L ');
  const sparklinePath = `M ${sparklinePoints}`;
  const sparklineArea = `M 0,35 L ${sparklinePoints} L 144,35 Z`;

  return (
    <div className="bg-[var(--color-surface)]/60 backdrop-blur-xl border border-[var(--color-border)] text-[var(--color-text)] p-6 rounded-2xl relative overflow-hidden transition-all duration-300 w-full select-none shadow-sm animate-fade-in">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)] mb-5">
        <div className="space-y-0.5">
          <span className="text-[8px] font-black text-[var(--color-primary)] uppercase tracking-widest flex items-center gap-1">
            <HeartPulse size={9} className="text-[var(--color-primary)] animate-pulse" />
            TELEMETRÍA EN VIVO Y MONITOREO DE SISTEMAS
          </span>
          <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2 text-[var(--color-text)]">
            <Activity size={14} className="text-[var(--color-primary)]" />
            Radar de Salud de Instancias
          </h3>
        </div>

        <div className="flex flex-wrap gap-1">
          {availableCores.map(core => (
            <button
              key={core}
              onClick={() => setCoreFilter(core)}
              className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                coreFilter === core
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/10'
                  : 'bg-[var(--color-surface-3)]/40 border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)]/85'
              }`}
            >
              {core === 'todos' ? 'Ver Todos' : `Core ${core}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-5 flex flex-col p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl relative overflow-hidden backdrop-blur-sm justify-start gap-4">
          <div className="space-y-3 w-full flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-[8px] font-black text-[var(--color-text)] font-mono tracking-widest uppercase">Diagnóstico de Recursos</span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <ResourceRow value={resourceStats.cpu} label="CPU Load" colorClass="bg-violet-500" icon={Cpu} />
              <ResourceRow value={resourceStats.ram} label="RAM Usage" colorClass="bg-indigo-500" icon={Layers} />
              <ResourceRow value={resourceStats.storage} label="Storage" colorClass="bg-cyan-500" icon={HardDrive} />
              <ResourceRow value={resourceStats.db} max={50} label="DB Pools" colorClass="bg-emerald-500" suffix="" icon={Database} />
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-[var(--color-border)] w-full shrink-0">
            <span className="text-[6.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">Histórico de CPU (Sparkline)</span>
            <div className="h-9 w-full bg-[var(--color-surface-3)]/20 border border-[var(--color-border)]/50 rounded-lg flex items-end p-1 overflow-hidden">
              <svg viewBox="0 0 144 35" className="w-full h-full overflow-visible">
                <path d={sparklinePath} fill="none" className="stroke-violet-500/80 transition-all duration-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={sparklineArea} className="fill-violet-500/10 transition-all duration-500" />
              </svg>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Métricas, Lista y Ficha de Detalle (7 columnas en md) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Métricas Principales Planas y Minimalistas */}
          <div className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl p-2.5 flex items-center justify-around divide-x divide-[var(--color-border)] text-center shadow-sm">
            <div className="flex-1 px-1 flex flex-col justify-center">
              <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest block leading-none">Uptime Global</span>
              <span className="text-[11px] font-black font-mono text-emerald-500 mt-1">{uptimeRate}%</span>
            </div>
            <div className="flex-1 px-1 flex flex-col justify-center">
              <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest block leading-none">Latencia Promedio</span>
              <span className="text-[11px] font-black font-mono text-[var(--color-primary)] mt-1">{avgLatency} ms</span>
            </div>
            <div className="flex-1 px-1 flex flex-col justify-center">
              <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest block leading-none">Incidentes Activos</span>
              <span className={`text-[11px] font-black font-mono mt-1 ${activeFailures.length > 0 ? 'text-red-500 animate-pulse' : 'text-[var(--color-text-muted)]'}`}>
                {activeFailures.length}
              </span>
            </div>
          </div>

          {/* Listado de Instancias Filtrado */}
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredClients.map(client => {
              const clientFailures = failures.filter(f => f.clientId.toLowerCase() === client.id.toLowerCase() && !f.resolved)
              const hasFailure = clientFailures.length > 0
              const isWarning = client.id === 'tienda-calzado-x'
              
              let latency = 80 + (client.id.length * 17) % 180
              let lastSeenText = 'en línea'
              let statusTextClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'

              if (hasFailure) {
                latency = 4200 + (clientFailures.length * 450)
                lastSeenText = `falla hace ${5 + (client.id.length % 10)}s`
                statusTextClass = 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse'
              } else if (isWarning) {
                latency = 3150
                lastSeenText = 'hace 18 min'
                statusTextClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20'
              }

              const isSelected = selectedClient && selectedClient.id === client.id

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 [.light_&]:bg-violet-100/50 [.light_&]:border-violet-300 shadow-sm'
                      : 'bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-1.5 w-1.5 relative shrink-0">
                      {hasFailure && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-455 opacity-75" />}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        hasFailure ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </span>
                    <div className="min-w-0 flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold text-[var(--color-text)] truncate block font-mono">{client.id}</span>
                      <span className="text-[7px] text-[var(--color-text-muted)] font-mono uppercase tracking-wider shrink-0">{client.template || 'ventas'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[7px] font-black font-mono border px-1.5 py-0.5 rounded-md leading-none ${statusTextClass}`}>
                      {latency} ms
                    </span>
                    <ChevronRight size={10} className={`text-[var(--color-text-muted)] transition-transform ${isSelected ? 'rotate-90 text-[var(--color-primary)]' : ''}`} />
                  </div>
                </div>
              )
            })}
            {filteredClients.length === 0 && (
              <div className="text-center py-4 text-[10px] text-[var(--color-text-muted)] italic">
                No hay instancias registradas para este Core.
              </div>
            )}
          </div>

          {/* Ficha de Telemetría (Detalle de Cliente Activo) */}
          {selectedClient && (() => {
            const clientFailures = failures.filter(f => f.clientId.toLowerCase() === selectedClient.id.toLowerCase() && !f.resolved)
            const hasFailure = clientFailures.length > 0
            const isWarning = selectedClient.id === 'tienda-calzado-x'
            
            let statusText = 'SISTEMA SEGURO ✓'
            let statusClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
            let latencyDesc = `${80 + (selectedClient.id.length * 17) % 180}ms (Latencia óptima)`

            if (hasFailure) {
              statusText = `${clientFailures.length} INCIDENTE(S) ACTIVO(S) ✕`
              statusClass = 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse'
              latencyDesc = `${4200 + (clientFailures.length * 450)}ms (Time-out detectado)`
            } else if (isWarning) {
              statusText = 'ADVERTENCIA EN LATENCIA ⚠️'
              statusClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20'
              latencyDesc = '3150ms (Falla de enrutamiento)'
            }

            return (
              <div className="p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-3 backdrop-blur-md relative overflow-hidden animate-scale-up shadow-sm">
                {/* Header Ficha */}
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[8px] font-black text-[var(--color-text-muted)] font-mono tracking-widest uppercase">Ficha de Telemetría</span>
                  <span className={`text-[7px] font-black font-mono border px-2 py-0.5 rounded-md ${statusClass}`}>
                    {statusText}
                  </span>
                </div>

                {/* Grid de Datos Ficha */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[9px]">
                  <div>
                    <span className="text-[7px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block">ID Cliente</span>
                    <span className="font-mono font-bold text-[var(--color-text)] truncate block mt-0.5">{selectedClient.id}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block">Core Utilizado</span>
                    <span className="font-bold text-[var(--color-text)] flex items-center gap-1 mt-0.5">
                      <Layers size={9} className="text-[var(--color-primary)]" />
                      <span className="capitalize">{selectedClient.template || 'ventas'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block">Latencia Conexión</span>
                    <span className="font-mono text-[var(--color-text)]/90 block mt-0.5">{latencyDesc}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-[var(--color-text-muted)] font-black uppercase tracking-wider block">Parámetros Marca</span>
                    <span className="font-mono text-[var(--color-text)]/90 block mt-0.5">HSL({(selectedClient.id.length * 40) % 360}, 70%, 50%)</span>
                  </div>
                </div>

                {/* Botón de Acción */}
                <div className="pt-2.5 border-t border-[var(--color-border)] flex justify-end">
                  {hasFailure ? (
                    <button
                      onClick={() => {
                        setSelectedErrorClientFilter(selectedClient.id)
                        setActiveTab('errors')
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-500/20 text-white !text-white text-[8px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <ShieldAlert size={9} />
                      Consola de Incidentes
                      <ArrowRight size={8} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('crm')}
                      className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/20 text-white !text-white text-[8px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Terminal size={9} />
                      Gestionar en CRM
                      <ArrowRight size={8} />
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
