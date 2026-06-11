import React, { useState, useEffect } from 'react'
import {
  Layers, CheckCircle, StopCircle, Play, Copy, ChevronDown, ChevronRight,
  Zap, RefreshCw, Trash2, ArrowRight, Check, X
} from 'lucide-react'
import CustomSelect from '../ui/CustomSelect'

const CLI_URL = 'http://localhost:3001'

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

export default function CoreCard({ core, coreOptions, showToast, loadCores }) {
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

  // UX de doble confirmación
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

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
          } catch {}
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
                <button
                  onClick={() => runAction(`/api/cores/${core.clave}/activate`, {})}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 disabled:opacity-40 text-amber-400 border border-amber-500/30 text-[11px] px-2 py-1.5 rounded-lg transition-all font-semibold mt-auto cursor-pointer"
                >
                  {actionLoading ? <RefreshCw size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  Sync → CLI
                </button>
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
    </div>
  )
}
