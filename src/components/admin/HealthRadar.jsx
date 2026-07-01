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
  const r = 22 + Math.abs((hash >> 8) % 20)
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
  const [scanAngle, setScanAngle] = useState(0)

  // Ticker estético de barrido
  useEffect(() => {
    const timer = setInterval(() => {
      setScanAngle(prev => (prev + 12) % 360)
    }, 150)
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
    <div className="bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-300 w-full select-none">
      {/* Luz trasera premium de fondo */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-5">
        <div className="space-y-0.5">
          <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-1">
            <HeartPulse size={9} className="text-violet-400 animate-pulse" />
            TELEMETRÍA EN VIVO Y MONITOREO DE SISTEMAS
          </span>
          <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2 text-white">
            <Activity size={14} className="text-violet-400" />
            Radar de Salud de Instancias
          </h3>
        </div>

        {/* Core Filter Pills */}
        <div className="flex flex-wrap gap-1">
          {availableCores.map(core => (
            <button
              key={core}
              onClick={() => setCoreFilter(core)}
              className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                coreFilter === core
                  ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-950/20'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {core === 'todos' ? 'Ver Todos' : `Core ${core}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid General: Sonar + Contenido Lateral */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* Columna Izquierda: Sonar Radar Circular (4 columnas en md) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-950/30 border border-slate-800/50 rounded-xl relative overflow-hidden backdrop-blur-sm">
          {/* Radar Screen (Circular Container) */}
          <div className="w-full aspect-square max-w-[210px] rounded-full border border-violet-500/20 relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_24px_rgba(0,0,0,0.9),0_0_15px_rgba(139,92,246,0.08)] bg-slate-950">
            {/* Concentric Circles Grid */}
            <div className="absolute w-[25%] h-[25%] rounded-full border border-slate-850/60 pointer-events-none" />
            <div className="absolute w-[50%] h-[50%] rounded-full border border-slate-850/60 pointer-events-none" />
            <div className="absolute w-[75%] h-[75%] rounded-full border border-slate-850/60 pointer-events-none" />
            <div className="absolute w-[100%] h-[100%] rounded-full border border-slate-800/40 pointer-events-none" />
            
            {/* Crosshair axes */}
            <div className="absolute w-full h-[1px] bg-slate-850/60 pointer-events-none" />
            <div className="absolute h-full w-[1px] bg-slate-850/60 pointer-events-none" />
            
            {/* Sonar Sweep Ray */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(139,92,246,0.18)_0deg,rgba(6,182,212,0.05)_50deg,transparent_120deg)] rounded-full animate-radar-sweep pointer-events-none" />

            {/* Plotting Blips */}
            {filteredClients.map(client => {
              const { r, angle } = getClientPolarCoords(client.id)
              const clientFailures = failures.filter(f => f.clientId.toLowerCase() === client.id.toLowerCase() && !f.resolved)
              const hasFailure = clientFailures.length > 0
              const isWarning = client.id === 'tienda-calzado-x'
              
              // Convert polar to cartesian coordinates relative to 50% center
              const x = 50 + r * Math.cos(angle)
              const y = 50 + r * Math.sin(angle)

              const isSelected = selectedClient && selectedClient.id === client.id

              let blipColor = 'bg-emerald-400 shadow-emerald-500/50'
              if (hasFailure) {
                blipColor = 'bg-red-500 shadow-red-500/60 animate-pulse'
              } else if (isWarning) {
                blipColor = 'bg-amber-400 shadow-amber-500/50'
              }

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full flex items-center justify-center transition-all duration-300 z-30 cursor-pointer ${
                    isSelected ? 'scale-[1.35] z-40' : 'hover:scale-[1.2]'
                  }`}
                  title={`${client.id} (${hasFailure ? 'Alerta' : 'Online'})`}
                >
                  {(hasFailure || isSelected) && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-blip-ping ${
                      hasFailure ? 'bg-red-400 animate-[blip-ping_1.5s_infinite]' : 'bg-violet-400 animate-[blip-ping_2s_infinite]'
                    }`} />
                  )}
                  {isSelected && (
                    <span className="absolute w-4.5 h-4.5 rounded-full border border-violet-400/80 animate-ping opacity-60" />
                  )}
                  <span className={`w-2 h-2 rounded-full shadow-[0_0_6px_rgba(0,0,0,0.6)] transition-all ${blipColor} ${
                    isSelected ? 'ring-2 ring-white border border-violet-650' : 'border border-slate-900/60'
                  }`} />
                </button>
              )
            })}
          </div>

          {/* Sonar sweep ticker */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[8px] font-mono text-slate-500">
            <span className="w-1 h-1 rounded-full bg-violet-500/35 animate-pulse" />
            <span>RADAR_SWEEP: {scanAngle.toString().padStart(3, '0')}° DEG</span>
          </div>
        </div>

        {/* Columna Derecha: Métricas, Lista y Ficha de Detalle (8 columnas en md) */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Métricas Principales Planas y Minimalistas */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-around divide-x divide-slate-800/80 text-center">
            <div className="flex-1 px-1 flex flex-col justify-center">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Uptime Global</span>
              <span className="text-[11px] font-black font-mono text-emerald-400 mt-1">{uptimeRate}%</span>
            </div>
            <div className="flex-1 px-1 flex flex-col justify-center">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Latencia Promedio</span>
              <span className="text-[11px] font-black font-mono text-violet-400 mt-1">{avgLatency} ms</span>
            </div>
            <div className="flex-1 px-1 flex flex-col justify-center">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Incidentes Activos</span>
              <span className={`text-[11px] font-black font-mono mt-1 ${activeFailures.length > 0 ? 'text-red-400' : 'text-slate-400'}`}>
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
              let statusTextClass = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'

              if (hasFailure) {
                latency = 4200 + (clientFailures.length * 450)
                lastSeenText = `falla hace ${5 + (client.id.length % 10)}s`
                statusTextClass = 'text-red-400 bg-red-500/5 border-red-500/10 animate-pulse'
              } else if (isWarning) {
                latency = 3150
                lastSeenText = 'hace 18 min'
                statusTextClass = 'text-amber-400 bg-amber-500/5 border-amber-500/10'
              }

              const isSelected = selectedClient && selectedClient.id === client.id

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-violet-950/20 border-violet-500/50'
                      : 'bg-slate-950/30 border-slate-800/40 hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-1.5 w-1.5 relative shrink-0">
                      {hasFailure && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        hasFailure ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-400'
                      }`} />
                    </span>
                    <div className="min-w-0 flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold text-slate-100 truncate block font-mono">{client.id}</span>
                      <span className="text-[7px] text-slate-400 font-mono uppercase tracking-wider shrink-0">{client.template || 'ventas'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[7px] font-black font-mono border px-1.5 py-0.5 rounded-md leading-none ${statusTextClass}`}>
                      {latency} ms
                    </span>
                    <ChevronRight size={10} className={`text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-violet-400' : ''}`} />
                  </div>
                </div>
              )
            })}
            {filteredClients.length === 0 && (
              <div className="text-center py-4 text-[10px] text-slate-500 italic">
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
            let statusClass = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'
            let latencyDesc = `${80 + (selectedClient.id.length * 17) % 180}ms (Latencia óptima)`

            if (hasFailure) {
              statusText = `${clientFailures.length} INCIDENTE(S) ACTIVO(S) ✕`
              statusClass = 'text-red-400 bg-red-500/5 border-red-500/10 animate-pulse'
              latencyDesc = `${4200 + (clientFailures.length * 450)}ms (Time-out detectado)`
            } else if (isWarning) {
              statusText = 'ADVERTENCIA EN LATENCIA ⚠️'
              statusClass = 'text-amber-400 bg-amber-500/5 border-amber-500/10'
              latencyDesc = '3150ms (Falla de enrutamiento)'
            }

            return (
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2.5 backdrop-blur-md relative overflow-hidden animate-scale-up">
                {/* Header Ficha */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-[8px] font-black text-slate-400 font-mono tracking-widest uppercase">Ficha de Telemetría</span>
                  <span className={`text-[7px] font-black font-mono border px-2 py-0.5 rounded-md ${statusClass}`}>
                    {statusText}
                  </span>
                </div>

                {/* Grid de Datos Ficha */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[9px]">
                  <div>
                    <span className="text-[7px] text-slate-400 font-black uppercase tracking-wider block">ID Cliente</span>
                    <span className="font-mono font-bold text-white truncate block mt-0.5">{selectedClient.id}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-400 font-black uppercase tracking-wider block">Core Utilizado</span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      <Layers size={9} className="text-violet-400" />
                      <span className="capitalize">{selectedClient.template || 'ventas'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-400 font-black uppercase tracking-wider block">Latencia Conexión</span>
                    <span className="font-mono text-slate-300 block mt-0.5">{latencyDesc}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-400 font-black uppercase tracking-wider block">Parámetros Marca</span>
                    <span className="font-mono text-slate-300 block mt-0.5">HSL({(selectedClient.id.length * 40) % 360}, 70%, 50%)</span>
                  </div>
                </div>

                {/* Botón de Acción */}
                <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                  {hasFailure ? (
                    <button
                      onClick={() => {
                        setSelectedErrorClientFilter(selectedClient.id)
                        setActiveTab('errors')
                      }}
                      className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-500/20 text-white text-[8px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldAlert size={9} />
                      Consola de Incidentes
                      <ArrowRight size={8} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('crm')}
                      className="px-2.5 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/20 text-white text-[8px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
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
