import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  GitBranch, RefreshCw, Terminal, ShieldAlert, CheckCircle,
  AlertTriangle, ChevronRight, Layers, FolderOpen, Play, StopCircle,
  Trash2, Zap, GitCommit, Upload, Server, X, Info, GitMerge, CloudOff, Cloud, Search,
  AlertOctagon, Edit3, CheckSquare, XSquare, ArrowDownCircle, ArrowUpCircle, Flame, Lock
} from 'lucide-react'
import { db } from '../../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

import { CLI_URL } from '../../config'
const CLI_BASE = CLI_URL

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

const SyncStateBadge = ({ state, ahead, behind, onRefresh, loading }) => {
  if (state === 'sync') return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      <Cloud size={9} /> Sincronizado
    </span>
  )
  if (state === 'ahead') return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full" title={`${ahead} commits por subir`}>
      <Upload size={9} /> Adelantado (+{ahead})
    </span>
  )
  if (state === 'behind') return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse" title={`${behind} commits por traer`}>
      <CloudOff size={9} /> Atrasado (-{behind})
    </span>
  )
  if (state === 'diverged') return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
      <AlertTriangle size={9} /> Divergente
    </span>
  )
  if (state === 'local') return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded-full">
      <Info size={9} /> Solo Local
    </span>
  )
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full hover:bg-violet-500/20 transition-all cursor-pointer disabled:opacity-50"
    >
      <RefreshCw size={9} className={loading ? 'animate-spin' : ''} /> Comprobar GitHub
    </button>
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
export default function GitBackupPanel({ showToast, showAlert, showConfirm }) {
  const [targets, setTargets] = useState(null)
  const [loadingTargets, setLoadingTargets] = useState(true)
  const [selected, setSelected] = useState(null)
  const [gitStatus, setGitStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [doPush, setDoPush] = useState(true)
  const [doAutoMerge, setDoAutoMerge] = useState(true)
  const [logs, setLogs] = useState([])
  const [streamState, setStreamState] = useState('idle') // idle | running | done | error
  const eventSourceRef = useRef(null)
  const logsEndRef = useRef(null)
  const abortRef = useRef(false)

  // F2, F3: Nuevos estados de control Git
  const [commits, setCommits] = useState([])
  const [loadingCommits, setLoadingCommits] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const [gitSearch, setGitSearch] = useState('')

  // Herramienta 2: Auditor de commits no pusheados
  const [unpushedCommits, setUnpushedCommits] = useState([])
  const [loadingUnpushed, setLoadingUnpushed] = useState(false)
  const [amendingHash, setAmendingHash] = useState(null)   // hash del commit en edición
  const [amendMessage, setAmendMessage] = useState('')
  const [amendLoading, setAmendLoading] = useState(false)

  // Herramienta 1: Drift Map Core-Cliente
  const [driftData, setDriftData] = useState(null)
  const [loadingDrift, setLoadingDrift] = useState(false)
  const [selectedClientBranch, setSelectedClientBranch] = useState(null)
  const [coreClients, setCoreClients] = useState([])  // ramas cliente del Core seleccionado
  const [coreBaseBranch, setCoreBaseBranch] = useState(null) // rama base del Core para drift
  const [recentTaskDrifts, setRecentTaskDrifts] = useState([])

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

  // F2: Cargar historial de commits recientes
  const fetchCommits = useCallback(async (target) => {
    if (!target?.path) return
    setLoadingCommits(true)
    try {
      const params = new URLSearchParams({ path: target.path })
      const res = await fetch(`${CLI_BASE}/api/git/log?${params}`)
      const data = await res.json()
      if (data.success) {
        setCommits(data.commits || [])
      }
    } catch {
      console.warn('[Git Log] No se pudo leer el historial de commits.')
    } finally {
      setLoadingCommits(false)
    }
  }, [])

  // Herramienta 2: Cargar commits no pusheados con análisis de formato
  const fetchUnpushedCommits = useCallback(async (target) => {
    if (!target?.path) return
    setLoadingUnpushed(true)
    setAmendingHash(null)
    setAmendMessage('')
    try {
      const params = new URLSearchParams({ path: target.path })
      const res = await fetch(`${CLI_BASE}/api/git/unpushed-commits?${params}`)
      const data = await res.json()
      if (data.success) setUnpushedCommits(data.commits || [])
    } catch {
      console.warn('[Unpushed Commits] No se pudo leer commits locales.')
    } finally {
      setLoadingUnpushed(false)
    }
  }, [])

  // Cargar estado de integridad para asociar tareas recientes con commits
  const fetchIntegrityStatus = useCallback(async () => {
    try {
      const res = await fetch(`${CLI_BASE}/api/integrity/status`)
      const data = await res.json()
      if (data.success || data.commitDrifts) {
        setRecentTaskDrifts(data.commitDrifts || [])
      }
    } catch {
      console.warn('[Integrity Status] No se pudo obtener desviaciones de tareas.')
    }
  }, [])

  useEffect(() => { 
    fetchTargets() 
    fetchIntegrityStatus()
  }, [fetchTargets, fetchIntegrityStatus])

  // Herramienta 2: Enmendar mensaje del último commit o commit seleccionado
  const handleAmendCommit = useCallback(async () => {
    if (!selected?.path || !amendMessage.trim() || !amendingHash) return
    const confirmed = await showConfirm?.({
      title: 'Enmendar mensaje de commit',
      message: `El mensaje del commit seleccionado LOCAL será reescrito a:\n\n"${amendMessage.trim()}"\n\nEsta acción es irreversible y reescribirá el historial local.`,
      variant: 'warning',
      confirmText: 'Sí, Enmendar',
      cancelText: 'Cancelar'
    })
    if (!confirmed) return

    setAmendLoading(true)
    try {
      const res = await fetch(`${CLI_BASE}/api/git/amend-commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: selected.path, 
          newMessage: amendMessage.trim(),
          commitHash: amendingHash
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast?.(`✅ Commit enmendado: ${data.previousHash} → ${data.newHash}`, { type: 'success' })
        setAmendingHash(null)
        setAmendMessage('')
        fetchUnpushedCommits(selected)
        fetchCommits(selected)
      } else if (data.alreadyPushed) {
        showToast?.('🔒 Commit ya en remoto. No se puede enmendar para proteger el historial.', { type: 'error' })
      } else {
        showToast?.(`Error: ${data.error}`, { type: 'error' })
      }
    } catch {
      showToast?.('No se pudo conectar con el servidor.', { type: 'error' })
    } finally {
      setAmendLoading(false)
    }
  }, [selected, amendMessage, amendingHash, showConfirm, showToast, fetchUnpushedCommits, fetchCommits])

  // Herramienta 1: Cargar ramas clientes de un repositorio Core
  const fetchCoreClients = useCallback(async (target) => {
    if (!target?.path) return
    setCoreClients([])
    setCoreBaseBranch(null)
    try {
      const res = await fetch(`${CLI_BASE}/api/git/cores-and-clients`)
      const data = await res.json()
      if (data.success) {
        const normalizeWinPath = (p) => (p || '').replace(/\\/g, '/').toLowerCase()
        const matchingCore = (data.cores || []).find(c =>
          normalizeWinPath(c.path) === normalizeWinPath(target.path)
        )
        setCoreClients(matchingCore?.clients || [])
        // Guardar la rama base real del Core (main/develop/master segun lo que exista)
        setCoreBaseBranch(matchingCore?.defaultBaseBranch || null)
      }
    } catch {
      console.warn('[Core Clients] No se pudo obtener clientes del Core.')
    }
  }, [])

  // Herramienta 1: Cargar datos de Drift entre Core y rama cliente
  const fetchDriftData = useCallback(async (target, clientBranch, baseBranchOverride) => {
    if (!target?.path || !clientBranch) return
    setLoadingDrift(true)
    setDriftData(null)
    try {
      // Usar la rama base real del Core (viene de cores-and-clients, no asumir 'main')
      const baseBranch = baseBranchOverride || coreBaseBranch
      if (!baseBranch) {
        showToast?.('No se pudo determinar la rama base del Core. Recarga el repositorio.', { type: 'error' })
        setLoadingDrift(false)
        return
      }
      const params = new URLSearchParams({ path: target.path, clientBranch, baseBranch })
      const res = await fetch(`${CLI_BASE}/api/git/compare-drift?${params}`)
      const data = await res.json()
      if (data.success) setDriftData(data)
      else showToast?.(`Error Drift: ${data.error}`, { type: 'error' })
    } catch {
      showToast?.('No se pudo analizar el desfase Core-Cliente.', { type: 'error' })
    } finally {
      setLoadingDrift(false)
    }
  }, [coreBaseBranch, showToast])

  // Cargar status del target seleccionado (con soporte de fetch remoto)
  const fetchStatus = useCallback(async (target, fetchRemote = false) => {
    if (!target?.hasGit && !target?.path) return
    setLoadingStatus(true)
    if (!fetchRemote) setGitStatus(null)
    try {
      const params = new URLSearchParams({ path: target.path, fetch: String(fetchRemote) })
      const res = await fetch(`${CLI_BASE}/api/git/status?${params}`)
      const data = await res.json()
      if (data.success) {
        setGitStatus(data)
        if (fetchRemote) showToast?.('Estado remoto actualizado con GitHub', { type: 'success' })
      }
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
    setCommits([])
    setLogs([])
    setStreamState('idle')
    setCommitMessage('')
    setUnpushedCommits([])
    setDriftData(null)
    setSelectedClientBranch(null)
    setAmendingHash(null)
    setAmendMessage('')
    setCoreClients([])
    setCoreBaseBranch(null)
    
    // Auto-Merge habilitado por defecto solo si NO es una instancia de cliente
    const isInstance = target.path?.includes('Instancias Clientes')
    setDoAutoMerge(!isInstance)
    
    fetchStatus(target)
    fetchCommits(target)
    fetchUnpushedCommits(target)
    fetchIntegrityStatus()
    if (target.categoryLabel === 'Core') fetchCoreClients(target)
  }

  // F1: Descartar cambios locales (individual o total)
  const handleDiscardChanges = async (file = null) => {
    if (!selected?.path) return
    
    const isAll = file === null
    const confirm = await showConfirm?.({
      title: isAll ? '¿Descartar todos los cambios?' : '¿Descartar cambios del archivo?',
      message: isAll 
        ? 'Esto revertirá de forma permanente todas las modificaciones locales sin guardar en este repositorio. Esta acción NO se puede deshacer.'
        : `Esto revertirá todas las modificaciones del archivo "${file}". No se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Sí, Descartar',
      cancelText: 'Cancelar'
    })

    if (!confirm) return

    setDiscarding(true)
    try {
      const res = await fetch(`${CLI_BASE}/api/git/discard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selected.path,
          file,
          all: isAll
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast?.(data.message, { type: 'success' })
        fetchStatus(selected)
        fetchTargets()
      } else {
        showToast?.(`Error al descartar: ${data.error}`, { type: 'error' })
      }
    } catch {
      showToast?.('No se pudo comunicar con el servidor', { type: 'error' })
    } finally {
      setDiscarding(false)
    }
  }

  // Auto-generar mensaje de commit
  const handleAutoMessage = async () => {
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
    
    // Si hay tareas recientemente completadas pendientes de commit, prependeamos el ID
    let prefix = ''
    if (recentTaskDrifts.length > 0) {
      prefix = `${recentTaskDrifts[0].id}: `
    } else {
      // Intentar autodetectar la tarea en progreso o más reciente de la hoja de ruta
      try {
        const res = await fetch(`${CLI_BASE}/api/roadmap`)
        const data = await res.json()
        if (data.success && data.tasks?.length > 0) {
          const activeTask = data.tasks.find(t => !t.completed) || data.tasks[0]
          if (activeTask && activeTask.id) {
            prefix = `${activeTask.id}: `
          }
        }
      } catch (err) {
        console.warn('[AutoMessage Detection] No se pudo autodetectar la última tarea del roadmap:', err)
      }
    }
    setCommitMessage(`${prefix}[${branch}] ${date} — ${parts.join(' | ')}`)
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
      fetchCommits(selected)
      fetchTargets()
      fetchIntegrityStatus()
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
          ) : (() => {
            // Construir lista plana con categoría
            const allItems = [
              targets.master    ? { ...targets.master,    categoryLabel: 'Maestro', selectable: true }  : null,
              targets.dashboard ? { ...targets.dashboard, categoryLabel: 'Consola', selectable: true }  : null,
              ...(targets.cores     || []).map(t => ({ ...t, categoryLabel: 'Core',    selectable: t.hasGit })),
              ...(targets.instances || []).map(t => ({ ...t, categoryLabel: 'Cliente', selectable: t.hasGit })),
            ].filter(Boolean);

            const q = gitSearch.toLowerCase().trim();
            const filtered = q
              ? allItems.filter(t =>
                  (t.name || '').toLowerCase().includes(q) ||
                  (t.path || '').toLowerCase().includes(q) ||
                  (t.categoryLabel || '').toLowerCase().includes(q)
                )
              : allItems;

            return (
              <div className="space-y-2">
                {/* Buscador */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Buscar repositorio..."
                    value={gitSearch}
                    onChange={e => setGitSearch(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-8 pr-7 py-2 text-xs focus:border-violet-500 outline-none text-[var(--color-text)] placeholder:text-slate-600 transition-all"
                  />
                  {gitSearch && (
                    <button
                      onClick={() => setGitSearch('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-[var(--color-text)] text-[10px] font-bold leading-none transition-colors"
                    >✕</button>
                  )}
                </div>

                {/* Contador */}
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[9px] uppercase font-black tracking-wider text-[var(--color-text-muted)] flex items-center gap-1">
                    <FolderOpen size={10} /> Ecosistema PROTOTIPE
                  </span>
                  <span className="text-[9px] font-bold text-slate-600">{filtered.length}/{allItems.length}</span>
                </div>

                {/* Lista filtrada */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {filtered.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-center">
                      <Search size={18} className="text-slate-600" />
                      <span className="text-[10px] text-slate-500 font-semibold italic leading-relaxed">
                        Sin resultados para<br/>"{gitSearch}"
                      </span>
                      <button
                        onClick={() => setGitSearch('')}
                        className="mt-1 text-[10px] text-violet-400 hover:text-violet-300 font-bold underline underline-offset-2"
                      >Limpiar</button>
                    </div>
                  ) : (
                    filtered.map(t => (
                      <TargetItem
                        key={t.path}
                        target={t}
                        isSelected={selected?.path === t.path}
                        onClick={t.selectable
                          ? handleSelectTarget
                          : () => showToast?.(`"${t.name}" no tiene repositorio Git`, { type: 'error' })}
                        categoryLabel={t.categoryLabel}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })()}
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
              <div className="relative z-40 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-between gap-4 flex-wrap">
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
                  <SyncStateBadge
                    state={gitStatus?.syncState}
                    ahead={gitStatus?.aheadCount}
                    behind={gitStatus?.behindCount}
                    loading={loadingStatus}
                    onRefresh={() => fetchStatus(selected, true)}
                  />
                  <BranchBadge branch={gitStatus?.branch || selected.branch} />
                  <button
                    type="button"
                    onClick={() => { fetchStatus(selected); fetchCommits(selected); }}
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
                  <div className="flex items-center gap-2">
                    {gitStatus?.changes?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleDiscardChanges(null)}
                        disabled={discarding || streamState === 'running'}
                        className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[9px] font-black text-red-400 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 size={10} />
                        Descartar todo
                      </button>
                    )}
                    {loadingStatus && <RefreshCw size={12} className="animate-spin text-[var(--color-text-muted)]" />}
                  </div>
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
                      <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-2)]/30 transition-colors group/row">
                        <div className="flex items-center gap-3 min-w-0">
                          {fileTypeIcon(c.type)}
                          <span className="text-[10px] font-mono text-[var(--color-text)] truncate">{c.file}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDiscardChanges(c.file)}
                          disabled={discarding || streamState === 'running'}
                          className="opacity-0 group-hover/row:opacity-100 p-1 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-md text-[var(--color-text-muted)] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 cursor-pointer transition-all active:scale-90"
                          title="Descartar cambios de este archivo"
                        >
                          <RefreshCw size={10} />
                        </button>
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
                {/* AutoMerge toggle — solo si push activo, rama != main y NO es una instancia de cliente */}
                {doPush && gitStatus?.branch && gitStatus.branch !== 'main' && gitStatus.branch !== 'master' && !selected?.path?.includes('Instancias Clientes') && (
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

              {/* ══════════════════════════════════════════════════════════════
                  HERRAMIENTA 2: Auditor de Commits No Pusheados
              ══════════════════════════════════════════════════════════════ */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden mt-4">
                <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--color-text)] flex items-center gap-1.5">
                    <Edit3 size={13} className="text-amber-400" />
                    Auditor de Commits Locales
                    {unpushedCommits.filter(c => !c.isValid).length > 0 && (
                      <span className="ml-1 bg-red-500/15 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {unpushedCommits.filter(c => !c.isValid).length} sin formato
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {loadingUnpushed && <RefreshCw size={12} className="animate-spin text-[var(--color-text-muted)]" />}
                    <button
                      type="button"
                      onClick={() => fetchUnpushedCommits(selected)}
                      disabled={loadingUnpushed}
                      className="p-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors disabled:opacity-50"
                      title="Recargar commits locales"
                    >
                      <RefreshCw size={11} />
                    </button>
                  </div>
                </div>

                {loadingUnpushed && unpushedCommits.length === 0 ? (
                  <div className="p-4 text-xs text-[var(--color-text-muted)] text-center animate-pulse">Analizando commits locales...</div>
                ) : unpushedCommits.length === 0 ? (
                  <div className="p-5 flex flex-col items-center gap-1.5 text-center">
                    <CheckCircle size={16} className="text-emerald-400 opacity-60" />
                    <p className="text-[10px] text-[var(--color-text-muted)] font-semibold">Sin commits locales pendientes de revisión</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-border)]/40">
                    {unpushedCommits.map((c, idx) => (
                      <div key={c.fullHash} className="px-4 py-3">
                        {amendingHash === c.fullHash ? (
                          /* ── Editor inline de mensaje ── */
                          <div className="space-y-2">
                            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wide">Reescribir mensaje del commit {c.hash}:</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={amendMessage}
                                onChange={e => setAmendMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAmendCommit()}
                                placeholder="[develop] 2026-07-06 — feat: descripción"
                                className="flex-1 bg-[var(--color-surface-2)] border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-amber-400 transition-colors font-mono"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={handleAmendCommit}
                                disabled={amendLoading || !amendMessage.trim()}
                                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-[10px] font-black rounded-lg cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {amendLoading ? <RefreshCw size={10} className="animate-spin" /> : <CheckSquare size={11} />}
                                Enmendar
                              </button>
                              <button
                                type="button"
                                onClick={() => { setAmendingHash(null); setAmendMessage('') }}
                                className="px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[10px] font-bold rounded-lg cursor-pointer hover:text-[var(--color-text)] transition-colors"
                              >
                                <XSquare size={11} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── Vista normal del commit ── */
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 min-w-0">
                              {c.isValid
                                ? <CheckSquare size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                                : <XSquare size={12} className="text-red-400 shrink-0 mt-0.5 animate-pulse" />}
                              <div className="min-w-0">
                                <p className={`text-[10px] font-bold truncate ${c.isValid ? 'text-[var(--color-text)]' : 'text-red-300'}`}>
                                  {c.message}
                                </p>
                                <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">
                                  {c.author} • {c.date}
                                  {!c.hasUpstream && <span className="ml-1.5 text-amber-400/70 font-semibold">• Sin upstream</span>}
                                </p>
                                {!c.isValid && (
                                  <p className="text-[9px] text-red-400/80 mt-0.5 font-semibold">
                                    ⚠ No cumple formato Conventional Commits ni contiene ID de tarea
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {idx === 0 && (
                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-400">HEAD</span>
                              )}
                              <code className="text-[9px] font-mono font-bold bg-[var(--color-surface-2)] border border-[var(--color-border)] text-violet-400 px-1.5 py-0.5 rounded">
                                {c.hash}
                              </code>
                              {!c.isValid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAmendingHash(c.fullHash);
                                    let prefix = '';
                                    if (recentTaskDrifts.length > 0) {
                                      const task = recentTaskDrifts[0];
                                      const hasId = c.message.toUpperCase().includes(task.id.toUpperCase());
                                      if (!hasId) prefix = `${task.id}: `;
                                    }
                                    setAmendMessage(`${prefix}${c.message}`);
                                  }}
                                  className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg cursor-pointer transition-all active:scale-90"
                                  title="Enmendar mensaje de este commit"
                                >
                                  <Edit3 size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ══════════════════════════════════════════════════════════════
                  HERRAMIENTA 1: Drift Map Core-Cliente
                  Solo visible si el repositorio seleccionado es un Core con clientes
              ══════════════════════════════════════════════════════════════ */}
              {selected?.categoryLabel === 'Core' && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden mt-4">
                  <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs font-black text-[var(--color-text)] flex items-center gap-1.5">
                      <Flame size={13} className="text-orange-400" />
                      Mapa de Desviación Core-Cliente
                    </span>
                    {loadingDrift && <RefreshCw size={12} className="animate-spin text-[var(--color-text-muted)]" />}
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Selector de rama cliente */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-black tracking-wider text-[var(--color-text-muted)]">Seleccionar rama cliente a comparar:</p>
                      <div className="flex flex-wrap gap-2">
                        {coreClients.length > 0 ? (
                          coreClients.map(client => (
                            <button
                              key={client.branch}
                              type="button"
                              onClick={() => {
                                setSelectedClientBranch(client.branch)
                                fetchDriftData(selected, client.branch, coreBaseBranch)
                              }}
                              className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                selectedClientBranch === client.branch
                                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                                  : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-orange-500/30'
                              }`}
                            >
                              <GitBranch size={9} className="inline mr-1" />{client.branch}
                            </button>
                          ))
                        ) : (
                          <p className="text-[10px] text-[var(--color-text-muted)] italic">No hay ramas de cliente detectadas en este Core.</p>
                        )}
                      </div>
                    </div>

                    {/* Resultados del Drift */}
                    {driftData && (
                      <div className="space-y-3">
                        {/* Semáforo de riesgo */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                          driftData.riskLevel === 'none'     ? 'bg-emerald-500/10 border-emerald-500/20' :
                          driftData.riskLevel === 'low'      ? 'bg-amber-500/10 border-amber-500/20' :
                          driftData.riskLevel === 'medium'   ? 'bg-orange-500/10 border-orange-500/20' :
                                                               'bg-red-500/10 border-red-500/20'
                        }`}>
                          <div className={`w-3 h-3 rounded-full shrink-0 ${
                            driftData.riskLevel === 'none'   ? 'bg-emerald-400' :
                            driftData.riskLevel === 'low'    ? 'bg-amber-400' :
                            driftData.riskLevel === 'medium' ? 'bg-orange-400' :
                                                               'bg-red-400 animate-pulse'
                          }`} />
                          <div>
                            <p className={`text-[10px] font-black ${
                              driftData.riskLevel === 'none'   ? 'text-emerald-400' :
                              driftData.riskLevel === 'low'    ? 'text-amber-400' :
                              driftData.riskLevel === 'medium' ? 'text-orange-400' :
                                                                 'text-red-400'
                            }`}>
                              Riesgo de Colisión: {driftData.riskLevel === 'none' ? 'Ninguno' : driftData.riskLevel === 'low' ? 'Bajo' : driftData.riskLevel === 'medium' ? 'Medio' : '⚠ CRÍTICO'}
                            </p>
                            <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">
                              {driftData.collisionFiles.length} archivos con cambios en ambas ramas
                            </p>
                          </div>
                        </div>

                        {/* Contadores de desfase */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-[var(--color-surface-2)]/40 rounded-xl border border-[var(--color-border)] space-y-1">
                            <div className="flex items-center gap-1.5">
                              <ArrowUpCircle size={11} className="text-indigo-400" />
                              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Cliente adelante</span>
                            </div>
                            <p className="text-2xl font-black text-indigo-400">{driftData.aheadCount}</p>
                            <p className="text-[9px] text-[var(--color-text-muted)]">commits propios del cliente</p>
                          </div>
                          <div className="p-3 bg-[var(--color-surface-2)]/40 rounded-xl border border-[var(--color-border)] space-y-1">
                            <div className="flex items-center gap-1.5">
                              <ArrowDownCircle size={11} className="text-amber-400" />
                              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Cliente atrás</span>
                            </div>
                            <p className="text-2xl font-black text-amber-400">{driftData.behindCount}</p>
                            <p className="text-[9px] text-[var(--color-text-muted)]">commits del Core sin recibir</p>
                          </div>
                        </div>

                        {/* Archivos con colisión */}
                        {driftData.collisionFiles.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[9px] uppercase font-black tracking-wider text-red-400/80">Archivos en riesgo de colisión:</p>
                            <div className="max-h-28 overflow-y-auto scrollbar-thin space-y-1">
                              {driftData.collisionFiles.map(f => (
                                <div key={f} className="flex items-center gap-2 px-2.5 py-1 bg-red-500/5 border border-red-500/15 rounded-lg">
                                  <AlertOctagon size={9} className="text-red-400 shrink-0" />
                                  <code className="text-[9px] font-mono text-red-300 truncate">{f}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!driftData && !loadingDrift && !selectedClientBranch && (
                      <p className="text-[10px] text-[var(--color-text-muted)] italic text-center py-2">
                        Selecciona una rama cliente para analizar el desfase con el Core.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  Historial de commits (panel original mejorado)
              ══════════════════════════════════════════════════════════════ */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden mt-4">
                <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--color-text)] flex items-center gap-1.5">
                    <GitCommit size={13} className="text-violet-400" />
                    Historial de Commits Recientes
                  </span>
                  {loadingCommits && <RefreshCw size={12} className="animate-spin text-[var(--color-text-muted)]" />}
                </div>

                {loadingCommits && commits.length === 0 ? (
                  <div className="p-4 text-xs text-[var(--color-text-muted)] text-center animate-pulse">
                    Cargando historial de commits...
                  </div>
                ) : commits.length === 0 ? (
                  <div className="p-4 text-xs text-[var(--color-text-muted)] text-center">
                    No se encontraron commits previos.
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-border)]/40 max-h-48 overflow-y-auto scrollbar-thin">
                    {commits.map((c, i) => (
                      <div key={i} className="px-4 py-2.5 hover:bg-[var(--color-surface-2)]/30 transition-colors flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-[var(--color-text)] truncate">{c.message}</p>
                          <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">
                            Autor: <span className="font-semibold">{c.author}</span> • {c.date}
                          </p>
                        </div>
                        <code className="text-[9px] font-mono font-bold bg-[var(--color-surface-2)] border border-[var(--color-border)] text-violet-400 px-1.5 py-0.5 rounded shrink-0">
                          {c.hash}
                        </code>
                      </div>
                    ))}
                  </div>
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
