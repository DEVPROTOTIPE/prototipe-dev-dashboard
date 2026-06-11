import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  GitBranch, RefreshCw, Terminal, ShieldAlert, CheckCircle,
  AlertTriangle, ChevronRight, Layers, FolderOpen, Play, StopCircle,
  Trash2, Zap, GitCommit, Upload, Server, X, Info, GitMerge, CloudOff, Cloud
} from 'lucide-react'
import { db } from '../../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const CLI_BASE = 'http://localhost:3001'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fileTypeIcon = (type) => {
  if (type === 'A') return <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">+A</span>
  if (type === 'D') return <span className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">−D</span>
  if (type === 'R') return <span className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">R</span>
  return <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">M</span>
}

const BranchBadge = ({ branch }) => {
  if (!branch) return null
  const isMain = branch === 'main' || branch === 'master'
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
      isMain
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    }`}>
      <GitBranch size={8} />
      {branch}
    </span>
  )
}

const ChangeBadge = ({ hasChanges, count }) => {
  if (!hasChanges) return (
    <span className="text-[9px] text-emerald-400/70 font-semibold">✓ Limpio</span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded-md animate-pulse">
      ● {count > 0 ? `${count} cambios` : 'Cambios'}
    </span>
  )
}

// ─── Subcomponente: Target Item ───────────────────────────────────────────────
const TargetItem = ({ target, isSelected, onClick, categoryLabel }) => {
  if (!target) return null
  return (
    <button
      type="button"
      onClick={() => onClick(target)}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-violet-500/10 border-violet-500/30 shadow-sm shadow-violet-500/10'
          : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60 hover:border-[var(--color-border)]/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {categoryLabel && (
              <span className="text-[8px] uppercase font-black tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded-md border border-[var(--color-border)]">
                {categoryLabel}
              </span>
            )}
            {!target.hasGit && (
              <span className="text-[8px] text-red-400/70 font-semibold">Sin .git</span>
            )}
          </div>
          <p className="text-xs font-bold text-[var(--color-text)] truncate">{target.name}</p>
          <p className="text-[9px] font-mono text-[var(--color-text-muted)] truncate mt-0.5 opacity-70">
            {target.path?.replace(/\\/g, '/').replace('D:/PROTOTIPE/', '…/')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <BranchBadge branch={target.branch} />
          <ChangeBadge hasChanges={target.hasChanges} />
        </div>
      </div>
    </button>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function GitBackupPanel({ showToast }) {
  const [targets, setTargets] = useState(null)
  const [loadingTargets, setLoadingTargets] = useState(true)
  const [selected, setSelected] = useState(null)
  const [gitStatus, setGitStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [doPush, setDoPush] = useState(true)
  const [doAutoMerge, setDoAutoMerge] = useState(false)
  const [logs, setLogs] = useState([])
  const [streamState, setStreamState] = useState('idle') // idle | running | done | error
  const eventSourceRef = useRef(null)
  const logsEndRef = useRef(null)
  const abortRef = useRef(false)

  // Auto-scroll terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Cargar targets al montar
  const fetchTargets = useCallback(async () => {
    setLoadingTargets(true)
    try {
      const res = await fetch(`${CLI_BASE}/api/git/targets`)
      const data = await res.json()
      if (data.success) setTargets(data.targets)
      else showToast?.('Error al cargar repositorios', { type: 'error' })
    } catch {
      showToast?.('CLI Bridge no disponible (puerto 3001)', { type: 'error' })
    } finally {
      setLoadingTargets(false)
    }
  }, [showToast])

  useEffect(() => { fetchTargets() }, [fetchTargets])

  // Cargar status del target seleccionado
  const fetchStatus = useCallback(async (target) => {
    if (!target?.hasGit && !target?.path) return
    setLoadingStatus(true)
    setGitStatus(null)
    try {
      const params = new URLSearchParams({ path: target.path })
      const res = await fetch(`${CLI_BASE}/api/git/status?${params}`)
      const data = await res.json()
      if (data.success) setGitStatus(data)
      else showToast?.(`Error de estado: ${data.error}`, { type: 'error' })
    } catch {
      showToast?.('No se pudo leer el estado Git', { type: 'error' })
    } finally {
      setLoadingStatus(false)
    }
  }, [showToast])

  const handleSelectTarget = (target) => {
    if (!target.hasGit) {
      showToast?.('Este directorio no tiene repositorio Git inicializado', { type: 'error' })
      return
    }
    setSelected(target)
    setGitStatus(null)
    setLogs([])
    setStreamState('idle')
    setCommitMessage('')
    setDoAutoMerge(false)
    fetchStatus(target)
  }

  // Auto-generar mensaje de commit
  const handleAutoMessage = () => {
    if (!gitStatus?.changes?.length) return
    const modified = gitStatus.changes.filter(c => c.type === 'M').map(c => c.file.split('/').pop()).slice(0, 3)
    const added = gitStatus.changes.filter(c => c.type === 'A').map(c => c.file.split('/').pop()).slice(0, 2)
    const deleted = gitStatus.changes.filter(c => c.type === 'D').map(c => c.file.split('/').pop()).slice(0, 2)
    const parts = []
    if (modified.length) parts.push(`Mod: ${modified.join(', ')}`)
    if (added.length) parts.push(`Add: ${added.join(', ')}`)
    if (deleted.length) parts.push(`Del: ${deleted.join(', ')}`)
    const branch = gitStatus.branch || 'develop'
    const date = new Date().toISOString().split('T')[0]
    setCommitMessage(`[${branch}] ${date} — ${parts.join(' | ')}`)
  }

  // Ejecutar backup SSE
  const handleRunBackup = () => {
    if (!selected) return
    if (gitStatus?.envLeak) {
      showToast?.('⚠ Se detectaron archivos .env expuestos. Resuélvelos antes de hacer commit.', { type: 'error' })
      return
    }
    if (!gitStatus?.changes?.length) {
      showToast?.('No hay cambios para respaldar en este repositorio.', { type: 'error' })
      return
    }
    if (!commitMessage.trim()) {
      showToast?.('Ingresa un mensaje de commit antes de continuar.', { type: 'error' })
      return
    }

    // Cerrar stream anterior si existía
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setLogs([])
    setStreamState('running')
    abortRef.current = false

    const isMaster = selected.path === 'D:\\PROTOTIPE'
    const params = new URLSearchParams({
      path: selected.path,
      message: commitMessage.trim(),
      isMaster: String(isMaster),
      push: String(doPush),
      autoMerge: String(doAutoMerge)
    })

    const es = new EventSource(`${CLI_BASE}/api/git/backup-stream?${params}`)
    eventSourceRef.current = es

    es.addEventListener('log', (e) => {
      if (abortRef.current) return
      const { line } = JSON.parse(e.data)
      setLogs(prev => [...prev, { text: line, ts: Date.now() }])
    })

    // ── Trazabilidad Firestore ─────────────────────────────────────────
    es.addEventListener('metadata', (e) => {
      try {
        const meta = JSON.parse(e.data)
        // Solo registrar instancias de cliente (no el maestro ni el dashboard)
        const isInstance = !isMaster && selected.path?.includes('Instancias Clientes')
        if (isInstance) {
          addDoc(collection(db, 'historial_respaldos'), {
            repo: meta.targetName,
            path: meta.path,
            branch: gitStatus?.branch || 'unknown',
            message: meta.message,
            push: meta.push,
            autoMerge: meta.autoMerge,
            timestamp: serverTimestamp(),
            timestampISO: meta.timestamp
          }).catch(err => console.warn('[Firestore trazabilidad]', err))
        }
      } catch { /* noop */ }
    })

    es.addEventListener('complete', () => {
      setStreamState('done')
      es.close()
      eventSourceRef.current = null
      // Refrescar status tras backup exitoso
      fetchStatus(selected)
      fetchTargets()
      showToast?.('✅ Respaldo completado con éxito', { type: 'success' })
    })

    es.addEventListener('error', (e) => {
      if (abortRef.current) return
      try {
        const { line } = JSON.parse(e.data)
        setLogs(prev => [...prev, { text: `❌ ${line}`, ts: Date.now(), isError: true }])
      } catch { /* noop */ }
      setStreamState('error')
      es.close()
      eventSourceRef.current = null
      showToast?.('❌ El respaldo finalizó con errores', { type: 'error' })
    })

    es.onerror = () => {
      if (abortRef.current) return
      setStreamState('error')
      setLogs(prev => [...prev, { text: '❌ Conexión SSE interrumpida.', ts: Date.now(), isError: true }])
      es.close()
      eventSourceRef.current = null
    }
  }

  const handleAbort = () => {
    abortRef.current = true
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setStreamState('idle')
    setLogs(prev => [...prev, { text: '⛔ Proceso cancelado por el usuario.', ts: Date.now(), isError: true }])
  }

  const clearLogs = () => setLogs([])

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 tab-content-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <GitCommit size={20} className="text-violet-400" />
            Control de Versiones
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Respalda cualquier repositorio del ecosistema PROTOTIPE con un clic.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTargets}
          disabled={loadingTargets}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs font-bold rounded-xl border border-[var(--color-border)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loadingTargets ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ─── PANEL IZQUIERDO: Selector de Targets ─────────────────────────── */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
            <FolderOpen size={11} />
            Ecosistema PROTOTIPE
          </p>

          {loadingTargets ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[var(--color-surface-2)]/20 rounded-xl border border-[var(--color-border)] animate-pulse" />
              ))}
            </div>
          ) : !targets ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle size={14} />
              CLI Bridge no disponible. Inicia el servidor en puerto 3001.
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
              {/* Maestro */}
              {targets.master && (
                <TargetItem
                  target={targets.master}
                  isSelected={selected?.path === targets.master.path}
                  onClick={handleSelectTarget}
                  categoryLabel="Maestro"
                />
              )}
              {/* Dashboard */}
              {targets.dashboard && (
                <TargetItem
                  target={targets.dashboard}
                  isSelected={selected?.path === targets.dashboard.path}
                  onClick={handleSelectTarget}
                  categoryLabel="Consola"
                />
              )}
              {/* Cores */}
              {targets.cores?.filter(t => t.hasGit).map(t => (
                <TargetItem
                  key={t.path}
                  target={t}
                  isSelected={selected?.path === t.path}
                  onClick={handleSelectTarget}
                  categoryLabel="Core"
                />
              ))}
              {/* Sin git (cores) */}
              {targets.cores?.filter(t => !t.hasGit).map(t => (
                <TargetItem
                  key={t.path}
                  target={t}
                  isSelected={false}
                  onClick={() => showToast?.(`"${t.name}" no tiene repositorio Git`, { type: 'error' })}
                  categoryLabel="Core"
                />
              ))}
              {/* Instancias */}
              {targets.instances?.filter(t => t.hasGit).map(t => (
                <TargetItem
                  key={t.path}
                  target={t}
                  isSelected={selected?.path === t.path}
                  onClick={handleSelectTarget}
                  categoryLabel="Cliente"
                />
              ))}
              {targets.instances?.length === 0 && targets.cores?.length === 0 && !targets.master && !targets.dashboard && (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-6">
                  No se encontraron repositorios en el ecosistema.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ─── PANEL DERECHO: Operaciones ───────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-4">

          {!selected ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 bg-[var(--color-surface-2)]/20 border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)]">
              <GitBranch size={32} className="opacity-30" />
              <p className="text-sm font-semibold opacity-50">Selecciona un repositorio para comenzar</p>
            </div>
          ) : (
            <>
              {/* Info del Target seleccionado */}
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <GitBranch size={16} className="text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[var(--color-text)] truncate">{selected.name}</p>
                    <p className="text-[9px] font-mono text-[var(--color-text-muted)] truncate">
                      {selected.path?.replace(/\\/g, '/').replace('D:/PROTOTIPE/', '…/')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <BranchBadge branch={gitStatus?.branch || selected.branch} />
                  <button
                    type="button"
                    onClick={() => fetchStatus(selected)}
                    disabled={loadingStatus}
                    className="p-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors"
                    title="Recargar estado"
                  >
                    <RefreshCw size={12} className={loadingStatus ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Alerta de fuga .env */}
              {gitStatus?.envLeak && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-red-400 uppercase tracking-wide">⚠ Riesgo de Fuga de Credenciales</p>
                    <p className="text-[10px] text-red-400/80 mt-0.5">
                      Los siguientes archivos de entorno están expuestos y no deben commitearse:
                    </p>
                    {gitStatus.envLeakFiles.map(f => (
                      <code key={f} className="block text-[9px] font-mono text-red-300 mt-1 bg-red-500/10 px-2 py-1 rounded">
                        {f}
                      </code>
                    ))}
                    <p className="text-[9px] text-red-400/70 mt-1.5">
                      Agrégalos a <code className="font-mono">.gitignore</code> antes de continuar.
                    </p>
                  </div>
                </div>
              )}

              {/* Visor de cambios */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--color-text)] flex items-center gap-1.5">
                    <Layers size={13} className="text-violet-400" />
                    Cambios Detectados
                    {gitStatus?.changes?.length > 0 && (
                      <span className="ml-1 bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {gitStatus.changes.length}
                      </span>
                    )}
                  </span>
                  {loadingStatus && <RefreshCw size={12} className="animate-spin text-[var(--color-text-muted)]" />}
                </div>

                {!loadingStatus && !gitStatus && (
                  <div className="p-4 text-xs text-[var(--color-text-muted)] text-center">
                    Cargando estado del repositorio...
                  </div>
                )}
                {gitStatus?.changes?.length === 0 && (
                  <div className="p-6 flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
                    <CheckCircle size={20} className="text-emerald-400 opacity-60" />
                    <p className="text-xs font-semibold">Repositorio limpio — sin cambios pendientes</p>
                  </div>
                )}
                {gitStatus?.changes?.length > 0 && (
                  <div className="max-h-44 overflow-y-auto scrollbar-thin divide-y divide-[var(--color-border)]/40">
                    {gitStatus.changes.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-2)]/30 transition-colors">
                        {fileTypeIcon(c.type)}
                        <span className="text-[10px] font-mono text-[var(--color-text)] truncate">{c.file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Git Strategy Toggles */}
              <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <GitMerge size={11} className="text-violet-400" />
                  Estrategia Git
                </p>
                {/* Push toggle */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {doPush
                      ? <Cloud size={13} className="text-indigo-400" />
                      : <CloudOff size={13} className="text-slate-500" />}
                    <div>
                      <p className="text-[11px] font-bold text-[var(--color-text)]">Sincronizar a GitHub</p>
                      <p className="text-[9px] text-[var(--color-text-muted)]">Git push al repositorio remoto</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDoPush(prev => { const next = !prev; if (!next) setDoAutoMerge(false); return next })}
                    disabled={streamState === 'running'}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-50 ${
                      doPush ? 'bg-indigo-600' : 'bg-[var(--color-border)]'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                      doPush ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>
                </div>
                {/* AutoMerge toggle — solo si push activo y rama != main */}
                {doPush && gitStatus?.branch && gitStatus.branch !== 'main' && gitStatus.branch !== 'master' && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GitMerge size={13} className={doAutoMerge ? 'text-amber-400' : 'text-slate-500'} />
                      <div>
                        <p className="text-[11px] font-bold text-[var(--color-text)]">Auto-Merge a producción</p>
                        <p className="text-[9px] text-[var(--color-text-muted)]">
                          Fusionar <code className="font-mono text-violet-400">{gitStatus.branch}</code> → <code className="font-mono text-emerald-400">main</code> al completar
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDoAutoMerge(p => !p)}
                      disabled={streamState === 'running'}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-50 ${
                        doAutoMerge ? 'bg-amber-500' : 'bg-[var(--color-border)]'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                        doAutoMerge ? 'left-[22px]' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                )}
              </div>

              {/* Formulario de Commit */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Mensaje de Commit
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={e => setCommitMessage(e.target.value)}
                    placeholder="Describe los cambios realizados..."
                    disabled={streamState === 'running'}
                    className="flex-1 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAutoMessage}
                    disabled={!gitStatus?.changes?.length || streamState === 'running'}
                    title="Auto-generar mensaje basado en los cambios"
                    className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Zap size={11} />
                    Auto
                  </button>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRunBackup}
                  disabled={
                    streamState === 'running' ||
                    !gitStatus?.changes?.length ||
                    gitStatus?.envLeak ||
                    !commitMessage.trim()
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-sm shadow-violet-500/20"
                >
                  {streamState === 'running' ? (
                    <><RefreshCw size={13} className="animate-spin" /> Ejecutando Respaldo...</>
                  ) : (
                    <><Upload size={13} /> Respaldar en Git</>
                  )}
                </button>

                {streamState === 'running' && (
                  <button
                    type="button"
                    onClick={handleAbort}
                    className="px-3 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                    title="Cancelar proceso"
                  >
                    <StopCircle size={14} />
                  </button>
                )}
              </div>
            </>
          )}

          {/* ─── Terminal de Logs SSE ─────────────────────────────────────── */}
          {logs.length > 0 && (
            <div className="bg-[#0d0d16] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
              {/* Barra superior de la terminal */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  </div>
                  <Terminal size={11} className="text-slate-500 ml-1" />
                  <span className="text-[10px] font-mono text-slate-400">
                    ~/git-backup $ {selected?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {streamState === 'running' && (
                    <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      en ejecución
                    </span>
                  )}
                  {streamState === 'done' && (
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle size={9} /> completado
                    </span>
                  )}
                  {streamState === 'error' && (
                    <span className="text-[9px] text-red-400 font-mono flex items-center gap-1">
                      <X size={9} /> error
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearLogs}
                    className="p-1 rounded hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                    title="Limpiar terminal"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {/* Contenido del terminal */}
              <div className="p-4 max-h-64 overflow-y-auto scrollbar-thin font-mono text-[10px] leading-relaxed space-y-0.5">
                {logs.map((log, i) => {
                  const isError = log.isError || log.text?.startsWith('❌') || log.text?.startsWith('⚠')
                  const isSuccess = log.text?.startsWith('✅') || log.text?.includes('completado')
                  const isSep = log.text?.startsWith('─')
                  return (
                    <div
                      key={i}
                      className={`leading-snug ${
                        isError ? 'text-red-400' :
                        isSuccess ? 'text-emerald-400' :
                        isSep ? 'text-slate-600' :
                        'text-slate-300'
                      }`}
                    >
                      <span className="text-slate-600 mr-2 select-none">$</span>
                      {log.text}
                    </div>
                  )
                })}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

          {/* Info educativa cuando no hay nada seleccionado */}
          {!selected && !loadingTargets && targets && (
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex items-start gap-3">
              <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-indigo-400/80 leading-relaxed">
                El sistema invoca los scripts <code className="font-mono bg-indigo-500/10 px-1 rounded">git_backup.ps1</code> (maestro) y <code className="font-mono bg-indigo-500/10 px-1 rounded">subproject_backup.ps1</code> (subproyectos) de forma segura.
                Los logs del proceso aparecen aquí en tiempo real vía SSE.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
