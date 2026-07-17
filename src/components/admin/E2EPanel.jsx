import React, { useState, useEffect, useRef } from 'react'
import { FlaskConical, ChevronDown, Check, Play, StopCircle, CircleCheck, CircleX } from 'lucide-react'

import { CLI_URL } from '../../config'

export default function E2EPanel() {
  const CLI_BASE = CLI_URL
  const [e2eProjects, setE2eProjects] = useState([])
  const [e2eProjectsLoading, setE2eProjectsLoading] = useState(false)
  const [e2eSelectedProject, setE2eSelectedProject] = useState(null)
  const [e2eDropdownOpen, setE2eDropdownOpen] = useState(false)
  const [e2eRunning, setE2eRunning] = useState(false)
  const [e2eLogs, setE2eLogs] = useState([])
  const [e2eResult, setE2eResult] = useState(null) // { passed, duration, summary, timestamp }
  const e2eLogsEndRef = useRef(null)
  const e2eDropdownRef = useRef(null)

  // Cerrar dropdown al clickar fuera
  useEffect(() => {
    if (!e2eDropdownOpen) return
    const handler = (e) => {
      if (e2eDropdownRef.current && !e2eDropdownRef.current.contains(e.target)) {
        setE2eDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [e2eDropdownOpen])

  // Cargar proyectos disponibles al montar
  useEffect(() => {
    setE2eProjectsLoading(true)
    fetch(`${CLI_BASE}/api/e2e/projects`)
      .then(r => r.json())
      .then(data => {
        if (data.projects?.length) {
          setE2eProjects(data.projects)
          setE2eSelectedProject(prev => {
            if (prev && data.projects.some(p => p.id === prev.id)) {
              return prev
            }
            return data.projects[0]
          })
        }
      })
      .catch(() => {})
      .finally(() => setE2eProjectsLoading(false))
  }, [])

  // Cargar último resultado del proyecto seleccionado
  useEffect(() => {
    if (!e2eSelectedProject) return
    fetch(`${CLI_BASE}/api/e2e/last-result?projectId=${e2eSelectedProject.id}`)
      .then(r => r.json())
      .then(data => { if (data.result) setE2eResult(data.result) })
      .catch(() => {})
  }, [e2eSelectedProject])

  // Auto-scroll al final del log
  useEffect(() => {
    if (e2eLogsEndRef.current) {
      e2eLogsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [e2eLogs])

  const handleRunE2E = async () => {
    if (e2eRunning || !e2eSelectedProject) return
    setE2eRunning(true)
    setE2eLogs([])
    setE2eResult(null)

    try {
      const response = await fetch(`${CLI_BASE}/api/e2e/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: e2eSelectedProject.id,
          projectPath: e2eSelectedProject.path
        })
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
              setE2eLogs(prev => [...prev, event.line])
            } else if (event.type === 'result') {
              setE2eResult({
                passed: event.passed,
                duration: event.duration,
                summary: event.summary,
                timestamp: new Date().toISOString()
              })
            }
          } catch { /* Ignorar fragmentos de salida que aún no formen JSON. */ }
        }
      }
    } catch (err) {
      setE2eLogs(prev => [...prev, `❌ Error al conectar con el CLI: ${err.message}`])
      setE2eLogs(prev => [...prev, '⚠ Verifica que el Prototipe CLI esté corriendo en el puerto 3001'])
    } finally {
      setE2eRunning(false)
    }
  }

  return (
    <div className="space-y-6 tab-content-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <FlaskConical size={20} className="text-violet-400" />
            Tests E2E
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Ejecución y monitoreo de pruebas de extremo a extremo (Playwright).</p>
        </div>

        {/* Selector de proyecto + Botón Run */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dropdown custom de proyecto */}
          <div ref={e2eDropdownRef} className="relative">
            <button
              onClick={() => !e2eRunning && setE2eDropdownOpen(o => !o)}
              disabled={e2eRunning || e2eProjectsLoading || e2eProjects.length === 0}
              className={`h-9 pl-3 pr-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                e2eDropdownOpen
                  ? 'bg-[var(--color-surface-2)] border-violet-500/40 text-[var(--color-text)]'
                  : 'bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-text)] hover:border-violet-500/30 hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <FlaskConical size={12} className="text-violet-400 shrink-0" />
              <span className="max-w-[120px] truncate">
                {e2eProjectsLoading 
                  ? 'Cargando...' 
                  : e2eSelectedProject 
                    ? e2eSelectedProject.label 
                    : 'Sin proyectos'
                }
              </span>
              <ChevronDown
                size={12}
                className={`text-[var(--color-text-muted)] shrink-0 transition-transform duration-200 ${e2eDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {e2eDropdownOpen && e2eProjects.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 min-w-full w-max z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/30 overflow-hidden animate-scale-up origin-top-left">
                {e2eProjects.map(p => {
                  const isActive = e2eSelectedProject && p.id === e2eSelectedProject.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setE2eSelectedProject(p); setE2eDropdownOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-violet-500/10 text-violet-300'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-violet-400' : 'bg-[var(--color-border)]'}`} />
                      {p.label}
                      {isActive && <Check size={11} className="ml-auto text-violet-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            id="btn-run-e2e"
            onClick={handleRunE2E}
            disabled={e2eRunning || !e2eSelectedProject}
            className={`h-9 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              e2eRunning
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20'
            }`}
          >
            {e2eRunning
              ? <><StopCircle size={13} className="animate-pulse" /> Ejecutando...</>
              : <><Play size={13} /> Ejecutar Tests</>
            }
          </button>
        </div>
      </div>

      {/* Resultado última ejecución */}
      {e2eResult && (
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          e2eResult.passed
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          {e2eResult.passed
            ? <CircleCheck size={28} className="text-emerald-400 shrink-0" />
            : <CircleX size={28} className="text-red-400 shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-extrabold ${
              e2eResult.passed ? 'text-emerald-300' : 'text-red-300'
            }`}>
              {e2eResult.summary}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-mono">
              {e2eResult.timestamp ? new Date(e2eResult.timestamp).toLocaleString('es-CO') : ''}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 ${
            e2eResult.passed
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {e2eResult.passed ? 'PASS' : 'FAIL'}
          </span>
        </div>
      )}

      {/* Terminal de Logs */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
        {/* Barra de título estilo terminal */}
        <div className="bg-[var(--color-surface-2)]/60 px-4 py-2 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/85 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/85 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/85 block" />
          </div>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider">
            playwright — {e2eSelectedProject ? e2eSelectedProject.label : 'Sin proyecto'}
          </span>
          <div className="flex items-center gap-2">
            {e2eRunning && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping block" />
                RUNNING
              </span>
            )}
            {e2eLogs.length > 0 && (
              <button
                onClick={() => setE2eLogs([])}
                className="text-[9px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Log output */}
        <div className="bg-slate-950 p-4 h-[380px] overflow-y-auto scrollbar-thin font-mono text-[11px] leading-relaxed">
          {e2eLogs.length === 0 && !e2eRunning ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500 select-none">
              <FlaskConical size={32} className="opacity-20" />
              <p className="text-xs">Presiona “Ejecutar Tests” para iniciar Playwright.</p>
              <p className="text-[10px] opacity-60">El navegador correrá en modo headless — sin ventana visible.</p>
            </div>
          ) : (
            e2eLogs.map((line, i) => {
              const isPass = line.includes('✅') || line.includes('passed') || line.includes('ok ')
              const isFail = line.includes('❌') || line.includes('failed') || line.includes('FAIL')
              const isWarn = line.includes('⚠') || line.includes('warning')
              const isSep = line.startsWith('─') || line.startsWith('―')
              return (
                <div
                  key={i}
                  className={`py-0.5 ${
                    isPass ? 'text-emerald-400'
                    : isFail ? 'text-red-400'
                    : isWarn ? 'text-amber-400'
                    : isSep ? 'text-slate-600'
                    : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              )
            })
          )}
          <div ref={e2eLogsEndRef} />
        </div>
      </div>

      {/* Info card */}
      <div className="p-4 bg-violet-500/5 border border-violet-500/15 rounded-2xl flex gap-3 items-start">
        <FlaskConical size={16} className="text-violet-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
          <strong className="text-[var(--color-text)] block mb-1">Modo headless — sin ventana visible</strong>
          Playwright ejecuta el flujo completo en Chrome invisible: bienvenida → login → catálogo → producto → checkout → confirmación.
          Los proyectos se auto-detectan escaneando el directorio de aplicaciones en busca de archivos de configuración de Playwright.
        </div>
      </div>
    </div>
  )
}
