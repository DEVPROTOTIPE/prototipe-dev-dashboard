import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus, RefreshCw, Layers, CheckCircle, AlertTriangle,
  Play, StopCircle, Copy, ChevronDown, ChevronRight,
  Zap, Package, Settings, Trash2, ArrowRight, Check, X
} from 'lucide-react'
import CustomSelect from '../ui/CustomSelect'

const CLI_URL = 'http://localhost:3001'

// ─── Paleta de colores de estado ─────────────────────────────────────────────
const STATUS = {
  active:   { label: 'Activo',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  inactive: { label: 'Inactivo',  cls: 'bg-slate-500/15  text-slate-400   border-slate-500/30'   },
  error:    { label: 'Error',     cls: 'bg-red-500/15     text-red-400     border-red-500/30'     },
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
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

function InputField({ label, value, onChange, placeholder, required, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint && <p className="text-[10px] text-slate-600">{hint}</p>}
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export default function CoreManagerPanel({ showToast }) {
  const [cores, setCores]               = useState([])
  const [loading, setLoading]           = useState(false)
  const [expandedCore, setExpandedCore] = useState(null)
  const [actionLogs, setActionLogs]     = useState({}) // clave → string[]
  const [actionLoading, setActionLoading] = useState({}) // clave → bool

  // ── Formulario de registro ────
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [formNombre, setFormNombre]   = useState('')
  const [formClave, setFormClave]     = useState('')
  const [formNicho, setFormNicho]     = useState('')
  const [registering, setRegistering] = useState(false)

  // ── Scaffold ─────────────────
  const [scaffoldBase, setScaffoldBase] = useState({}) // clave → baseCore seleccionado
  const [openDropdown, setOpenDropdown] = useState(null) // clave del dropdown abierto

  // ─── Cargar lista de cores ──────────────────────────────────────────────────
  const loadCores = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${CLI_URL}/api/cores`)
      const data = await res.json()
      if (data.success) setCores(data.cores)
      else throw new Error(data.error)
    } catch (err) {
      showToast?.('No se pudo conectar con el CLI Bridge.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadCores() }, [loadCores])

  // Auto-generar clave desde nombre
  useEffect(() => {
    setFormClave(formNombre.toLowerCase().replace(/^app\s+/i, '').trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }, [formNombre])

  // ─── Acción genérica con logs ───────────────────────────────────────────────
  const runAction = async (clave, endpoint, method = 'POST', body = {}, successMsg) => {
    setActionLoading(p => ({ ...p, [clave]: true }))
    setActionLogs(p => ({ ...p, [clave]: [`⏳ Iniciando: ${endpoint}...`] }))
    try {
      const res = await fetch(`${CLI_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' ? JSON.stringify(body) : undefined
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Error desconocido')

      const logs = []
      if (data.data?.copied)   logs.push(...data.data.copied.map(f => `📄 Copiado: ${f}`))
      if (data.data?.synced)   logs.push(...data.data.synced.map(f => `✅ Sincronizado: ${f}`))
      if (data.data?.archivosCreados) logs.push(...data.data.archivosCreados.map(f => `📄 Creado: ${f}`))
      logs.push(`✅ ${data.message}`)

      setActionLogs(p => ({ ...p, [clave]: logs }))
      showToast?.(successMsg || data.message, 'success')
      await loadCores()
    } catch (err) {
      setActionLogs(p => ({ ...p, [clave]: [`❌ Error: ${err.message}`] }))
      showToast?.(err.message, 'error')
    } finally {
      setActionLoading(p => ({ ...p, [clave]: false }))
    }
  }

  // ─── Registrar nuevo core ───────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!formNombre || !formClave || !formNicho) {
      showToast?.('Completa todos los campos.', 'error'); return
    }
    setRegistering(true)
    try {
      const res = await fetch(`${CLI_URL}/api/register-core`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: formNombre, clave: formClave, nicho: formNicho })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      showToast?.(`Plantilla "${data.data.coreName}" registrada con 12 docs estándar.`, 'success')
      setFormNombre(''); setFormClave(''); setFormNicho('')
      setShowRegisterForm(false)
      await loadCores()
    } catch (err) {
      showToast?.(err.message, 'error')
    } finally {
      setRegistering(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  const activeCores   = cores.filter(c => c.activo)
  const inactiveCores = cores.filter(c => !c.activo)
  const coreOptions   = cores.map(c => c.clave)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Gestión de Plantillas Core</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCores.length} activas · {inactiveCores.length} en desarrollo · {cores.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadCores}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-slate-300 px-3 py-2 rounded-xl transition-all"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            onClick={() => setShowRegisterForm(p => !p)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-xl transition-all font-semibold shadow-lg shadow-indigo-500/20"
          >
            <Plus size={13} />
            Nueva Plantilla
          </button>
        </div>
      </div>

      {/* Formulario registro */}
      {showRegisterForm && (
        <div className="bg-[var(--color-surface)]/80 border border-indigo-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-[var(--color-text)]">Registrar Nueva Plantilla Core</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputField
              label="Nombre"
              value={formNombre}
              onChange={setFormNombre}
              placeholder="Contabilidad"
              required
              hint='Sin el prefijo "App" — se agrega automáticamente'
            />
            <InputField
              label="Clave CLI"
              value={formClave}
              onChange={setFormClave}
              placeholder="contabilidad"
              required
              hint="Solo minúsculas y guiones. Se auto-genera desde el nombre."
            />
            <InputField
              label="Nicho"
              value={formNicho}
              onChange={setFormNicho}
              placeholder="Contabilidad / Finanzas"
              required
              hint="Descripción del vertical de negocio"
            />
          </div>

          {/* Preview de lo que se creará */}
          {formClave && (
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-[10px] text-slate-500 font-mono space-y-0.5">
              <p className="text-slate-400 font-semibold mb-1">📦 Se creará automáticamente:</p>
              <p>📁 Plantillas Core/App {formNombre || '…'}/</p>
              <p>📁 Plantillas Core/App {formNombre || '…'}/Documentacion App {formNombre || '…'}/ <span className="text-indigo-400">(12 archivos estándar)</span></p>
              <p>📁 templates/template-{formClave}/</p>
              <p>📝 plantillas_registro.json → "{formClave}": {'{'} activo: false {'}'}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowRegisterForm(false)} className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2 rounded-xl transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleRegister}
              disabled={registering || !formNombre || !formClave || !formNicho}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs px-4 py-2 rounded-xl transition-all font-semibold"
            >
              {registering ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
              {registering ? 'Registrando...' : 'Registrar Plantilla'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de cores */}
      {loading && cores.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {cores.length === 0 && (
            <div className="text-center py-12 text-slate-600 text-sm">
              No hay plantillas registradas. Registra la primera arriba.
            </div>
          )}

          {cores.map(core => {
            const isExpanded = expandedCore === core.clave
            const logs = actionLogs[core.clave] || []
            const isLoading = actionLoading[core.clave] || false
            const baseForScaffold = scaffoldBase[core.clave] || coreOptions.find(k => k !== core.clave) || ''

            return (
              <div
                key={core.clave}
                className={`bg-[var(--color-surface)]/60 border rounded-2xl transition-all backdrop-blur-sm relative ${
                  isExpanded ? 'z-20' : 'z-0'
                } ${
                  core.activo ? 'border-emerald-500/20' : 'border-[var(--color-border)]'
                }`}
              >
                {/* Header del core */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--color-surface-2)]/30 rounded-t-2xl transition-colors"
                  onClick={() => setExpandedCore(isExpanded ? null : core.clave)}
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
                    {/* Acción rápida activate/deactivate */}
                    {core.activo ? (
                      <button
                        onClick={e => { e.stopPropagation(); runAction(core.clave, `/api/cores/${core.clave}/deactivate`, 'POST', {}, 'Plantilla desactivada del wizard.') }}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-[10px] bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 border border-slate-600/50 hover:border-red-500/30 text-slate-400 px-2 py-1 rounded-lg transition-all"
                      >
                        <StopCircle size={11} /> Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); runAction(core.clave, `/api/cores/${core.clave}/activate`, 'POST', {}, 'Plantilla activada en el wizard.') }}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 px-2 py-1 rounded-lg transition-all"
                      >
                        {isLoading ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
                        Activar
                      </button>
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
                            value={scaffoldBase[core.clave] || ''}
                            onChange={(val) => setScaffoldBase(p => ({ ...p, [core.clave]: val }))}
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
                              if (!scaffoldBase[core.clave]) { showToast?.('Selecciona un core base.', 'error'); return }
                              runAction(core.clave, `/api/cores/${core.clave}/scaffold`, 'POST', { baseCore: scaffoldBase[core.clave] }, 'Scaffold completado.')
                            }}
                            disabled={isLoading || !scaffoldBase[core.clave]}
                            className="w-full flex items-center justify-center gap-1.5 bg-violet-600/20 hover:bg-violet-600/30 disabled:opacity-40 text-violet-400 border border-violet-500/30 text-[11px] px-2 py-1.5 rounded-lg transition-all font-semibold"
                          >
                            {isLoading ? <RefreshCw size={11} className="animate-spin" /> : <Copy size={11} />}
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
                            onClick={() => runAction(core.clave, `/api/cores/${core.clave}/activate`, 'POST', {}, 'Sincronizado al CLI.')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 disabled:opacity-40 text-amber-400 border border-amber-500/30 text-[11px] px-2 py-1.5 rounded-lg transition-all font-semibold mt-auto"
                          >
                            {isLoading ? <RefreshCw size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                            Sync → CLI
                          </button>
                        </div>

                        {/* Activar/Desactivar completo */}
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
                              ? runAction(core.clave, `/api/cores/${core.clave}/deactivate`, 'POST', {}, 'Desactivada del wizard.')
                              : runAction(core.clave, `/api/cores/${core.clave}/activate`, 'POST', {}, 'Activada en el wizard.')
                            }
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-1.5 text-[11px] px-2 py-1.5 rounded-lg transition-all font-semibold border disabled:opacity-40 mt-auto ${
                              core.activo
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {isLoading ? <RefreshCw size={11} className="animate-spin" /> : core.activo ? <StopCircle size={11} /> : <Play size={11} />}
                            {core.activo ? 'Desactivar del Wizard' : 'Activar en Wizard'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Log de acciones */}
                    {logs.length > 0 && (
                      <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-3 max-h-40 overflow-y-auto space-y-0.5">
                        <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-2">Log de ejecución</p>
                        {logs.map((line, i) => <LogLine key={i} line={line} />)}
                        {isLoading && <p className="text-[11px] font-mono text-indigo-400 animate-pulse">⏳ Procesando...</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Leyenda del flujo */}
      <div className="bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-3">Flujo de Ciclo de Vida de una Plantilla</p>
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Plus size={11} className="text-indigo-400" /> Registrar</span>
          <ArrowRight size={11} />
          <span className="flex items-center gap-1"><Copy size={11} className="text-violet-400" /> Scaffold (opcional)</span>
          <ArrowRight size={11} />
          <span className="flex items-center gap-1 text-slate-400 italic">Desarrollar código en /src/</span>
          <ArrowRight size={11} />
          <span className="flex items-center gap-1"><Play size={11} className="text-emerald-400" /> Activar → aparece en wizard</span>
        </div>
      </div>

    </div>
  )
}
