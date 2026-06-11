import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Layers, Copy, Play, ArrowRight, Package } from 'lucide-react'
import CoreCard from './CoreCard'

const CLI_URL = 'http://localhost:3001'

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

export default function CoreManagerPanel({ showToast }) {
  const [cores, setCores]               = useState([])
  const [loading, setLoading]           = useState(false)

  // ── Formulario de registro ────
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [formNombre, setFormNombre]   = useState('')
  const [formClave, setFormClave]     = useState('')
  const [formNicho, setFormNicho]     = useState('')
  const [registering, setRegistering] = useState(false)

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
            className="flex items-center gap-1.5 bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-slate-300 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            onClick={() => setShowRegisterForm(p => !p)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-xl transition-all font-semibold shadow-lg shadow-indigo-500/20 cursor-pointer"
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
            <button onClick={() => setShowRegisterForm(false)} className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2 rounded-xl transition-colors cursor-pointer">
              Cancelar
            </button>
            <button
              onClick={handleRegister}
              disabled={registering || !formNombre || !formClave || !formNicho}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer"
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

          {cores.map(core => (
            <CoreCard
              key={core.clave}
              core={core}
              coreOptions={coreOptions}
              showToast={showToast}
              loadCores={loadCores}
            />
          ))}
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
