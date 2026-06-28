import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  ListTodo, 
  Check, 
  Loader2, 
  ShieldAlert, 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  Terminal,
  Settings,
  Play,
  Pause,
  Trash2,
  Users,
  CheckSquare
} from 'lucide-react';

const CLI_URL = 'http://localhost:3001';

export default function SkillsRoadmapPanel({ showToast }) {
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [integrityLoading, setIntegrityLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('roadmap'); // 'roadmap' | 'integrity' | 'logs' | 'rules' | 'cleanup'

  // Estados de Logs Streamer
  const [cliLogs, setCliLogs] = useState([]);
  const [logsStreaming, setLogsStreaming] = useState(false);
  const logsEventSource = useRef(null);
  const logTerminalRef = useRef(null);

  // Estados de Reglas de IA
  const [syncRulesLoading, setSyncRulesLoading] = useState(false);
  const [syncRulesOutput, setSyncRulesOutput] = useState('');

  // Estados de Limpieza Segura
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [selectedCleanupClient, setSelectedCleanupClient] = useState('');
  const [clientList, setClientList] = useState([]);

  // Cargar tareas e instancias de clientes al montar
  useEffect(() => {
    fetchRoadmap();
    fetchClients();
    return () => {
      stopLogsStream();
    };
  }, []);

  // Auto-scroll en consola de logs
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [cliLogs]);

  const fetchRoadmap = async () => {
    setTasksLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/roadmap`);
      if (!res.ok) throw new Error('Error al obtener el roadmap del servidor CLI.');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      } else {
        throw new Error(data.error || 'Respuesta fallida del servidor.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al cargar roadmap: ${err.message}`, { type: 'error' });
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${CLI_URL}/api/instancias/list`);
      if (res.ok) {
        const data = await res.json();
        // Obtener nombres únicos de los clientes locales detectados
        const folders = Object.keys(data.plantillas || {}).flatMap(key => 
          (data.plantillas[key].instancias || []).map(inst => inst.folderName)
        );
        setClientList([...new Set(folders)]);
      }
    } catch (err) {
      console.error('Error al cargar lista de clientes:', err.message);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const res = await fetch(`${CLI_URL}/api/roadmap/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineIndex: task.lineIndex })
      });
      if (!res.ok) throw new Error('Error al actualizar el estado de la tarea en el servidor.');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
        if (showToast) showToast('Estado de tarea actualizado en el archivo físico ✓', { type: 'success' });
      } else {
        throw new Error(data.error || 'Error al persistir cambios.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`No se pudo actualizar la tarea: ${err.message}`, { type: 'error' });
    }
  };

  const handleRunIntegrityCheck = async () => {
    setIntegrityLoading(true);
    setIntegrityStatus(null);
    try {
      const res = await fetch(`${CLI_URL}/api/integrity/status`);
      if (!res.ok) throw new Error('Error al comunicar con el validador físico del CLI.');
      const data = await res.json();
      setIntegrityStatus(data);
      if (data.success) {
        if (showToast) showToast('Biblioteca validada. Integridad al 100% OK ✓', { type: 'success' });
      } else {
        if (showToast) showToast('Se detectaron fallas de integridad en la biblioteca.', { type: 'warning' });
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al ejecutar diagnóstico: ${err.message}`, { type: 'error' });
    } finally {
      setIntegrityLoading(false);
    }
  };

  // --- LÓGICA LOG STREAMER ---
  const startLogsStream = () => {
    if (logsEventSource.current) return;
    setLogsStreaming(true);
    setCliLogs([]);

    const source = new EventSource(`${CLI_URL}/api/cli/logs/stream`);
    logsEventSource.current = source;

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'log') {
          setCliLogs(prev => [...prev, data.log].slice(-400)); // Mantener últimas 400 líneas
        }
      } catch (_) {}
    };

    source.onerror = (err) => {
      console.error('SSE Error:', err);
      stopLogsStream();
    };
  };

  const stopLogsStream = () => {
    if (logsEventSource.current) {
      logsEventSource.current.close();
      logsEventSource.current = null;
    }
    setLogsStreaming(false);
  };

  const clearLogsConsole = () => {
    setCliLogs([]);
  };

  // --- LÓGICA REGLAS IA ---
  const handleSyncRules = async () => {
    setSyncRulesLoading(true);
    setSyncRulesOutput('Sincronizando reglas en todas las plantillas y cores en lote...');
    try {
      const res = await fetch(`${CLI_URL}/api/git/sync-rules`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncRulesOutput(data.output || 'Reglas sincronizadas exitosamente.');
        if (showToast) showToast('Propagación de reglas IA completada ✓', { type: 'success' });
      } else {
        throw new Error(data.error || 'Fallo desconocido.');
      }
    } catch (err) {
      setSyncRulesOutput(`❌ Error: ${err.message}`);
      if (showToast) showToast(`Fallo de sincronización: ${err.message}`, { type: 'error' });
    } finally {
      setSyncRulesLoading(false);
    }
  };

  // --- LÓGICA LIMPIEZA SEGURA ---
  const handleRunCleanup = async () => {
    if (!selectedCleanupClient) {
      if (showToast) showToast('Por favor selecciona un cliente para la limpieza.', { type: 'warning' });
      return;
    }

    setCleanupLoading(true);
    setCleanupResult(null);
    try {
      const res = await fetch(`${CLI_URL}/api/project/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedCleanupClient })
      });
      const data = await res.json();
      if (data.success) {
        setCleanupResult(data);
        if (showToast) showToast(`Limpieza finalizada con éxito ✓`, { type: 'success' });
      } else {
        throw new Error(data.error || 'Error al purgar temporales.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo en el limpiador: ${err.message}`, { type: 'error' });
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="tab-content-enter flex flex-col gap-6 h-full p-1 sm:p-2">
      {/* Cabecera del Panel */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <Activity className="text-[var(--color-primary)] animate-pulse" size={22} />
            Salud y Herramientas del Ecosistema
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Gestión de tareas físicas, validación de integridad, monitor del Bridge, sincronizador de reglas y purga de temporales.
          </p>
        </div>

        {/* selectores de sub-pestaña tipo pastilla premium */}
        <div className="flex bg-[var(--color-surface-2)]/50 p-1 rounded-xl border border-[var(--color-border)] flex-wrap gap-1">
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <ListTodo size={13} />
            Roadmap Físico
          </button>
          <button
            onClick={() => setActiveSubTab('integrity')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'integrity'
                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <ShieldAlert size={13} />
            Integridad Catálogo
          </button>
          <button
            onClick={() => { setActiveSubTab('logs'); startLogsStream(); }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Terminal size={13} />
            Logs Bridge CLI
          </button>
          <button
            onClick={() => { setActiveSubTab('rules'); stopLogsStream(); }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Sparkles size={13} />
            Reglas IA
          </button>
          <button
            onClick={() => { setActiveSubTab('cleanup'); stopLogsStream(); }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'cleanup'
                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Trash2 size={13} />
            Limpiador Caché
          </button>
        </div>
      </div>

      {/* Contenido Dinámico */}
      <div className="flex-1">
        {/* --- ROADMAP FÍSICO --- */}
        {activeSubTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  Roadmap del Proyecto (tareas_pendientes.md)
                </h2>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Los cambios realizados aquí modifican directamente el archivo Markdown físico.
                </p>
              </div>
              <button
                onClick={fetchRoadmap}
                disabled={tasksLoading}
                className="p-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer disabled:opacity-50"
                title="Sincronizar con disco"
              >
                <RefreshCw size={14} className={tasksLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {tasksLoading && tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Sincronizando tareas desde el disco...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-2xl p-6 bg-[var(--color-surface-2)]/20">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-3" />
                <h3 className="text-sm font-bold text-[var(--color-text)]">¡Todo al día!</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
                  No se encontraron tareas pendientes mapeadas en el archivo tareas_pendientes.md.
                </p>
              </div>
            ) : (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden divide-y divide-[var(--color-border)]">
                {tasks.map((task) => (
                  <div 
                    key={`${task.id}-${task.lineIndex}`}
                    className={`flex items-start gap-4 p-4 transition-all hover:bg-[var(--color-surface-2)]/30 ${
                      task.completed ? 'opacity-70 bg-[var(--color-surface-2)]/10' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                        task.completed 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-500/20' 
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-indigo-500'
                      }`}
                    >
                      {task.completed && <Check size={12} strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs block font-mono text-[var(--color-text-muted)] mb-1 font-bold ${
                        task.completed ? 'line-through opacity-60' : ''
                      }`}>
                        {task.id}
                      </span>
                      <p className={`text-xs text-[var(--color-text)] leading-relaxed font-semibold break-words ${
                        task.completed ? 'line-through text-[var(--color-text-muted)] font-normal' : ''
                      }`}>
                        {task.text.replace(/^Tarea\s+[a-zA-Z0-9\-]+:\s*/i, '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- INTEGRIDAD CATÁLOGO --- */}
        {activeSubTab === 'integrity' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <ShieldAlert size={16} className="text-indigo-400" />
                  Diagnóstico y Salud de Biblioteca (verify_library_integrity.cjs)
                </h2>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Analiza la consistencia física de la biblioteca, manifiestos JSON, playgrounds y dependencias internas locales.
                </p>
              </div>
              <button
                onClick={handleRunIntegrityCheck}
                disabled={integrityLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {integrityLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Ejecutando Diagnóstico...</span>
                  </>
                ) : (
                  <>
                    <Activity size={14} />
                    <span>Escanear Biblioteca</span>
                  </>
                )}
              </button>
            </div>

            {integrityLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]">
                <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Analizando archivos de la biblioteca en disco...</span>
              </div>
            ) : integrityStatus ? (
              <div className="space-y-4">
                <div className={`p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${
                  integrityStatus.success 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400' 
                    : 'bg-red-500/5 border-red-500/20 text-red-800 dark:text-red-400'
                }`}>
                  <div className={`p-2.5 rounded-xl border ${
                    integrityStatus.success 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                      : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {integrityStatus.success ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      {integrityStatus.success ? 'Integridad al 100% OK' : 'Fallo de Integridad Detectado'}
                    </h3>
                    <p className="text-[11px] opacity-90 mt-1 leading-relaxed">
                      {integrityStatus.success 
                        ? 'Felicidades. Todos los archivos de componentes están correctamente catalogados y sus manifiestos son correctos.'
                        : 'El validador de integridad físico detectó anomalías. Revisa el log detallado abajo para solucionar el problema.'}
                    </p>
                  </div>
                </div>

                <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-[var(--color-surface-2)]/60 px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                      <Terminal size={14} className="text-indigo-400" />
                      Consola de Diagnóstico
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      Código de salida: {integrityStatus.code}
                    </span>
                  </div>
                  <pre className="p-4 bg-slate-950 text-slate-100 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[350px] whitespace-pre-wrap">
                    {integrityStatus.stdout || integrityStatus.stderr || 'No se recibió salida.'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl p-6 bg-[var(--color-surface-2)]/20">
                <ShieldAlert size={36} className="mx-auto text-[var(--color-text-muted)] opacity-60 mb-3" />
                <h3 className="text-sm font-bold text-[var(--color-text)]">Diagnóstico Pendiente</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
                  Haz clic en el botón de arriba para escanear en tiempo real el catálogo físico de componentes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- LOGS DEL BRIDGE --- */}
        {activeSubTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Terminal size={16} className="text-indigo-400" />
                  Terminal de Logs del Bridge en Vivo (`cli_bridge.log`)
                </h2>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Muestra la consola del CLI Bridge local en tiempo real para depuración de inyecciones y aprovisionamiento.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={logsStreaming ? stopLogsStream : startLogsStream}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    logsStreaming 
                      ? 'bg-amber-600/10 hover:bg-amber-600/20 border-amber-500/20 text-amber-400' 
                      : 'bg-emerald-600/10 hover:bg-emerald-600/20 border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {logsStreaming ? <Pause size={13} /> : <Play size={13} />}
                  {logsStreaming ? 'Pausar' : 'Reanudar'}
                </button>
                <button
                  onClick={clearLogsConsole}
                  className="px-3 py-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  Limpiar
                </button>
              </div>
            </div>

            <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
              <div 
                ref={logTerminalRef}
                className="p-4 bg-slate-950 text-slate-100 text-[10.5px] font-mono leading-relaxed overflow-y-auto h-[450px] whitespace-pre-wrap flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-slate-800"
              >
                {cliLogs.length === 0 ? (
                  <p className="text-slate-500 italic">No hay logs en el búfer. El log está escuchando activamente...</p>
                ) : (
                  cliLogs.map((logLine, idx) => (
                    <div key={idx} className="border-b border-slate-900/40 pb-0.5">
                      {logLine}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- REGLAS IA --- */}
        {activeSubTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" />
                  Sincronizador de Reglas del Agente IA (sync_rules.js)
                </h2>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Fuerza la propagación y el merge de `GEMINI.md` / `AGENTS.md` a todas las plantillas y cores preservando variables locales.
                </p>
              </div>
              <button
                onClick={handleSyncRules}
                disabled={syncRulesLoading}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {syncRulesLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Propagar Reglas IA</span>
                  </>
                )}
              </button>
            </div>

            <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[var(--color-surface-2)]/60 px-4 py-3 border-b border-[var(--color-border)] flex items-center">
                <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                  <Terminal size={14} className="text-indigo-400" />
                  Salida de Sincronización
                </span>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-100 text-[11px] font-mono leading-relaxed overflow-x-auto min-h-[180px] whitespace-pre-wrap">
                {syncRulesOutput || 'Sin ejecuciones activas.'}
              </pre>
            </div>
          </div>
        )}

        {/* --- LIMPIADOR SEGURO --- */}
        {activeSubTab === 'cleanup' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Trash2 size={16} className="text-indigo-400" />
                  Limpiador Seguro de Temporales y Cachés (Lista Blanca)
                </h2>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Borra cachés obsoletas de Vite, temporales de E2E y duplicados de roadmap de forma segura para optimizar almacenamiento.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedCleanupClient}
                  onChange={(e) => setSelectedCleanupClient(e.target.value)}
                  className="bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-bold border border-[var(--color-border)] p-2 rounded-xl outline-none focus:border-indigo-500/50"
                >
                  <option value="">-- Seleccionar Instancia --</option>
                  {clientList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={handleRunCleanup}
                  disabled={cleanupLoading || !selectedCleanupClient}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {cleanupLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Purgando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Purgar Temporales</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {cleanupResult && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400 flex items-start gap-3 shadow-sm">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Purgado Seguro Completado</h4>
                    <p className="text-[11px] opacity-90 mt-1">{cleanupResult.message}</p>
                  </div>
                </div>

                <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-[var(--color-surface-2)]/60 px-4 py-3 border-b border-[var(--color-border)] flex items-center">
                    <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                      <ListTodo size={14} className="text-indigo-400" />
                      Detalle de Carpetas Eliminadas
                    </span>
                  </div>
                  <div className="p-4 bg-slate-950 text-slate-100 text-[11px] font-mono leading-relaxed overflow-x-auto min-h-[120px] whitespace-pre-wrap">
                    {cleanupResult.deleted && cleanupResult.deleted.length > 0 ? (
                      cleanupResult.deleted.map((dir, idx) => (
                        <div key={idx} className="text-emerald-400 border-b border-slate-900 pb-1 mb-1">
                          🗑️ Removido: {dir}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No se eliminó ninguna carpeta (las cachés ya estaban limpias).</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
