import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Layers, CheckCircle, StopCircle, Play, Copy, ChevronDown, ChevronRight,
  Zap, RefreshCw, Trash2, ArrowRight, ArrowUpRight, Check, X, Eye
} from 'lucide-react'
import CustomSelect from '../ui/CustomSelect'

import { CLI_URL } from '../../config'

const STATUS = {
  active:   { label: 'Activo',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  inactive: { label: 'Inactivo',  cls: 'bg-slate-500/15  text-slate-400   border-slate-500/30'   },
}

function Badge({ activo }) {
  const s = activo ? STATUS.active : STATUS.inactive
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  )
}

function LogLine({ line }) {
  const isError = line.toLowerCase().includes('error') || line.startsWith('❌')
  const isOk    = line.startsWith('✅') || line.startsWith('📄') || line.startsWith('📁')
  return (
    <p className={`text-[11px] font-mono leading-relaxed ${
      isError ? 'text-red-400' : isOk ? 'text-emerald-400' : 'text-slate-400'
    }`}>{line}</p>
  )
}

export default function CoreCard({ 
  core, 
  coreOptions, 
  showToast, 
  loadCores, 
  allClientesControl = [], 
  failures = [], 
  onRequestTelemetry,
  onManageClient,
  localServers = {},
  onStartLocalServer,
  onStopLocalServer
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [scaffoldBase, setScaffoldBase] = useState('')
  
  // Estados específicos de la tarjeta
  const [auditData, setAuditData] = useState(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [envVars, setEnvVars] = useState({})
  const [envLoading, setEnvLoading] = useState(false)
  const [deployLogs, setDeployLogs] = useState([])
  const [deploying, setDeploying] = useState(false)
  const [auditFailedData, setAuditFailedData] = useState(null)
  const [fixing, setFixing] = useState({})
  const [actionLogs, setActionLogs] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  
  // Estados para visualizador de diferencias y drift del Core
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [diffData, setDiffData] = useState(null)
  const [loadingDiff, setLoadingDiff] = useState(false)
  const [expandedFile, setExpandedFile] = useState(null)
  const [fileDiffs, setFileDiffs] = useState({})
  const [loadingFileDiff, setLoadingFileDiff] = useState({})

  const toggleExpandFile = async (filename, isBinary) => {
    if (expandedFile === filename) {
      setExpandedFile(null)
      return
    }

    if (isBinary) {
      setExpandedFile(filename)
      return
    }

    setExpandedFile(filename)

    if (fileDiffs[filename]) {
      return
    }

    setLoadingFileDiff(prev => ({ ...prev, [filename]: true }))
    try {
      const res = await fetch(`${CLI_URL}/api/cores/${core.clave}/diff?file=${encodeURIComponent(filename)}`)
      const data = await res.json()
      if (data.success) {
        setFileDiffs(prev => ({ ...prev, [filename]: data.diff }))
      } else {
        showToast?.(data.error || `No se pudo calcular el diff para ${filename}`, 'error')
      }
    } catch (err) {
      showToast?.(`Error de red al calcular el diff del archivo: ${filename}`, 'error')
    } finally {
      setLoadingFileDiff(prev => ({ ...prev, [filename]: false }))
    }
  }

  // UX de doble confirmación
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const fetchCoreDrift = async (silent = false) => {
    if (!silent) setLoadingDiff(true)
    try {
      const res = await fetch(`${CLI_URL}/api/cores/${core.clave}/drift`)
      const data = await res.json()
      if (data.success) {
        setDiffData(data)
        if (!silent) setShowDiffModal(true)
      } else {
        showToast?.(data.error || 'Error al calcular diferencias.', 'error')
      }
    } catch (err) {
      showToast?.('Error de red al conectar con el backend CLI.', 'error')
    } finally {
      if (!silent) setLoadingDiff(false)
    }
  }

  const syncCoreFromModal = async () => {
    setLoadingDiff(true)
    try {
      const res = await fetch(`${CLI_URL}/api/cores/${core.clave}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prune: true })
      })
      const data = await res.json()
      if (data.success) {
        showToast?.('Sincronización completada correctamente.', 'success')
        if (loadCores) loadCores()
        await fetchCoreDrift(true)
      } else {
        showToast?.(data.error || 'Error al sincronizar.', 'error')
      }
    } catch (err) {
      showToast?.('Error al conectar con la API de sincronización.', 'error')
    } finally {
      setLoadingDiff(false)
    }
  }

  const runAudit = async () => {
    setAuditLoading(true)
    try {
      const res = await fetch(`${CLI_URL}/api/project/audit?clientId=${core.clave}`)
      const data = await res.json()
      if (data.success) {
        setAuditData(data)
      } else {
        throw new Error(data.report?.message || 'Error en auditoría')
      }
    } catch (err) {
      showToast?.(`Error de auditoría: ${err.message}`, 'error')
    } finally {
      setAuditLoading(false)
    }
  }

  const loadEnv = async () => {
    setEnvLoading(true)
    try {
      const res = await fetch(`${CLI_URL}/api/project/env?clientId=${core.clave}`)
      const data = await res.json()
      if (data.success) {
        setEnvVars(data.variables || {})
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.warn(`No se pudo cargar .env.local para ${core.clave}:`, err)
    } finally {
      setEnvLoading(false)
    }
  }

  const saveEnv = async () => {
    setEnvLoading(true)
    try {
      const res = await fetch(`${CLI_URL}/api/project/env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: core.clave, variables: envVars })
      })
      const data = await res.json()
      if (data.success) {
        showToast?.('Archivo .env.local guardado con éxito.', 'success')
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      showToast?.(`Error al guardar .env.local: ${err.message}`, 'error')
    } finally {
      setEnvLoading(false)
    }
  }

  const handleRunDeploy = async (force = false) => {
    if (deploying) return
    setDeploying(true)
    setDeployLogs(['🚀 Iniciando proceso de compilación y despliegue...'])
    setAuditFailedData(null)

    try {
      const response = await fetch(`${CLI_URL}/api/project/deploy${force ? '?force=true' : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: core.clave })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.replace(/^data:\s*/, '').trim()
          if (!line) continue
          try {
            const event = JSON.parse(line)
            if (event.type === 'log') {
              setDeployLogs(prev => [...prev, event.line])
            } else if (event.type === 'audit_failed') {
              setDeploying(false)
              setAuditFailedData({
                score: event.score,
                warnings: event.warnings,
                fixes: event.fixes
              })
              showToast?.(`La auditoría falló con ${event.score}/100. Corrige los errores para desplegar.`, 'warning')
            } else if (event.type === 'result') {
              if (event.success) {
                showToast?.('¡Despliegue completado con éxito!', 'success')
              } else {
                showToast?.(`Fallo en despliegue: ${event.error}`, 'error')
              }
            }
          } catch { /* Ignorar fragmentos SSE incompletos. */ }
        }
      }
    } catch (err) {
      setDeployLogs(prev => [...prev, `❌ Error: ${err.message}`])
    } finally {
      setDeploying(false)
    }
  }

  const downloadLogs = () => {
    if (deployLogs.length === 0) return
    const text = deployLogs.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deploy_logs_${core.clave}_${Date.now()}.log`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleApplyFix = async (type) => {
    setFixing(p => ({ ...p, [type]: true }))
    try {
      const res = await fetch(`${CLI_URL}/api/project/fix/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: core.clave })
      })
      const data = await res.json()
      if (data.success) {
        showToast?.(data.message, 'success')
        setAuditFailedData(null)
        await runAudit()
        handleRunDeploy()
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      showToast?.(`Error al aplicar corrección: ${err.message}`, 'error')
    } finally {
      setFixing(p => ({ ...p, [type]: false }))
    }
  }

  const runAction = async (endpoint, body = {}) => {
    setActionLoading(true)
    setActionLogs([`⏳ Iniciando: ${endpoint}...`])
    try {
      const res = await fetch(`${CLI_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Error desconocido')

      const logs = []
      if (data.data?.copied)   logs.push(...data.data.copied.map(f => `📄 Copiado: ${f}`))
      if (data.data?.synced)   logs.push(...data.data.synced.map(f => `✅ Sincronizado: ${f}`))
      if (data.data?.archivosCreados) logs.push(...data.data.archivosCreados.map(f => `📄 Creado: ${f}`))
      logs.push(`✅ ${data.message}`)

      setActionLogs(logs)
      showToast?.(data.message, 'success')
      await loadCores()
    } catch (err) {
      setActionLogs([`❌ Error: ${err.message}`])
      showToast?.(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const toggleExpand = () => {
    const nextVal = !isExpanded
    setIsExpanded(nextVal)
    if (nextVal) {
      runAudit()
      loadEnv()
    }
  }

  return (
    <div
      className={`bg-[var(--color-surface)]/60 border rounded-2xl transition-all backdrop-blur-sm relative ${
        isExpanded ? 'z-20 shadow-lg' : 'z-0'
      } ${
        core.activo ? 'border-emerald-500/20' : 'border-[var(--color-border)]'
      }`}
    >
      {/* Header del core */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--color-surface-2)]/30 rounded-t-2xl transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${core.activo ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--color-text)]">
                App {core.clave.charAt(0).toUpperCase() + core.clave.slice(1)}
              </span>
              <Badge activo={core.activo} />
              <span className="text-[10px] text-slate-600 font-mono">v{core.version}</span>
            </div>
            <p className="text-[11px] text-slate-500">{core.nicho}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {core.activo ? (
            <button
              onClick={e => { e.stopPropagation(); runAction(`/api/cores/${core.clave}/deactivate`, {}) }}
              disabled={actionLoading}
              className="flex items-center gap-1 text-[10px] bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 border border-slate-600/50 hover:border-red-500/30 text-slate-400 px-2 py-1 rounded-lg transition-all cursor-pointer"
            >
              <StopCircle size={11} /> Desactivar
            </button>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); runAction(`/api/cores/${core.clave}/activate`, {}) }}
              disabled={actionLoading}
              className="flex items-center gap-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 px-2 py-1 rounded-lg transition-all cursor-pointer"
            >
              {actionLoading ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
              Activar
            </button>
          )}
          {!core.activo && (
            isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/20 rounded-lg p-0.5" onClick={e => e.stopPropagation()}>
                <span className="text-[9px] font-bold text-red-400 px-1">¿Eliminar?</span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    setActionLoading(true);
                    try {
                      const res = await fetch(`${CLI_URL}/api/cores/${core.clave}`, { method: 'DELETE' });
                      const contentType = res.headers.get("content-type");
                      if (!res.ok || !contentType || !contentType.includes("application/json")) {
                        throw new Error(`El CLI Bridge no tiene la ruta activa. Asegúrate de reiniciar el servidor CLI local.`);
                      }
                      const data = await res.json();
                      if (data.success) {
                        showToast?.(data.message, 'success');
                        await loadCores();
                      } else {
                        throw new Error(data.error);
                      }
                    } catch (err) {
                      showToast?.(err.message, 'error');
                    } finally {
                      setActionLoading(false);
                      setIsConfirmingDelete(false);
                    }
                  }}
                  className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors cursor-pointer border-none bg-transparent"
                  title="Confirmar eliminación total"
                >
                  <Check size={11} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsConfirmingDelete(false); }}
                  className="p-1 hover:bg-slate-700 text-slate-400 rounded transition-colors cursor-pointer border-none bg-transparent"
                  title="Cancelar"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); setIsConfirmingDelete(true); }}
                disabled={actionLoading}
                className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                title="Eliminar plantilla"
              >
                <Trash2 size={13} />
              </button>
            )
          )}
          {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
        </div>
      </div>

      {/* Panel expandido */}
      {isExpanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-4 space-y-4">

          {/* Rutas de referencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-2.5">
              <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Código fuente</p>
              <p className="text-[10px] font-mono text-slate-400 break-all">{core.fuente}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-2.5">
              <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Template CLI</p>
              <p className="text-[10px] font-mono text-slate-400 break-all">{core.destino}</p>
            </div>
          </div>

          {/* Acciones del ciclo de vida */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Acciones del Ciclo de Vida</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

              {/* Scaffold */}
              <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-violet-400" />
                  <span className="text-xs font-semibold text-[var(--color-text)]">Scaffold</span>
                </div>
                <p className="text-[10px] text-slate-500">Copia código base de otro core como punto de partida.</p>
                <CustomSelect
                  value={scaffoldBase}
                  onChange={setScaffoldBase}
                  options={[
                    { value: '', label: '-- Seleccionar --' },
                    { value: 'core-seed', label: '🌱 Semilla Limpia (Core Seed)' },
                    ...coreOptions.filter(k => k !== core.clave).map(k => ({
                      value: k,
                      label: `App ${k.charAt(0).toUpperCase() + k.slice(1)}`
                    }))
                  ]}
                  placeholder="-- Seleccionar Core base --"
                  icon={Layers}
                />
                <button
                  onClick={() => {
                    if (!scaffoldBase) { showToast?.('Selecciona un core base.', 'error'); return }
                    runAction(`/api/cores/${core.clave}/scaffold`, { baseCore: scaffoldBase })
                  }}
                  disabled={actionLoading || !scaffoldBase}
                  className="w-full flex items-center justify-center gap-1.5 bg-violet-600/20 hover:bg-violet-600/30 disabled:opacity-40 text-violet-400 border border-violet-500/30 text-[11px] px-2 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                >
                  {actionLoading ? <RefreshCw size={11} className="animate-spin" /> : <Copy size={11} />}
                  Aplicar Scaffold
                </button>
              </div>

              {/* Sincronizar al template */}
              <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" />
                  <span className="text-xs font-semibold text-[var(--color-text)]">Sincronizar</span>
                </div>
                <p className="text-[10px] text-slate-500">Copia el código del core a templates/ del CLI sin activar en el wizard.</p>
                <div className="flex-1" />
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => runAction(`/api/cores/${core.clave}/sync`, {})}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1 bg-amber-600/20 hover:bg-amber-600/30 disabled:opacity-40 text-amber-400 border border-amber-500/30 text-[10px] px-1 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                  >
                    {actionLoading ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                    Sync
                  </button>
                  <button
                    onClick={() => fetchCoreDrift()}
                    disabled={loadingDiff || actionLoading}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border border-slate-700 text-[10px] px-1 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                  >
                    {loadingDiff ? <RefreshCw size={10} className="animate-spin" /> : <Eye size={10} />}
                    Diferencias
                  </button>
                </div>
              </div>

              {/* Estado Wizard */}
              <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  {core.activo ? <StopCircle size={13} className="text-red-400" /> : <CheckCircle size={13} className="text-emerald-400" />}
                  <span className="text-xs font-semibold text-[var(--color-text)]">Estado Wizard</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {core.activo
                    ? 'Esta plantilla aparece en el wizard de creación de clientes.'
                    : 'Esta plantilla NO aparece en el wizard aún.'}
                </p>
                <button
                  onClick={() => core.activo
                    ? runAction(`/api/cores/${core.clave}/deactivate`, {})
                    : runAction(`/api/cores/${core.clave}/activate`, {})
                  }
                  disabled={actionLoading}
                  className={`w-full flex items-center justify-center gap-1.5 text-[11px] px-2 py-1.5 rounded-lg transition-all font-semibold border disabled:opacity-40 mt-auto cursor-pointer ${
                    core.activo
                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {actionLoading ? <RefreshCw size={11} className="animate-spin" /> : core.activo ? <StopCircle size={11} /> : <Play size={11} />}
                  {core.activo ? 'Desactivar del Wizard' : 'Activar en Wizard'}
                </button>
              </div>
            </div>
          </div>

          {/* Sección 1: Auditoría de Calidad & PWA */}
          <div className="bg-[var(--color-surface-2)]/25 border border-[var(--color-border)] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
              <span className="text-xs font-extrabold text-[var(--color-text)] uppercase tracking-wider">Auditoría de Calidad & PWA</span>
              <button
                onClick={runAudit}
                disabled={auditLoading}
                className="h-7 px-3 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text)] border border-[var(--color-border)] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={11} className={auditLoading ? "animate-spin" : ""} />
                Recalcular
              </button>
            </div>

            {auditLoading ? (
              <div className="flex justify-center py-4">
                <RefreshCw size={16} className="animate-spin text-indigo-500" />
              </div>
            ) : auditData ? (() => {
              if (!auditData.compiled) {
                return (
                  <p className="text-xs text-amber-400 font-semibold">{auditData.report?.message}</p>
                )
              }
              const score = auditData.score || 0
              const strokeDashoffset = 251.2 - (251.2 * score) / 100
              return (
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Medidor Circular */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <svg className="w-16 h-16" viewBox="0 0 100 100">
                      <circle className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50"/>
                      <circle className={score >= 90 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-red-500"} strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" transform="rotate(-90 50 50)"/>
                      <text x="50" y="55" textAnchor="middle" className="text-sm font-black fill-[var(--color-text)] font-sans">{score}</text>
                    </svg>
                  </div>

                  {/* Checklist */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-md border ${
                        auditData.report.hasManifest ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"
                      }`}>
                        Manifiesto PWA
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border ${
                        auditData.report.hasServiceWorker ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"
                      }`}>
                        Service Worker (Offline)
                      </span>
                      <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                        JS: {auditData.report.jsTotalSize}
                      </span>
                      <span className="bg-blue-500/15 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-md">
                        CSS: {auditData.report.cssTotalSize}
                      </span>
                    </div>

                    {auditData.report.warnings.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {auditData.report.warnings.map((warn, idx) => (
                          <p key={idx} className="text-[10px] text-amber-400 font-medium flex items-start gap-1">
                            <span>⚠</span> <span className="break-all">{warn}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })() : (
              <p className="text-xs text-[var(--color-text-muted)] italic">Auditoría no iniciada. Haz clic en recalcular.</p>
            )}
          </div>

          {/* Sección 2: Variables de Entorno (.env.local) */}
          <div className="bg-[var(--color-surface-2)]/25 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--color-text)] uppercase tracking-wider">Variables .env.local</span>
              <div className="flex gap-2">
                <button
                  onClick={loadEnv}
                  disabled={envLoading}
                  className="text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] px-2 py-1 rounded-lg hover:text-[var(--color-text)] cursor-pointer"
                >
                  Recargar
                </button>
                <button
                  onClick={saveEnv}
                  disabled={envLoading}
                  className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-500 font-bold cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>

            {envLoading ? (
              <div className="flex justify-center py-4">
                <RefreshCw size={16} className="animate-spin text-indigo-500" />
              </div>
            ) : envVars && Object.keys(envVars).length > 0 ? (
              <div className="space-y-2">
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {Object.entries(envVars).map(([key, val]) => (
                    <div key={key} className="flex gap-2 items-center">
                      <span className="text-[10px] font-mono font-bold text-slate-400 w-1/3 truncate select-all" title={key}>{key}</span>
                      <input
                        className="flex-1 bg-slate-900 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-[11px] text-[var(--color-text)] font-mono outline-none focus:border-indigo-500 transition-colors"
                        value={val}
                        onChange={(e) => {
                          const nextVal = e.target.value
                          setEnvVars(p => ({ ...p, [key]: nextVal }))
                        }}
                      />
                      {confirmingDeleteKey === key ? (
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => {
                              const nextVars = { ...envVars }
                              delete nextVars[key]
                              setEnvVars(nextVars)
                              setConfirmingDeleteKey(null)
                            }}
                            className="text-[9px] bg-red-600/30 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-md font-bold cursor-pointer hover:bg-red-600/40"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteKey(null)}
                            className="text-[9px] bg-slate-700/50 text-slate-400 border border-slate-600/30 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-slate-700/70"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingDeleteKey(key)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Agregar nueva variable */}
                <div className="flex gap-2 pt-2 border-t border-[var(--color-border)] border-dashed">
                  <input
                    id={`new-key-${core.clave}`}
                    placeholder="CLAVE_VAR"
                    className="w-1/3 bg-slate-900 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-[10px] text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                  />
                  <input
                    id={`new-val-${core.clave}`}
                    placeholder="valor"
                    className="flex-1 bg-slate-900 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-[10px] text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      const kInput = document.getElementById(`new-key-${core.clave}`)
                      const vInput = document.getElementById(`new-val-${core.clave}`)
                      const key = kInput?.value?.trim()?.toUpperCase()
                      const val = vInput?.value?.trim()
                      if (key && val) {
                        const envKeyRegex = /^[A-Z_][A-Z0-9_]*$/;
                        if (!envKeyRegex.test(key)) {
                          showToast?.('La clave debe contener solo letras mayúsculas, números y guiones bajos (ej: VITE_API_KEY).', 'error')
                          return
                        }
                        setEnvVars(p => ({ ...p, [key]: val }))
                        if (kInput) kInput.value = ''
                        if (vInput) vInput.value = ''
                      } else {
                        showToast?.('Ingresa clave y valor.', 'error')
                      }
                    }}
                    className="bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text)] px-3 text-[11px] font-bold rounded-xl cursor-pointer"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] italic">No se encontraron variables de entorno local o el archivo no existe aún.</p>
            )}
          </div>

          {/* Sección 3: Consola de Despliegue de Hosting */}
          <div className="bg-[var(--color-surface-2)]/25 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--color-text)] uppercase tracking-wider">Firebase Hosting Deploy</span>
              <div className="flex gap-2">
                {deployLogs.length > 0 && (
                  <button
                    onClick={downloadLogs}
                    className="h-7 px-3 rounded-lg text-[10px] font-extrabold flex items-center gap-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50 transition-all cursor-pointer"
                  >
                    Descargar Log (.log)
                  </button>
                )}
                <button
                  onClick={() => handleRunDeploy()}
                  disabled={deploying}
                  className={`h-7 px-3 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    deploying
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold'
                  }`}
                >
                  {deploying ? (
                    <><RefreshCw size={11} className="animate-spin" /> Desplegando...</>
                  ) : (
                    <><Play size={11} /> Compilar & Desplegar</>
                  )}
                </button>
              </div>
            </div>

            {(deployLogs.length > 0 || deploying) && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-40 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-0.5">
                {deployLogs.map((line, idx) => {
                  const isErr = line.startsWith('❌') || line.startsWith('⚠') || line.toLowerCase().includes('error')
                  const isOk = line.startsWith('✅') || line.startsWith('🎉') || line.startsWith('✓')
                  return (
                    <p key={idx} className={isErr ? 'text-red-400' : isOk ? 'text-emerald-400' : 'text-slate-400'}>
                      {line}
                    </p>
                  )
                })}
              </div>
            )}

            {auditFailedData && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                  <StopCircle size={12} />
                  <span>Auditoría Fallida: {auditFailedData.score}/100</span>
                </div>
                
                <p className="text-[10px] text-red-300/80 leading-relaxed">
                  El proyecto no cumple con los estándares mínimos de calidad (90/100). Corrige los fallos o utiliza uno de los siguientes arreglos rápidos automáticos:
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {auditFailedData.fixes.chunks && (
                    <button
                      onClick={() => handleApplyFix('chunks')}
                      disabled={fixing.chunks}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                    >
                      {fixing.chunks ? <RefreshCw size={10} className="animate-spin" /> : <Play size={10} />}
                      Optimizar Chunks de Vite
                    </button>
                  )}

                  {auditFailedData.fixes.pwa && (
                    <button
                      onClick={() => handleApplyFix('pwa')}
                      disabled={fixing.pwa}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                    >
                      {fixing.pwa ? <RefreshCw size={10} className="animate-spin" /> : <Play size={10} />}
                      Reparar PWA
                    </button>
                  )}

                  {auditFailedData.fixes.rules && (
                    <button
                      onClick={() => handleApplyFix('rules')}
                      disabled={fixing.rules}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                    >
                      {fixing.rules ? <RefreshCw size={10} className="animate-spin" /> : <Play size={10} />}
                      Restablecer Reglas de Seguridad
                    </button>
                  )}

                  <button
                    onClick={() => handleRunDeploy(true)}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Play size={10} />
                    Forzar Despliegue
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sección 4: Monitoreo y Telemetría de Desarrollo */}
          {(() => {
            const devClientId = `${core.clave}-smartfix`;
            const devConfig = allClientesControl.find(c => c.id.toLowerCase() === devClientId.toLowerCase() || c.id.toLowerCase() === core.clave.toLowerCase());
            
            if (!devConfig) {
              return (
                <div className="bg-[var(--color-surface-2)]/25 border border-[var(--color-border)] rounded-2xl p-4">
                  <span className="text-xs font-extrabold text-[var(--color-text)] uppercase tracking-wider block mb-1">Monitoreo de Desarrollo</span>
                  <p className="text-[10px] text-slate-500 italic">No se detectó registro de telemetría activo en Firestore para "{devClientId}".</p>
                </div>
              );
            }

            const lastPing = devConfig.lastPingResponse;
            const pingDate = lastPing ? (lastPing.seconds ? new Date(lastPing.seconds * 1000) : new Date(lastPing)) : null;

            // Filtrar fallos de este core
            const coreFailures = failures.filter(f => f.clientId === devConfig.id && !f.resolved);

            // Estado del servidor local
            const server = localServers[devConfig.id] || { running: false, url: '', loading: false };

            return (
              <div className="bg-[var(--color-surface-2)]/25 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-extrabold text-[var(--color-text)] uppercase tracking-wider">Monitoreo & Acciones de Desarrollo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 space-y-1 flex flex-col justify-center">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Estado del Core</p>
                    <p className="text-[11px] text-slate-300 font-medium">Instancia de pruebas: <span className="font-mono text-indigo-400">{devConfig.id}</span></p>
                    <p className="text-[11px] text-slate-300 font-medium">Último Ping: <span className="text-slate-400">{pingDate ? pingDate.toLocaleString() : 'Nunca'}</span></p>
                  </div>

                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Fallos en Desarrollo</p>
                    {coreFailures.length === 0 ? (
                      <p className="text-[10px] text-emerald-400/90 font-medium italic">✅ Cero errores detectados en desarrollo.</p>
                    ) : (
                      <div className="space-y-1 max-h-20 overflow-y-auto scrollbar-thin">
                        {coreFailures.slice(0, 3).map((f, idx) => (
                          <div key={idx} className="text-[9px] text-red-400 bg-red-950/20 border border-red-500/10 p-1 rounded font-mono truncate" title={f.message}>
                            🚨 {f.message || 'Error desconocido'}
                          </div>
                        ))}
                        {coreFailures.length > 3 && (
                          <p className="text-[8px] text-slate-500">Y {coreFailures.length - 3} errores más en el log.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones de Despliegue Local y Gestión */}
                <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-3 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {server.loading ? (
                      <button disabled className="px-3 py-1.5 bg-violet-600/10 text-violet-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5 opacity-50 border border-violet-500/15 cursor-not-allowed">
                        <RefreshCw size={11} className="animate-spin" />
                        Procesando...
                      </button>
                    ) : server.running ? (
                      <>
                        <a href={server.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-violet-600 hover:bg-violet-550 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-md">
                          <ArrowUpRight size={11} className="mr-0.5" />
                          Ir a Local
                        </a>
                        <button onClick={() => onStopLocalServer(devConfig.id)} className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all border border-red-500/15">
                          <StopCircle size={11} />
                          Detener
                        </button>
                      </>
                    ) : (
                      <button onClick={() => onStartLocalServer(devConfig.id)} className="px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all border border-violet-500/15">
                        <Play size={11} />
                        Desplegar en Local
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onManageClient?.(devConfig.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-md"
                  >
                    Gestionar Instancia (Drift y Config)
                    <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Log de acciones del ciclo de vida */}
          {actionLogs.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-3 max-h-40 overflow-y-auto space-y-0.5">
              <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-2">Log de ejecución</p>
              {actionLogs.map((line, i) => <LogLine key={i} line={line} />)}
              {actionLoading && <p className="text-[11px] font-mono text-indigo-400 animate-pulse">⏳ Procesando...</p>}
            </div>
          )}
        </div>
      )}

      {/* Modal de diferencias y drift de plantillas Core */}
      {showDiffModal && diffData && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-4xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/20">
              <div className="flex items-center gap-2">
                <Layers className="text-amber-400" size={18} />
                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  Auditoría de Sincronización — Core "{core.clave.toUpperCase()}"
                </h3>
              </div>
              <button 
                onClick={() => { setShowDiffModal(false); setExpandedFile(null); }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Sección de Resumen y Paridad */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--color-surface-2)]/40 p-4 border border-[var(--color-border)] rounded-xl">
                <div className="flex items-center gap-4">
                  {/* Círculo SVG de paridad */}
                  <div className="relative flex items-center justify-center w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          diffData.parityPercent === 100 
                            ? 'text-emerald-400' 
                            : diffData.parityPercent >= 90 
                            ? 'text-amber-400' 
                            : 'text-red-400'
                        }
                        strokeDasharray={`${diffData.parityPercent}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-base font-bold text-[var(--color-text)]">
                        {diffData.parityPercent}%
                      </span>
                      <span className="text-[8px] text-slate-500 font-semibold tracking-wider uppercase">Paridad</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text)]">
                      {diffData.parityPercent === 100 
                        ? 'Sincronización Perfecta' 
                        : 'Desviaciones Detectadas'}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {diffData.parityPercent === 100
                        ? 'La plantilla en la CLI tiene paridad física absoluta con el código de desarrollo.'
                        : `El Core tiene ${diffData.differences.length} archivo(s) con desajustes o pendientes.`}
                    </p>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Archivos Idénticos: {diffData.syncedCount} / {diffData.totalCount}
                    </div>
                  </div>
                </div>

                {/* Acciones de Sincronización del Modal */}
                {diffData.parityPercent < 100 && (
                  <button
                    onClick={syncCoreFromModal}
                    disabled={loadingDiff}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md cursor-pointer"
                  >
                    {loadingDiff ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    Sincronizar Core → CLI
                  </button>
                )}
              </div>

              {/* Contenido de Diferencias */}
              {diffData.differences.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900/10 border border-dashed border-[var(--color-border)] rounded-xl">
                  <CheckCircle className="text-emerald-400 mb-2" size={24} />
                  <p className="text-xs font-bold text-slate-300">Todo el código está sincronizado.</p>
                  <p className="text-[10px] text-slate-500 mt-1">No hay diferencias ni archivos pendientes por copiar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Lista de archivos faltantes (pendientes por copiar) */}
                  {diffData.differences.some(d => d.status === 'missing_in_template') && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        📁 Pendientes por Sincronizar (No existen en el CLI)
                      </h5>
                      <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl p-3">
                        <ul className="space-y-1.5">
                          {diffData.differences
                            .filter(d => d.status === 'missing_in_template')
                            .map((diff, idx) => (
                              <li key={idx} className="flex items-center justify-between text-[11px] font-mono text-slate-300 border-b border-[var(--color-border)]/30 pb-1.5 last:border-0 last:pb-0">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  {diff.file}
                                </span>
                                <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-semibold">
                                  Pendiente
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Lista de archivos huérfanos/obsoletos en la plantilla CLI */}
                  {diffData.differences.some(d => d.status === 'orphan_in_template') && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                        🗑️ Archivos Obsoletos en el CLI (Serán eliminados al Sincronizar)
                      </h5>
                      <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl p-3">
                        <ul className="space-y-1.5">
                          {diffData.differences
                            .filter(d => d.status === 'orphan_in_template')
                            .map((diff, idx) => (
                              <li key={idx} className="flex items-center justify-between text-[11px] font-mono text-slate-300 border-b border-[var(--color-border)]/30 pb-1.5 last:border-0 last:pb-0">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                  {diff.file}
                                </span>
                                <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 font-semibold">
                                  Obsoleto
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Lista de archivos modificados con acordeones de diffs */}
                  {diffData.differences.some(d => d.status === 'modified') && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                        📝 Archivos Modificados (Diferencias de código)
                      </h5>
                      <div className="space-y-2">
                        {diffData.differences
                          .filter(d => d.status === 'modified')
                          .map((diff, idx) => {
                            const isExpanded = expandedFile === diff.file;
                            const isCurrentFileLoading = loadingFileDiff[diff.file];
                            const currentDiff = fileDiffs[diff.file];
                            return (
                              <div key={idx} className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl overflow-hidden">
                                
                                {/* Botón Acordeón Cabecera */}
                                <button
                                  onClick={() => toggleExpandFile(diff.file, diff.isBinary)}
                                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-2)]/60 transition-colors cursor-pointer text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    <ChevronDown 
                                      size={14} 
                                      className={`text-slate-400 transition-transform ${isExpanded ? 'transform rotate-180' : 'transform -rotate-90'}`} 
                                    />
                                    <span className="text-[11px] font-mono text-[var(--color-text)] font-semibold">
                                      {diff.file}
                                    </span>
                                  </div>
                                  <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-semibold font-mono">
                                    Modificado
                                  </span>
                                </button>

                                {/* Previsualizador de Diff (Cuerpo del Acordeón) */}
                                {isExpanded && (
                                  <div className="border-t border-[var(--color-border)] bg-[#070b13] p-4 overflow-x-auto max-h-[350px] overflow-y-auto font-mono text-[10px] leading-relaxed">
                                    {diff.isBinary ? (
                                      <p className="text-slate-400 italic">Archivo binario modificado (sin previsualización de diferencias de texto).</p>
                                    ) : isCurrentFileLoading ? (
                                      <div className="flex items-center gap-2 text-indigo-400 animate-pulse py-2">
                                        <RefreshCw size={12} className="animate-spin" />
                                        <span>Calculando diferencias del archivo...</span>
                                      </div>
                                    ) : !currentDiff ? (
                                      <p className="text-slate-400 italic">No se pudieron cargar las diferencias.</p>
                                    ) : (
                                      <div className="space-y-0.5">
                                        {currentDiff.map((part, pIdx) => {
                                          const isAdd = part.added;
                                          const isRem = part.removed;
                                          const colorCls = isAdd 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500/50' 
                                            : isRem 
                                            ? 'bg-red-500/10 text-red-400 border-l-2 border-l-red-500/50 line-through' 
                                            : 'text-slate-400 pl-1';
                                          const prefix = isAdd ? '+' : isRem ? '-' : ' ';
                                          
                                          return part.value.split('\n').map((line, lIdx) => {
                                            if (lIdx === part.value.split('\n').length - 1 && line === '') return null;
                                            return (
                                              <div key={`${pIdx}-${lIdx}`} className={`flex items-start ${colorCls} py-0.5 px-2`}>
                                                <span className="w-4 select-none opacity-50 mr-1 text-right">{prefix}</span>
                                                <pre className="whitespace-pre-wrap flex-1">{line}</pre>
                                              </div>
                                            );
                                          });
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/20 flex items-center justify-end">
              <button
                onClick={() => { setShowDiffModal(false); setExpandedFile(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
