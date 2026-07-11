import React, { useState, useEffect, useRef } from 'react'
import {
  RefreshCw, Play, CheckCircle, AlertTriangle,
  Terminal, Loader2, Layers3, PackageCheck,
  Rocket, Hammer, GitMerge, ChevronRight, ChevronDown, Info,
  ArrowUpCircle, TrendingUp
} from 'lucide-react'

import { CLI_URL } from '../../config'
const CLI_BASE = CLI_URL

// ─── Helpers de estado ────────────────────────────────────────────────────────
const STATUS_META = {
  syncing:   { label: 'Sincronizando',  color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/25', icon: GitMerge,    pulse: true  },
  building:  { label: 'Compilando',     color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',  icon: Hammer,      pulse: true  },
  deploying: { label: 'Desplegando',    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',   icon: Rocket,      pulse: true  },
  success:   { label: 'Completado',     color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25',icon: CheckCircle, pulse: false },
  error:     { label: 'Error',          color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',    icon: AlertTriangle,pulse: false },
  pending:   { label: 'En cola',        color: 'text-zinc-400',    bg: 'bg-zinc-500/10',    border: 'border-zinc-500/20',   icon: null,        pulse: false },
}

function ClientStatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending
  const Icon = meta.icon
  return (
    <span className={`flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.color} ${meta.bg} ${meta.border} ${meta.pulse ? 'animate-pulse' : ''}`}>
      {Icon && <Icon size={8} />}
      {meta.label}
    </span>
  )
}

function VersionBadge({ clientVersion, coreVersion, isOutdated, driftCount }) {
  if (!isOutdated) {
    return (
      <span className="text-[8px] font-mono text-emerald-500 bg-emerald-500/5 border border-emerald-500/15 px-1.5 py-0.5 rounded-md">
        v{clientVersion} ✓
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-[8px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-md animate-pulse">
      v{clientVersion} <ChevronRight size={8} /> v{coreVersion}
      {driftCount > 0 && <span className="ml-0.5 opacity-80">({driftCount}Δ)</span>}
    </span>
  )
}

// ─── Estilos de logs ──────────────────────────────────────────────────────────
function getLogStyle(type) {
  switch (type) {
    case 'header':  return 'text-violet-600 dark:text-violet-400 font-bold text-xs mt-2'
    case 'command': return 'text-cyan-700 dark:text-cyan-400 font-mono text-[11px]'
    case 'stdout':  return 'text-[var(--color-text)] font-mono text-[11px] opacity-90'
    case 'stderr':  return 'text-amber-600 dark:text-amber-500/80 font-mono text-[11px]'
    case 'info':    return 'text-blue-600 dark:text-blue-400 font-semibold text-xs'
    case 'success': return 'text-emerald-600 dark:text-emerald-400 font-bold text-xs'
    case 'warn':    return 'text-amber-600 dark:text-amber-400 font-semibold text-xs'
    case 'error':   return 'text-red-600 dark:text-red-400 font-bold text-xs'
    default:        return 'text-[var(--color-text-muted)] text-[11px]'
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CoreSyncPanel({ showToast, registeredClientIds = [], onRegisterClient }) {
  const registeredSet = new Set(registeredClientIds.map(id => id.toLowerCase()))
  const [templates, setTemplates]           = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedClients, setSelectedClients]   = useState([])    // array de folderNames
  const [doDeploy, setDoDeploy]             = useState(true)
  const [clientStatuses, setClientStatuses] = useState({})
  const [registeringClients, setRegisteringClients] = useState({}) // { folderName: true } mientras registra
  const [localRegistered, setLocalRegistered]   = useState(new Set()) // IDs recién registrados en esta sesión
  const [logs, setLogs]                     = useState([])
  const [syncState, setSyncState]           = useState('idle')    // idle | running | done | error
  const [templateDropOpen, setTemplateDropOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'outdated' | 'unregistered'
  const [coreDriftCount, setCoreDriftCount] = useState(null)  // null=no chequeado, 0=al día, N=archivos pendientes
  const [bumpState, setBumpState] = useState('idle')           // idle | loading | done | error
  const logsEndRef   = useRef(null)
  const eventSourceRef = useRef(null)
  const templateDropRef = useRef(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (templateDropRef.current && !templateDropRef.current.contains(e.target)) {
        setTemplateDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])


  // ── Cargar instancias agrupadas por template ────────────────────────────────────
  const fetchInstancias = async (keepSelection = false) => {
    setLoadingTemplates(true)
    // Preservar selección si keepSelection=true
    const prevTemplateKey = keepSelection ? selectedTemplate?.key : null
    const prevSelectedClients = keepSelection ? [...selectedClients] : []
    try {
      const res  = await fetch(`${CLI_BASE}/api/instancias/list`)
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates)
        if (keepSelection && prevTemplateKey) {
          // Restaurar plantilla seleccionada con datos frescos
          const fresh = data.templates.find(t => t.key === prevTemplateKey)
          if (fresh) {
            setSelectedTemplate(fresh)
            // Restaurar solo los clientes que siguen existiendo
            const validFolders = new Set(fresh.clients.map(c => c.folderName))
            setSelectedClients(prevSelectedClients.filter(f => validFolders.has(f)))
            return
          }
        }
        if (data.templates.length > 0) {
          const first = data.templates[0]
          setSelectedTemplate(first)
          setSelectedClients(first.clients.map(c => c.folderName))
        }
      } else {
        throw new Error(data.error || 'Error al listar instancias')
      }
    } catch (err) {
      if (showToast) showToast(`Error: ${err.message}`, 'error')
    } finally {
      setLoadingTemplates(false)
    }
  }

  useEffect(() => { fetchInstancias() }, [])

  // ── Detectar drift de la plantilla Core seleccionada ────────────────────────
  const fetchCoreDrift = async (clave) => {
    if (!clave) return
    setCoreDriftCount(null)
    try {
      const res = await fetch(`${CLI_BASE}/api/cores/${clave}/drift`)
      const data = await res.json()
      if (data.success) {
        setCoreDriftCount(data.differences?.length ?? 0)
      }
    } catch (_) {
      setCoreDriftCount(null)
    }
  }

  useEffect(() => {
    if (selectedTemplate?.key) fetchCoreDrift(selectedTemplate.key)
    setBumpState('idle')
  }, [selectedTemplate?.key])

  // Auto-scroll terminal
  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // ── Registrar cliente no registrado en Firestore Central ─────────────────
  const handleRegister = async (client) => {
    if (!onRegisterClient) return
    setRegisteringClients(prev => ({ ...prev, [client.folderName]: true }))
    try {
      const ok = await onRegisterClient(client)
      if (ok) setLocalRegistered(prev => new Set([...prev, client.clientId.toLowerCase()]))
    } finally {
      setRegisteringClients(prev => ({ ...prev, [client.folderName]: false }))
    }
  }

  const handleTemplateChange = (e) => {
    const tmpl = templates.find(t => t.key === e.target.value)
    setSelectedTemplate(tmpl || null)
    setSelectedClients(tmpl ? tmpl.clients.map(c => c.folderName) : [])
    setClientStatuses({})
  }

  const toggleClient = (folderName) => {
    setSelectedClients(prev =>
      prev.includes(folderName)
        ? prev.filter(f => f !== folderName)
        : [...prev, folderName]
    )
  }

  const selectAll  = () => setSelectedClients(selectedTemplate?.clients.map(c => c.folderName) ?? [])
  const selectNone = () => setSelectedClients([])
  const selectOutdated = () => {
    const outdated = selectedTemplate?.clients.filter(c => c.isOutdated).map(c => c.folderName) ?? []
    setSelectedClients(outdated)
  }

  // ── Lanzar sincronización ────────────────────────────────────────────────
  const startSync = () => {
    if (!selectedTemplate || selectedClients.length === 0) return

    setSyncState('running')
    setLogs([])

    // Inicializar estados en "pending"
    const initial = {}
    selectedClients.forEach(f => { initial[f] = 'pending' })
    setClientStatuses(initial)

    const params = new URLSearchParams({
      templateKey: selectedTemplate.key,
      clientIds:   selectedClients.join(','),
      deploy:      String(doDeploy)
    })

    if (eventSourceRef.current) eventSourceRef.current.close()

    const es = new EventSource(`${CLI_BASE}/api/instancias/sync-and-deploy-stream?${params}`)
    eventSourceRef.current = es

    es.addEventListener('log', e => {
      const data = JSON.parse(e.data)
      setLogs(prev => [...prev, data])
    })

    es.addEventListener('client-status', e => {
      const data = JSON.parse(e.data)
      setClientStatuses(prev => ({ ...prev, [data.client]: data.status }))
    })

    // ── Sincronizar tras finalizar ────────────────────────────────────────────────
    es.addEventListener('complete', e => {
      const data = JSON.parse(e.data)
      setSyncState(data.success ? 'done' : 'error')
      es.close()
      fetchInstancias(true)   // refrescar versiones manteniendo selección
      if (showToast) {
        showToast(
          data.success
            ? 'Sincronización completada con éxito.'
            : 'Sincronización finalizada con algunos errores.',
          data.success ? 'success' : 'warning'
        )
      }
    })

    es.onerror = () => {
      setSyncState('error')
      setLogs(prev => [...prev, { text: '❌ Conexión SSE interrumpida.', type: 'error' }])
      es.close()
    }
  }

  const stopSync = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      setSyncState('idle')
      setLogs(prev => [...prev, { text: '⚠ Sincronización cancelada por el usuario.', type: 'warn' }])
    }
  }

  const outdatedCount = selectedTemplate?.clients.filter(c => c.isOutdated).length ?? 0
  const unregisteredClients = selectedTemplate?.clients.filter(
    c => !registeredSet.has(c.clientId.toLowerCase()) && !localRegistered.has(c.clientId.toLowerCase())
  ) ?? []

  // ── Bump de versión del Core ────────────────────────────────────────────────
  const handleBumpVersion = async () => {
    if (!selectedTemplate?.key || bumpState === 'loading' || syncState === 'running') return
    setBumpState('loading')
    try {
      const res = await fetch(`${CLI_BASE}/api/cores/${selectedTemplate.key}/bump-version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar versión')
      if (showToast) showToast(`Core actualizado a v${data.data.newVersion}`, 'success')
      setBumpState('done')
      // Refrescar instancias para reflejar que ahora todas están desactualizadas
      await fetchInstancias(true)
      // Resetear drift tras bump (el template CLI ya fue re-sincronizado)
      setCoreDriftCount(0)
    } catch (err) {
      if (showToast) showToast(`Error: ${err.message}`, 'error')
      setBumpState('error')
    }
  }

  const filteredClients = (selectedTemplate?.clients ?? []).filter(client => {
    const matchesSearch = 
      client.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.folderName.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    const isReg = registeredSet.has(client.clientId.toLowerCase()) || localRegistered.has(client.clientId.toLowerCase())
    if (filterMode === 'outdated') {
      return client.isOutdated
    }
    if (filterMode === 'unregistered') {
      return !isReg
    }
    return true
  })

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface-2)]/20 p-5 rounded-2xl border border-[var(--color-border)]">
        <div>
          <h2 className="text-base font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <Layers3 className="text-violet-500" size={18} />
            Sincronizador Core → Instancias Cliente
          </h2>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            Propaga físicamente el código del core a las instancias de clientes, compila y despliega en lote.
            Los archivos de configuración de marca (.env.local, .firebaserc, firebase.json) se preservan intactos.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchInstancias}
          disabled={loadingTemplates || syncState === 'running'}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={12} className={loadingTemplates ? 'animate-spin' : ''} />
          Refrescar
        </button>
      </div>

      {loadingTemplates ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="animate-spin text-violet-500" size={32} />
          <p className="text-xs text-[var(--color-text-muted)]">Escaneando instancias de clientes en disco...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[var(--color-surface-2)]/10 rounded-2xl border border-[var(--color-border)] border-dashed">
          <AlertTriangle className="text-amber-500" size={32} />
          <p className="text-xs text-[var(--color-text)] font-semibold">No se encontraron instancias de clientes</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Verifica que existan carpetas con .prototipe.json en D:/PROTOTIPE/Instancias Clientes/
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Columna Izquierda: Configuración ─────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Selector de Plantilla Core */}
            <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-5 rounded-2xl space-y-5">
              <h3 className="text-xs font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2.5">
                Configuración del Origen
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Plantilla Core
                </label>
                {/* Custom dropdown — reemplaza select nativo no estilizable */}
                <div className="relative" ref={templateDropRef}>
                  <button
                    type="button"
                    disabled={syncState === 'running'}
                    onClick={() => setTemplateDropOpen(o => !o)}
                    className="w-full h-10 px-3 flex items-center justify-between gap-2 rounded-xl border transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--color-surface-2)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {selectedTemplate ? (
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                        <span className="text-[11px] font-semibold text-violet-300 truncate">{selectedTemplate.name}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0">v{selectedTemplate.coreVersion}</span>
                        <span className="text-[9px] text-[var(--color-text-muted)] flex-shrink-0 hidden sm:inline">({selectedTemplate.nicho})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--color-text-muted)]">Seleccionar plantilla...</span>
                    )}
                    <ChevronDown
                      size={13}
                      className={`flex-shrink-0 transition-transform duration-200 ${templateDropOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </button>

                  {templateDropOpen && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden shadow-2xl"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      {templates.length === 0 && (
                        <div className="px-3 py-3 text-[10px] text-[var(--color-text-muted)] text-center">
                          Sin plantillas disponibles
                        </div>
                      )}
                      {templates.map(t => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => {
                            handleTemplateChange({ target: { value: t.key } })
                            setTemplateDropOpen(false)
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all cursor-pointer border-none ${
                            selectedTemplate?.key === t.key
                              ? 'bg-violet-500/10 border-l-2 border-violet-500/40'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                          <span className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-violet-300 truncate">{t.name}</span>
                            <span className="text-[9px] text-[var(--color-text-muted)] truncate">v{t.coreVersion} — {t.nicho}</span>
                          </span>
                          {selectedTemplate?.key === t.key && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Info del core seleccionado */}
              {selectedTemplate && (
                <div className="space-y-3">
                  {/* Tarjeta de versión del core */}
                  <div className="flex items-start gap-2 p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
                    <Info size={13} className="text-violet-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold text-violet-300">
                          Core actual: v{selectedTemplate.coreVersion}
                        </p>
                        {/* Botón Bump Version */}
                        <button
                          type="button"
                          onClick={handleBumpVersion}
                          disabled={bumpState === 'loading' || syncState === 'running'}
                          title="Incrementa la versión patch del core y marca las instancias como pendientes de actualización"
                          className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          {bumpState === 'loading'
                            ? <Loader2 size={9} className="animate-spin" />
                            : bumpState === 'done'
                              ? <CheckCircle size={9} className="text-emerald-400" />
                              : <ArrowUpCircle size={9} />
                          }
                          {bumpState === 'loading' ? 'Actualizando...' : bumpState === 'done' ? 'Actualizado' : 'Actualizar versión'}
                        </button>
                      </div>
                      <p className="text-[9px] text-[var(--color-text-muted)] font-mono truncate">
                        {selectedTemplate.corePath}
                      </p>
                      {outdatedCount > 0 && (
                        <p className="text-[9px] text-amber-400 font-semibold mt-1">
                          ⚠ {outdatedCount} instancia{outdatedCount > 1 ? 's' : ''} con versión desactualizada
                        </p>
                      )}
                      {unregisteredClients.length > 0 && (
                        <p className="text-[9px] text-red-400 font-semibold mt-0.5">
                          🔴 {unregisteredClients.length} instancia{unregisteredClients.length > 1 ? 's' : ''} sin registrar en Consola Central
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Alerta de drift del core (cambios en disco sin versionar) */}
                  {coreDriftCount !== null && coreDriftCount > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                      <TrendingUp size={13} className="text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-amber-300">
                          Cambios sin versionar detectados
                        </p>
                        <p className="text-[9px] text-amber-400/80 mt-0.5">
                          {coreDriftCount} archivo{coreDriftCount > 1 ? 's' : ''} del core difieren de la plantilla empaquetada.
                          Haz clic en &ldquo;Actualizar versión&rdquo; para versionar y propagar estos cambios.
                        </p>
                      </div>
                    </div>
                  )}
                  {coreDriftCount === 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                      <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                      <p className="text-[9px] text-emerald-400 font-semibold">Plantilla sincronizada. Sin cambios pendientes.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Toggle Deploy */}
              <div
                onClick={() => syncState !== 'running' && setDoDeploy(v => !v)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  doDeploy
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                    : 'bg-[var(--color-surface-2)]/20 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/30'
                } ${syncState === 'running' ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2">
                  <Rocket size={13} className={doDeploy ? 'text-emerald-400' : 'text-[var(--color-text-muted)]'} />
                  <div>
                    <p className={`text-[10px] font-bold ${doDeploy ? 'text-emerald-300' : 'text-[var(--color-text-muted)]'}`}>
                      Deploy a Firebase Hosting
                    </p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">
                      {doDeploy ? 'Se ejecutará firebase deploy al finalizar' : 'Solo sincronización + build local'}
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-all relative ${doDeploy ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${doDeploy ? 'left-4' : 'left-0.5'}`} />
                </div>
              </div>
            </div>

            {/* Lista de Clientes */}
            {selectedTemplate && (
              <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
                  <h3 className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    <PackageCheck size={13} className="text-violet-400" />
                    Instancias Detectadas ({selectedTemplate.clients.length})
                  </h3>
                </div>

                {selectedTemplate.clients.length > 0 && (
                  <div className="space-y-3">
                    {/* Controles de Búsqueda y Filtro */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar cliente por nombre o carpeta..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={syncState === 'running'}
                        className="w-full h-8 pl-8 pr-8 text-[11px] rounded-xl border bg-[var(--color-surface-2)]/30 border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-2 text-[var(--color-text-muted)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'outdated', label: 'Desactualizados' },
                        { id: 'unregistered', label: 'Sin Registrar' }
                      ].map(pill => (
                        <button
                          key={pill.id}
                          type="button"
                          disabled={syncState === 'running'}
                          onClick={() => setFilterMode(pill.id)}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                            filterMode === pill.id
                              ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                              : 'bg-[var(--color-surface-2)]/20 border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/40'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-bold text-violet-400 bg-[var(--color-surface-2)]/10 p-2 rounded-xl border border-[var(--color-border)]/50">
                      <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                        {filteredClients.length} filtrados
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedClients(prev => {
                            const filteredKeys = filteredClients.map(c => c.folderName)
                            return Array.from(new Set([...prev, ...filteredKeys]))
                          })}
                          disabled={syncState === 'running'}
                          className="hover:text-violet-300 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Filtrados
                        </button>
                        <span className="text-[9px] text-[var(--color-text-muted)]">|</span>
                        <button
                          type="button"
                          onClick={selectOutdated}
                          disabled={syncState === 'running'}
                          className="hover:text-violet-300 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Desactualizados
                        </button>
                        <span className="text-[9px] text-[var(--color-text-muted)]">|</span>
                        <button
                          type="button"
                          onClick={selectNone}
                          disabled={syncState === 'running'}
                          className="hover:text-violet-300 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Limpiar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate.clients.length === 0 ? (
                  <p className="text-[10px] text-[var(--color-text-muted)] py-4 text-center">
                    No hay instancias de cliente registradas para este template.
                  </p>
                ) : filteredClients.length === 0 ? (
                  <p className="text-[10px] text-[var(--color-text-muted)] py-6 text-center">
                    Ningún cliente coincide con los filtros aplicados.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[320px] min-h-[70px] overflow-y-auto pr-1 block w-full">
                    {filteredClients.map(client => {
                      const isChecked = selectedClients.includes(client.folderName)
                      const status    = clientStatuses[client.folderName]

                      return (
                        <div
                          key={client.folderName}
                          onClick={() => syncState !== 'running' && toggleClient(client.folderName)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            isChecked
                              ? 'bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20'
                              : 'bg-[var(--color-surface-2)]/20 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/30'
                          } ${syncState === 'running' ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              disabled={syncState === 'running'}
                              className="accent-violet-500 rounded"
                            />
                            <div>
                              <p className="text-xs font-bold text-[var(--color-text)]">
                                {client.clientId}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-mono text-[var(--color-text-muted)]">
                                  {client.folderName}
                                </span>
                                <VersionBadge
                                  clientVersion={client.clientVersion}
                                  coreVersion={client.coreVersion}
                                  isOutdated={client.isOutdated}
                                  driftCount={client.driftCount}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Columna derecha: estado de sync O botón de registro */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {status ? (
                              <ClientStatusBadge status={status} />
                            ) : (() => {
                              const isReg = registeredSet.has(client.clientId.toLowerCase()) || localRegistered.has(client.clientId.toLowerCase())
                              const isRegistering = registeringClients[client.folderName]
                              if (!isReg) {
                                return (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRegister(client) }}
                                    disabled={isRegistering || syncState === 'running'}
                                    className="flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-60"
                                  >
                                    {isRegistering
                                      ? <Loader2 size={7} className="animate-spin" />
                                      : '⚡'
                                    }
                                    {isRegistering ? 'Registrando...' : 'Registrar en Central'}
                                  </button>
                                )
                              }
                              return (
                                <span className="text-[9px] text-[var(--color-text-muted)]">
                                  {client.isOutdated
                                    ? `⬆ ${client.driftCount > 0 ? client.driftCount + ' archivos por sync' : 'Pendiente'}`
                                    : 'Al día ✓'}
                                </span>
                              )
                            })()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Botón de acción */}
                <div className="pt-1">
                  {syncState === 'running' ? (
                    <button
                      type="button"
                      onClick={stopSync}
                      className="w-full h-11 flex items-center justify-center gap-2 text-xs font-extrabold rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      <Loader2 className="animate-spin" size={14} />
                      Cancelar Sincronización
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startSync}
                      disabled={selectedClients.length === 0}
                      className="w-full h-11 flex items-center justify-center gap-2 text-xs font-extrabold rounded-xl border border-violet-500/30 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 transition-all cursor-pointer"
                    >
                      <Play size={12} fill="white" />
                      {doDeploy
                        ? `Sincronizar y Desplegar (${selectedClients.length})`
                        : `Sincronizar y Compilar (${selectedClients.length})`
                      }
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Columna Derecha: Terminal SSE (theme-aware) ──────────────────── */}
          <div
            className="lg:col-span-7 flex flex-col h-[560px] rounded-2xl overflow-hidden shadow-inner"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            {/* Cabecera Terminal */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <Terminal size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span
                  className="text-[10px] font-bold font-mono tracking-wider uppercase"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Consola de Sincronización (Real-Time SSE)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${syncState === 'running' ? 'bg-green-400 animate-pulse' : 'bg-red-500/80'}`} />
                <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <span className="w-2 h-2 rounded-full bg-green-500/80" />
              </div>
            </div>

            {/* Logs */}
            <div
              className="flex-1 p-4 overflow-y-auto font-mono space-y-0.5 scrollbar-thin"
              style={{ scrollbarColor: 'var(--color-border) transparent' }}
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 opacity-40 select-none">
                  <Terminal size={24} style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    Esperando inicio del motor de sincronización física...
                  </p>
                  <p className="text-[9px] mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
                    Selecciona clientes y pulsa el botón para comenzar
                  </p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={getLogStyle(log.type)}>
                    {log.text}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Footer estado */}
            {syncState !== 'idle' && (
              <div
                className={`px-4 py-2 flex items-center gap-2 text-[10px] font-bold shrink-0 ${
                  syncState === 'running' ? 'text-violet-500' :
                  syncState === 'done'    ? 'text-emerald-500' :
                                            'text-red-500'
                }`}
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                {syncState === 'running' && <Loader2 size={10} className="animate-spin" />}
                {syncState === 'done'    && <CheckCircle size={10} />}
                {syncState === 'error'   && <AlertTriangle size={10} />}
                {syncState === 'running' ? 'Sincronización en progreso...' :
                 syncState === 'done'    ? 'Sincronización completada con éxito' :
                                          'Sincronización finalizada con errores'}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}