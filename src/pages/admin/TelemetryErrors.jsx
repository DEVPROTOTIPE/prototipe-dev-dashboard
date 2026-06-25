import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AlertTriangle, CheckCircle, Trash2, Users, Activity, Search, X, Copy, Database, Smartphone, User, Terminal, ArrowUpRight, ChevronDown, Check
} from 'lucide-react';
import { useDevStore } from '../../stores/devStore';
import { useAlertConfirm } from '../../components/common/AlertConfirmContext';
import useToast from '../../hooks/useToast';
import GuidedToast from '../../components/ui/GuidedToast';
import Pagination from '../../components/ui/Pagination';
import { db } from '../../services/firebase';
import { doc, addDoc, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import { CLI_URL } from '../../config/constants';

// Componente CustomSelect definido localmente para mantener TelemetryErrors autocontenido
function CustomSelect({ value, onChange, options, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => (opt.id !== undefined ? opt.id : opt) === value);
  const selectedLabel = selectedOption ? (selectedOption.name || selectedOption.label || selectedOption.id || selectedOption) : value;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] border rounded-xl px-3 py-2 text-xs font-bold w-full text-[var(--color-text)] outline-none flex items-center justify-between transition-all cursor-pointer select-none ${
          isOpen ? 'border-indigo-500/40' : 'border-[var(--color-border)] hover:border-indigo-500/30'
        } ${className || ''}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={12} className={`text-[var(--color-text-muted)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/30 py-1 max-h-60 overflow-y-auto backdrop-blur-md animate-scale-up origin-top">
          {options.map(opt => {
            const id = opt.id !== undefined ? opt.id : opt;
            const label = opt.name || opt.label || opt.id || opt;
            const isSelected = id === value;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onChange({ target: { value: id } });
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-left transition-colors cursor-pointer bg-transparent border-none ${
                  isSelected
                    ? 'bg-indigo-500/10 text-indigo-300'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-indigo-400' : 'bg-[var(--color-border)]'}`} />
                <span className="truncate">{label}</span>
                {isSelected && <Check size={11} className="ml-auto text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TelemetryErrors() {
  const { showAlert } = useAlertConfirm();
  const { toast, showToast, hideToast } = useToast();

  // Zustand Store
  const { 
    failures, 
    clientesSaas, 
    telemetryTokens, 
    isSimulated, 
    addLog, 
    setFailures 
  } = useDevStore();

  // Filtros locales
  const [selectedErrorStatusFilter, setSelectedErrorStatusFilter] = useState('activos');
  const [selectedErrorClientFilter, setSelectedErrorClientFilter] = useState('todos');
  const [selectedErrorTypeFilter, setSelectedErrorTypeFilter] = useState('todos');
  const [errorSearchQuery, setErrorSearchQuery] = useState('');
  const [groupErrorsByMessage, setGroupErrorsByMessage] = useState(false);
  const [errorsPage, setErrorsPage] = useState(1);

  // Estados del Drawer & Modal
  const [expandedErrorId, setExpandedErrorId] = useState(null);
  const [resolutionNoteInputId, setResolutionNoteInputId] = useState(null);
  const [resolutionNoteText, setResolutionNoteText] = useState('');
  const [selectedDiagnosticError, setSelectedDiagnosticError] = useState(null);
  const [isSimulateFailureModalOpen, setIsSimulateFailureModalOpen] = useState(false);

  // Estados de simulación de fallo
  const [simFailureClientId, setSimFailureClientId] = useState('');
  const [simFailureNiche, setSimFailureNiche] = useState('General');
  const [simFailureManualClientId, setSimFailureManualClientId] = useState('');
  const [simFailureErrorType, setSimFailureErrorType] = useState('0');
  const [simFailureCustomMsg, setSimFailureCustomMsg] = useState('');
  const [simFailureCustomStack, setSimFailureCustomStack] = useState('');
  const [simFailureType, setSimFailureType] = useState('error');
  const [simFailureSource, setSimFailureSource] = useState('automatic');

  // Estados del Visor de Código
  const [codeSnippet, setCodeSnippet] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState(null);

  // Inicializar simulación con el primer cliente
  useEffect(() => {
    if (clientesSaas.length > 0 && !simFailureClientId) {
      setSimFailureClientId(clientesSaas[0].id);
      setSimFailureNiche(clientesSaas[0].niche || 'General');
    }
  }, [clientesSaas, simFailureClientId]);

  // Cargar fragmento de código cuando cambia el error seleccionado
  useEffect(() => {
    if (!selectedDiagnosticError) {
      setCodeSnippet(null);
      setCodeError(null);
      return;
    }

    const getFileAndLine = () => {
      const text = `${selectedDiagnosticError.errorMsg || ''}\n${selectedDiagnosticError.stack || ''}`;
      const srcRegex = /(src\/[a-zA-Z0-9_\-\/]+\.[a-zA-Z0-9]+)(?:\?[^:]*)?:(\d+)/i;
      const srcMatch = text.match(srcRegex);
      if (srcMatch) return { file: srcMatch[1], line: parseInt(srcMatch[2]) || null };
      
      const stackLines = (selectedDiagnosticError.stack || '').split('\n');
      for (const line of stackLines) {
        if (line.includes('node_modules') || line.includes('installHook.js') || line.includes('react-dom') || line.includes('react.development')) {
          continue;
        }
        const fileLineRegex = /([\w\-\/.]+\.[jt]sx?)(?:\?[^:]*)?:(\d+)/i;
        const match = line.match(fileLineRegex);
        if (match) {
          let file = match[1];
          if (file === 'App.jsx') file = 'src/App.jsx';
          return { file, line: parseInt(match[2]) || null };
        }
      }
      return null;
    };

    const detected = getFileAndLine();
    if (!detected || !detected.file) {
      setCodeError("No se pudo extraer la ruta del archivo del stack trace para inspección local.");
      return;
    }

    setLoadingCode(true);
    setCodeError(null);

    const file = detected.file;
    const line = detected.line;

    fetch(`${CLI_URL}/api/project/file?clientId=${encodeURIComponent(selectedDiagnosticError.clientId)}&relativePath=${encodeURIComponent(file)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.success && data.content) {
          setCodeSnippet({
            file,
            content: data.content,
            targetLine: line
          });
        } else {
          throw new Error(data.message || 'Respuesta vacía');
        }
      })
      .catch(err => {
        console.warn("CLI file read failed:", err);
        setCodeError(`El CLI Bridge local no pudo leer el archivo "${file}". Asegúrate de que el CLI esté en ejecución en localhost:3001 y que el archivo exista en la instancia.`);
      })
      .finally(() => {
        setLoadingCode(false);
      });
  }, [selectedDiagnosticError]);

  // --- LOGICA DE FILTRADO Y AGRUPAMIENTO ---

  const filteredFailures = useMemo(() => {
    let list = failures.filter(fail => {
      const matchesClient = selectedErrorClientFilter === 'todos' || fail.clientId.toLowerCase() === selectedErrorClientFilter.toLowerCase();
      const matchesSeverity = selectedErrorTypeFilter === 'todos' || (fail.type || 'error') === selectedErrorTypeFilter;
      
      let matchesStatus = true;
      if (selectedErrorStatusFilter === 'activos') {
        matchesStatus = !fail.resolved;
      } else if (selectedErrorStatusFilter === 'resueltos') {
        matchesStatus = fail.resolved;
      }

      const text = `${fail.errorMsg || ''}\n${fail.stack || ''}\n${fail.clientId || ''}`.toLowerCase();
      const matchesSearch = !errorSearchQuery || text.includes(errorSearchQuery.toLowerCase());

      return matchesClient && matchesSeverity && matchesStatus && matchesSearch;
    });

    if (groupErrorsByMessage) {
      const groups = {};
      list.forEach(fail => {
        const key = `${fail.clientId}_${fail.errorMsg}`;
        if (!groups[key]) {
          groups[key] = {
            ...fail,
            occurrences: 1,
            allIds: [fail.id]
          };
        } else {
          groups[key].occurrences += 1;
          groups[key].allIds.push(fail.id);
          if (new Date(fail.timestamp) > new Date(groups[key].timestamp)) {
            const occurrences = groups[key].occurrences;
            const allIds = groups[key].allIds;
            groups[key] = { ...fail, occurrences, allIds };
          }
        }
      });
      list = Object.values(groups).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } else {
      list = list.map(f => ({ ...f, occurrences: 1, allIds: [f.id] }));
    }

    return list;
  }, [failures, selectedErrorClientFilter, selectedErrorTypeFilter, selectedErrorStatusFilter, errorSearchQuery, groupErrorsByMessage]);

  // Paginación
  const FAILURES_PER_PAGE = 5;
  const totalFailuresPages = Math.ceil(filteredFailures.length / FAILURES_PER_PAGE) || 1;
  const currentFailuresPage = Math.min(errorsPage, totalFailuresPages);
  const paginatedFailures = useMemo(() => {
    return filteredFailures.slice((currentFailuresPage - 1) * FAILURES_PER_PAGE, currentFailuresPage * FAILURES_PER_PAGE);
  }, [filteredFailures, currentFailuresPage]);

  // --- ACCIONES ---

  const handleResolveFailure = async (idOrIds, note = '') => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    if (ids.length === 0) return;

    const updateData = {
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolutionNote: note || null
    };

    if (isSimulated) {
      setFailures(failures.map(f => ids.includes(f.id) ? { ...f, ...updateData } : f));
      addLog(`[SANDBOX] ${ids.length} fallo(s) marcado(s) como resuelto(s).`, 'success');
      showToast(`${ids.length} fallo(s) resuelto(s) (Sandbox)`, { type: 'success' });
      return;
    }

    try {
      const batchPromises = ids.map(id => 
        updateDoc(doc(db, 'app_failures', id), updateData)
      );
      await Promise.all(batchPromises);
      setFailures(failures.map(f => ids.includes(f.id) ? { ...f, ...updateData } : f));
      addLog(`[TELEMETRÍA] ${ids.length} fallo(s) marcado(s) como resuelto(s) en Firestore.`, 'success');
      showToast(`${ids.length} fallo(s) marcado(s) como resuelto(s)`, { type: 'success' });
    } catch (err) {
      console.error("Error updating failure docs:", err);
      showToast('Error al resolver fallo(s)', { type: 'error' });
    }
  };

  const handleResolveAllFailures = async () => {
    const activeFailures = failures.filter(f => !f.resolved);
    if (activeFailures.length === 0) {
      showToast('No hay fallos activos por resolver', { type: 'info' });
      return;
    }

    if (isSimulated) {
      setFailures(failures.map(f => ({ ...f, resolved: true, resolvedAt: new Date().toISOString() })));
      addLog(`[SANDBOX] Todos los fallos (${activeFailures.length}) marcados como resueltos.`, 'success');
      showToast('Todos los fallos resueltos (Sandbox)', { type: 'success' });
      return;
    }

    try {
      const batchPromises = activeFailures.map(f => 
        updateDoc(doc(db, 'app_failures', f.id), { 
          resolved: true, 
          resolvedAt: new Date().toISOString(),
          resolutionNote: 'Resolución masiva desde consola central'
        })
      );
      await Promise.all(batchPromises);
      setFailures(failures.map(f => ({ ...f, resolved: true, resolvedAt: new Date().toISOString() })));
      addLog(`[TELEMETRÍA] ${activeFailures.length} fallos marcados como resueltos en Firestore.`, 'success');
      showToast('Todos los fallos marcados como resueltos', { type: 'success' });
    } catch (err) {
      console.error("Error resolving all failures:", err);
      showToast('Error al resolver todos los fallos', { type: 'error' });
    }
  };

  const handleClearAllFailures = async () => {
    if (failures.length === 0) {
      showToast('No hay incidentes para vaciar', { type: 'info' });
      return;
    }

    const confirm = await showAlert({
      title: '¿Vaciar Historial?',
      message: `Esta acción eliminará de forma permanente los ${failures.length} incidentes del historial. No se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Sí, Vaciar',
      cancelText: 'Cancelar'
    });

    if (!confirm) return;

    if (isSimulated) {
      setFailures([]);
      setErrorsPage(1);
      addLog('[SANDBOX] Historial de incidentes vaciado por completo.', 'info');
      showToast('Historial vaciado (Sandbox)', { type: 'success' });
      return;
    }

    try {
      const batchPromises = failures.map(f => 
        deleteDoc(doc(db, 'app_failures', f.id))
      );
      await Promise.all(batchPromises);
      setFailures([]);
      setErrorsPage(1);
      addLog(`[TELEMETRÍA] ${failures.length} incidentes eliminados físicamente de la colección 'app_failures'.`, 'success');
      showToast('Historial de incidentes vaciado por completo', { type: 'success' });
    } catch (err) {
      console.error("Error clearing all failures:", err);
      showToast('Error al vaciar el historial', { type: 'error' });
    }
  };

  const handleSimulateFailure = async (params) => {
    const tokenDoc = telemetryTokens.find(t => t.clientId === params.clientId);
    const activeToken = tokenDoc ? tokenDoc.id : (telemetryTokens[0]?.id || 'token-fallback');

    const newFailure = {
      clientId: params.clientId || 'desconocido',
      token: activeToken,
      niche: params.niche || 'General',
      timestamp: new Date().toISOString(),
      errorMsg: params.errorMsg,
      stack: params.stack,
      deviceInfo: `Chrome/124.0.0 (Windows NT 10.0; Win64; x64) WebView2`,
      resolved: false,
      type: params.type || 'error',
      source: params.source || 'automatic',
      environment: {
        url: `https://${params.clientId || 'ventas'}.grupocontrol.com/tienda`,
        userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0`,
        screenResolution: "1920x1080",
        viewport: "1440x900",
        language: "es-ES"
      },
      user: {
        uid: "usr-simulated-" + Math.floor(Math.random() * 1000),
        email: "simulado@test.com"
      }
    };

    if (isSimulated) {
      const simulatedId = `sim-fail-${Date.now()}`;
      setFailures([{ id: simulatedId, ...newFailure }, ...failures]);
      addLog(`[SANDBOX] Fallo simulado agregado para: ${newFailure.clientId}`, 'error');
      showToast('Fallo simulado agregado (Sandbox)', { type: 'error' });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'app_failures'), newFailure);
      setFailures([{ id: docRef.id, ...newFailure }, ...failures]);
      addLog(`[TELEMETRÍA] Registrado nuevo reporte de fallo de: ${newFailure.clientId} en Firestore Central`, 'error');
      showToast('Fallo inyectado en Firestore Central', { type: 'success' });
    } catch (err) {
      console.error("Error creating telemetry failure doc:", err);
      showToast('Error al inyectar fallo en base de datos', { type: 'error' });
    }
  };

  return (
    <div className="space-y-6 tab-content-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <AlertTriangle size={20} className="text-red-500 animate-pulse" />
            <span>Consola de Errores y Diagnóstico</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-semibold">Monitoreo en tiempo real de fallos e incidentes en aplicaciones de clientes.</p>
        </div>
        <div className="flex flex-row items-center gap-1.5 sm:gap-2.5 w-full sm:w-auto">
          <button 
            onClick={() => {
              setSimFailureClientId(clientesSaas[0]?.id || 'ventas-smartfix');
              setSimFailureNiche(clientesSaas[0]?.niche || 'Ropa y Calzado');
              setSimFailureManualClientId('');
              setSimFailureErrorType('0');
              setSimFailureCustomMsg('');
              setSimFailureCustomStack('');
              setIsSimulateFailureModalOpen(true);
            }}
            className="flex-1 sm:flex-none justify-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-violet-650/10 hover:bg-violet-650/20 border border-violet-500/25 text-violet-400 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 active:scale-95 shadow-sm shrink-0"
          >
            <Activity size={13} className="animate-pulse" />
            Simular<span className="hidden sm:inline"> Fallo</span>
          </button>
          <button 
            onClick={handleResolveAllFailures}
            disabled={failures.filter(f => !f.resolved).length === 0}
            className="flex-1 sm:flex-none justify-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm shrink-0 font-bold"
          >
            <CheckCircle size={13} />
            Resolver<span className="hidden sm:inline"> Todos</span>
          </button>
          <button 
            onClick={handleClearAllFailures}
            disabled={failures.length === 0}
            className="flex-1 sm:flex-none justify-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-red-650/10 hover:bg-red-650/20 border border-red-500/25 text-red-400 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm shrink-0 font-bold"
          >
            <Trash2 size={13} />
            Vaciar<span className="hidden sm:inline"> Historial</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => {
            setSelectedErrorStatusFilter('activos');
            setErrorsPage(1);
          }}
          className={`bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm cursor-pointer hover:border-red-500/25 hover:bg-red-500/5 transition-all group ${
            selectedErrorStatusFilter === 'activos' ? 'border-red-500/30 bg-red-500/5' : ''
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
            failures.filter(f => !f.resolved).length > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block tracking-wider">Fallos Activos</span>
            <span className="text-xl font-black text-[var(--color-text)] leading-none mt-0.5 flex items-center gap-1.5">
              {failures.filter(f => !f.resolved).length}
              {failures.filter(f => !f.resolved).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              )}
            </span>
          </div>
        </div>

        <div 
          onClick={() => {
            setSelectedErrorStatusFilter('activos');
            setSelectedErrorClientFilter('todos');
            setErrorsPage(1);
          }}
          className={`bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm cursor-pointer hover:border-violet-500/25 hover:bg-violet-500/5 transition-all group ${
            selectedErrorStatusFilter === 'activos' && selectedErrorClientFilter === 'todos' ? 'border-violet-500/30 bg-violet-500/5' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block tracking-wider">Clientes Afectados</span>
            <span className="text-xl font-black text-[var(--color-text)] leading-none mt-0.5">
              {new Set(failures.filter(f => !f.resolved).map(f => f.clientId)).size}
            </span>
          </div>
        </div>

        <div 
          onClick={() => {
            setSelectedErrorStatusFilter('todos');
            setSelectedErrorClientFilter('todos');
            setSelectedErrorTypeFilter('todos');
            setErrorSearchQuery('');
            setErrorsPage(1);
          }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm cursor-pointer hover:border-cyan-500/25 hover:bg-cyan-500/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block tracking-wider">Uptime del Motor</span>
            <span className="text-xl font-black text-[var(--color-text)] leading-none mt-0.5 text-cyan-400">
              {failures.filter(f => !f.resolved).length > 0 ? '99.78%' : '100.00%'}
            </span>
          </div>
        </div>
      </div>

      {/* Filtro y Listado */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-3 border-b border-[var(--color-border)]">
          <h3 className="font-extrabold text-sm text-[var(--color-text)] shrink-0">Historial de Incidentes</h3>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar error o stack..."
                value={errorSearchQuery}
                onChange={(e) => {
                  setErrorSearchQuery(e.target.value);
                  setErrorsPage(1);
                }}
                className="pl-8 pr-3 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-violet-500/50 w-full sm:w-[180px] font-semibold"
              />
              <Search size={12} className="absolute left-2.5 top-2 text-[var(--color-text-muted)]" />
            </div>

            {/* Selector de Cliente */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold text-[var(--color-text-muted)] shrink-0">Cliente:</span>
              <CustomSelect
                value={selectedErrorClientFilter}
                onChange={(e) => {
                  setSelectedErrorClientFilter(e.target.value);
                  setErrorsPage(1);
                }}
                options={[
                  { id: 'todos', label: 'Todos' },
                  ...Array.from(new Set(failures.map(f => f.clientId))).map(cid => ({
                    id: cid,
                    label: cid
                  }))
                ]}
                className="!py-1 !px-2 font-bold min-w-[110px]"
              />
            </div>

            {/* Filtro por Estado */}
            <div className="flex items-center gap-1 bg-[var(--color-surface-2)] p-1 rounded-xl border border-[var(--color-border)]">
              {[
                { id: 'activos', label: 'Activos' },
                { id: 'resueltos', label: 'Resueltos' },
                { id: 'todos', label: 'Todos' }
              ].map(tab => {
                const count = tab.id === 'activos' 
                  ? failures.filter(f => !f.resolved).length 
                  : tab.id === 'resueltos'
                    ? failures.filter(f => f.resolved).length
                    : failures.length;
                const active = selectedErrorStatusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSelectedErrorStatusFilter(tab.id);
                      setErrorsPage(1);
                    }}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border-none bg-transparent ${
                      active
                        ? 'bg-indigo-650 text-white shadow'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 px-1 py-0.2 rounded-full text-[8px] font-black ${
                        active 
                          ? 'bg-indigo-850 text-white' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selector de Severidad */}
            <CustomSelect
              value={selectedErrorTypeFilter}
              onChange={(e) => {
                setSelectedErrorTypeFilter(e.target.value);
                setErrorsPage(1);
              }}
              options={[
                { id: 'todos', label: 'Severidad (Cualquiera)' },
                { id: 'error', label: '🔴 Errores' },
                { id: 'warning', label: '🟡 Advertencias' },
                { id: 'info', label: '🔵 Información' }
              ]}
              className="!py-1 !px-2 font-bold text-[10px] min-w-[140px]"
            />

            {/* Agrupación */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none px-2.5 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[10px] font-extrabold text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-all">
              <input
                type="checkbox"
                checked={groupErrorsByMessage}
                onChange={(e) => {
                  setGroupErrorsByMessage(e.target.checked);
                  setErrorsPage(1);
                }}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 w-3 h-3 cursor-pointer"
              />
              <span>Agrupar repetidos</span>
            </label>
          </div>
        </div>

        {/* Listado */}
        {filteredFailures.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle size={36} className="text-emerald-500/40 mx-auto animate-bounce" />
            <p className="text-xs font-black text-[var(--color-text-muted)]">Sin incidentes reportados</p>
            <p className="text-[10px] text-slate-500 font-bold">No se encontraron incidentes con los filtros activos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedFailures.map((fail) => {
              const isExpanded = expandedErrorId === fail.id;
              const severity = fail.type || 'error';
              const severityColor = severity === 'info' 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                : severity === 'warning'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20';

              return (
                <div 
                  key={fail.id} 
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    fail.resolved 
                      ? 'bg-[var(--color-surface-2)]/20 border-[var(--color-border)]/50 opacity-65' 
                      : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-[var(--color-border)]/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[9px] font-black rounded uppercase">
                          {fail.clientId}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold">
                          • {fail.niche}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          • {new Date(fail.timestamp).toLocaleString()}
                        </span>
                        
                        <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded border ${severityColor}`}>
                          {severity}
                        </span>

                        <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded border ${
                          fail.source === 'manual' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {fail.source === 'manual' ? 'Manual' : 'Automático'}
                        </span>

                        {fail.resolved ? (
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded border border-emerald-500/20">
                            Resuelto
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded border border-red-500/20 animate-pulse">
                            Activo
                          </span>
                        )}

                        {fail.occurrences > 1 && (
                          <span className="px-1.5 py-0.5 bg-violet-650/20 border border-violet-500/35 text-violet-400 text-[8px] font-black rounded uppercase animate-pulse">
                            x{fail.occurrences} Impactos
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-red-400 break-words mt-1">{fail.errorMsg}</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">Dispositivo: {fail.deviceInfo}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      <button 
                        onClick={() => setSelectedDiagnosticError(fail)}
                        className="px-2.5 py-1 bg-violet-650/10 hover:bg-violet-650/20 border border-violet-500/25 text-violet-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Diagnosticar
                      </button>
                      <button 
                        onClick={() => setExpandedErrorId(isExpanded ? null : fail.id)}
                        className="px-2.5 py-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Ocultar Stack' : 'Ver Stack'}
                      </button>
                      {!fail.resolved && (
                        <button 
                          onClick={() => {
                            if (resolutionNoteInputId === fail.id) {
                              setResolutionNoteInputId(null);
                            } else {
                              setResolutionNoteInputId(fail.id);
                              setResolutionNoteText('');
                            }
                          }}
                          className={`px-2.5 py-1 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer active:scale-95 shadow border-none ${
                            resolutionNoteInputId === fail.id ? 'bg-slate-700 hover:bg-slate-600' : 'bg-emerald-650 hover:bg-emerald-600'
                          }`}
                        >
                          {resolutionNoteInputId === fail.id ? 'Cancelar' : 'Resolver'}
                        </button>
                      )}
                    </div>
                  </div>

                  {resolutionNoteInputId === fail.id && (
                    <div className="mt-3 p-3.5 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl space-y-2 animate-fade-in">
                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono">Nota de Solución (Opcional):</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ej: Creado índice compuesto, corregido error de null..."
                          value={resolutionNoteText}
                          onChange={(e) => setResolutionNoteText(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] placeholder-slate-550 focus:outline-none focus:border-violet-500/50 font-semibold"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const idsToResolve = groupErrorsByMessage && fail.allIds ? fail.allIds : fail.id;
                              handleResolveFailure(idsToResolve, resolutionNoteText);
                              setResolutionNoteInputId(null);
                              setResolutionNoteText('');
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            const idsToResolve = groupErrorsByMessage && fail.allIds ? fail.allIds : fail.id;
                            handleResolveFailure(idsToResolve, resolutionNoteText);
                            setResolutionNoteInputId(null);
                            setResolutionNoteText('');
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-550 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors active:scale-95 shadow border-none"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  )}

                  {fail.resolved && (
                    <div className="mt-2.5 px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col gap-0.5 text-[10px] text-[var(--color-text-muted)] font-bold">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle size={10} />
                        <span>Resuelto</span>
                        {fail.resolvedAt && (
                          <span className="text-slate-500 font-mono font-normal">
                            • {new Date(fail.resolvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {fail.resolutionNote && (
                        <p className="mt-0.5 text-slate-355 italic font-mono select-all">
                          &ldquo;{fail.resolutionNote}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3.5 space-y-1.5 animate-fade-in">
                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono">Stack Trace Diagnóstico:</span>
                      <pre className="bg-[#0c101a] font-mono text-[10px] p-3.5 rounded-xl border border-red-500/15 overflow-x-auto text-red-350 leading-relaxed shadow-inner select-text select-all font-bold">
                        {fail.stack}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 select-none">
              <Pagination
                currentPage={currentFailuresPage}
                totalPages={totalFailuresPages}
                onPageChange={setErrorsPage}
                siblingCount={1}
                showAlways={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== DRAWER LATERAL DE DIAGNÓSTICO INTELIGENTE ===== */}
      {selectedDiagnosticError && (
        <div className="fixed inset-0 z-[80] overflow-hidden select-none">
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedDiagnosticError(null)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <div className="w-screen max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col justify-between select-text animate-slide-in-right">
              {/* Header */}
              <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[9px] font-black rounded uppercase">
                      {selectedDiagnosticError.clientId}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold">
                      {new Date(selectedDiagnosticError.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[var(--color-text)] mt-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500 animate-bounce" />
                    Diagnóstico de Incidente
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedDiagnosticError(null)}
                  className="w-8 h-8 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text)] flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Contenido Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono">Mensaje de Error:</span>
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold font-mono break-words leading-relaxed shadow-sm">
                    {selectedDiagnosticError.errorMsg}
                  </div>
                </div>

                {(() => {
                  const errMsg = selectedDiagnosticError.errorMsg || '';
                  const errStack = selectedDiagnosticError.stack || '';
                  const fullText = `${errMsg}\n${errStack}`;
                  
                  let diagnosis = "Error genérico de ejecución. Se recomienda auditar el stack trace para identificar el origen.";
                  let solution = "Revisar los imports, variables de estado de React, y asegurar que no haya referencias a objetos undefined.";
                  let indexUrl = null;

                  const indexRegex = /(https:\/\/console\.firebase\.google\.com\/[^\s\)]+)/i;
                  const indexMatch = fullText.match(indexRegex);
                  if (indexMatch) {
                    indexUrl = indexMatch[1];
                  }

                  if (errMsg.includes('Failed to fetch dynamically imported module')) {
                    diagnosis = "Error de carga del módulo dinámico de la página. Esto ocurre usualmente por desconexión temporal de internet (modo offline) del usuario en el navegador, un caché corrupto del service worker, o si el archivo fue borrado o renombrado físicamente del disco.";
                    solution = "1. Verifica que el archivo de la página exista en la ruta especificada de la aplicación.\n2. Asegura que el router tenga correctamente declarada la importación perezosa.\n3. Si fue un corte de internet temporal del cliente en producción, no requiere cambios en el código.";
                  } else if (errMsg.includes('Missing or insufficient permissions') || errMsg.includes('permission-denied')) {
                    diagnosis = "Acceso denegado por Firestore. La consulta o escritura del cliente fue bloqueada por no cumplir con los criterios de seguridad definidos en las reglas de base de datos.";
                    solution = "1. Revisa las reglas en `firestore.rules` asociadas a la colección afectada.\n2. Verifica si el usuario cuenta con los claims o roles necesarios en su sesión de Firebase Auth.\n3. Asegúrate de invocar la limpieza de listeners `onSnapshot` al cerrar sesión.";
                  } else if (fullText.includes('requires an index') || fullText.includes('index-creation') || indexUrl) {
                    diagnosis = "Falta de índice compuesto en Firestore. Estás realizando una consulta compleja (con múltiples filtros 'where' y/o un 'orderBy') que requiere la creación de un índice específico en la base de datos de Firebase.";
                    solution = "1. Crea el índice haciendo clic en el enlace provisto por el SDK de Firebase.\n2. Asegúrate de que el índice esté habilitado antes de volver a realizar la consulta.\n3. Puedes usar el botón directo de abajo para ir a la consola de Firebase.";
                  } else if (errMsg.includes('auth/user-not-found') || errMsg.includes('auth/wrong-password')) {
                    diagnosis = "Credenciales incorrectas o usuario inexistente. Se intentó iniciar sesión o realizar una operación de autenticación con datos que no coinciden con los registros de Firebase Auth.";
                    solution = "1. Verifica que el correo esté bien escrito y el usuario exista en Firebase Authentication.\n2. Asegúrate de que la contraseña ingresada coincida.\n3. Implementa validaciones de cliente más amigables.";
                  } else if (errMsg.includes('auth/network-request-failed')) {
                    diagnosis = "Fallo de conexión de red de Firebase Auth. El cliente no pudo comunicarse con los servidores de autenticación de Google.";
                    solution = "1. Verifica la conexión a internet en el dispositivo del cliente.\n2. Asegúrate de que no haya firewalls o extensiones (AdBlockers) bloqueando las llamadas a googleapis.com.";
                  } else if (errMsg.includes('Cannot read properties of') || errMsg.includes('is not a function')) {
                    diagnosis = "Referencia nula o undefined en JavaScript (Null Pointer Exception). Se intentó acceder a una propiedad o invocar una función en una variable que no ha sido inicializada.";
                    solution = "1. Utiliza encadenamiento opcional (optional chaining) como `objeto?.propiedad`.\n2. Verifica que las llamadas asíncronas hayan completado la carga antes de renderizar los datos.\n3. Inicializa los estados de React con valores por defecto válidos (ej. un array vacío `[]` para listados).";
                  } else if (fullText.toLowerCase().includes('quota-exceeded') || fullText.toLowerCase().includes('resource-exhausted')) {
                    diagnosis = "Cuota de Firebase agotada o recurso exhausto. Se ha superado el límite diario de lecturas/escrituras del plan Spark gratuito o los límites generales de Firestore.";
                    solution = "1. Revisa las consultas y listeners en tiempo real que podrían estar generando lecturas infinitas.\n2. Optimiza el caching local o considera subir al plan Blaze de pago por uso.\n3. Audita reportes repetitivos de telemetría.";
                  } else if (errMsg.includes('storage/unauthorized') || errMsg.includes('storage/canceled')) {
                    diagnosis = "Permisos denegados en Firebase Storage. Se intentó subir, borrar o leer un archivo (imagen, PDF, etc.) que no cumple con las reglas de seguridad de Storage.";
                    solution = "1. Revisa el archivo `storage.rules` en el proyecto.\n2. Asegúrate de que las reglas de escritura/lectura permitan la ruta y que el usuario esté correctamente autenticado.\n3. Verifica si el formato o tamaño del archivo no excede límites lógicos.";
                  } else if (errMsg.includes('JSON.parse') || errMsg.includes('Unexpected token') || errMsg.toLowerCase().includes('json parse')) {
                    diagnosis = "Fallo de deserialización JSON (JSON Parse Error). Se intentó analizar una cadena de texto que no tiene formato JSON válido o que es undefined/null.";
                    solution = "1. Verifica el origen del string (localstorage, API externa, etc.) y asegúrate de que sea un JSON válido.\n2. Envuelve el parseo en un bloque `try-catch` para evitar caídas de la aplicación.\n3. Añade una validación previa: `if (typeof str === 'string' && str.trim())`.";
                  } else if (fullText.includes('blocked by CORS policy') || fullText.includes('No \'Access-Control-Allow-Origin\'')) {
                    diagnosis = "Bloqueo de CORS (Cross-Origin Resource Sharing). El navegador del usuario bloqueó una solicitud HTTP saliente porque el servidor remoto no expone las cabeceras CORS necesarias.";
                    solution = "1. Si es una función propia de Firebase, asegúrate de haber configurado CORS: `cors({ origin: true })` en Node.js.\n2. Si es una API de terceros, verifica si necesitas un proxy o si debes registrar el dominio del cliente en la lista blanca de la API.";
                  } else if (fullText.includes('Failed to get document because the client is offline') || errMsg.includes('unavailable') || fullText.toLowerCase().includes('client is offline')) {
                    diagnosis = "Firestore sin conexión (Offline). El cliente Firestore del navegador no pudo sincronizar o leer el documento porque el dispositivo está offline o Firestore está temporalmente inaccesible.";
                    solution = "1. Revisa la conectividad a internet del usuario final.\n2. Asegúrate de habilitar la persistencia offline de Firestore en la configuración inicial si deseas soporte sin red.\n3. Envuelve las lecturas clave en bloques de captura de excepciones.";
                  }

                  let detectedFile = 'N/A';
                  let detectedLine = 'N/A';
                  
                  const getFileAndLine = () => {
                    const text = `${selectedDiagnosticError.errorMsg || ''}\n${selectedDiagnosticError.stack || ''}`;
                    const srcRegex = /(src\/[a-zA-Z0-9_\-\/]+\.[a-zA-Z0-9]+)(?:\?[^:]*)?:(\d+)/i;
                    const srcMatch = text.match(srcRegex);
                    if (srcMatch) {
                      return { file: srcMatch[1], line: srcMatch[2] };
                    }
                    const stackLines = (selectedDiagnosticError.stack || '').split('\n');
                    for (const line of stackLines) {
                      if (line.includes('node_modules') || line.includes('installHook.js') || line.includes('react-dom') || line.includes('react.development')) {
                        continue;
                      }
                      const fileLineRegex = /([\w\-\/.]+\.[jt]sx?)(?:\?[^:]*)?:(\d+)/i;
                      const match = line.match(fileLineRegex);
                      if (match) {
                        let file = match[1];
                        if (file === 'App.jsx') file = 'src/App.jsx';
                        return { file, line: match[2] };
                      }
                    }
                    const generalRegex = /([\w\-\/.]+\.[jt]sx?)(?:\?[^:]*)?:(\d+)/i;
                    const genMatch = text.match(generalRegex);
                    if (genMatch) {
                      let file = genMatch[1];
                      if (file === 'App.jsx') file = 'src/App.jsx';
                      return { file, line: genMatch[2] };
                    }
                    return { file: 'N/A', line: 'N/A' };
                  };
                  
                  const extracted = getFileAndLine();
                  detectedFile = extracted.file;
                  detectedLine = extracted.line;

                  return (
                    <>
                      <div className="space-y-4 bg-violet-500/5 border border-violet-500/15 p-5 rounded-2xl">
                        <h4 className="font-extrabold text-xs text-[var(--color-text)] flex items-center gap-1.5">
                          <Activity size={13} className="text-violet-400" />
                          Análisis del Asistente
                        </h4>
                        
                        <div className="space-y-3 text-xs leading-relaxed text-[var(--color-text-muted)] font-semibold">
                          <div>
                            <span className="font-extrabold text-[var(--color-text)] block mb-0.5">Causa Probable:</span>
                            <p>{diagnosis}</p>
                          </div>
                          <div>
                            <span className="font-extrabold text-[var(--color-text)] block mb-0.5">Solución Recomendada:</span>
                            <p className="whitespace-pre-line leading-relaxed">{solution}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {indexUrl && (
                          <a
                            href={indexUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-505 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] border-none text-center"
                          >
                            <ArrowUpRight size={13} />
                            Crear Índice Compuesto en Firebase
                          </a>
                        )}

                        <button
                          onClick={async () => {
                            const promptText = `En el proyecto '${selectedDiagnosticError.clientId}', corrige el error '${selectedDiagnosticError.errorMsg}' que está ocurriendo en el archivo '${detectedFile}' (Línea: ${detectedLine}, Niche: ${selectedDiagnosticError.niche}). Revisa el stack trace:\n${selectedDiagnosticError.stack || 'No stack trace available'}`;
                            try {
                              await navigator.clipboard.writeText(promptText);
                              showToast('Prompt copiado. ¡Pégalo en el chat de Antigravity!', { type: 'success' });
                            } catch (err) {
                              showToast('No se pudo copiar el prompt', { type: 'error' });
                            }
                          }}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] border-none"
                        >
                          <Copy size={13} />
                          Copiar Prompt para Antigravity
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              const finalPath = codeSnippet?.file || detectedFile;
                              await navigator.clipboard.writeText(finalPath);
                              showToast('Ruta de archivo copiada', { type: 'success' });
                            } catch (err) {
                              showToast('Error al copiar ruta', { type: 'error' });
                            }
                          }}
                          className="w-full py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-[var(--color-text)] font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          <Database size={12} className="text-slate-400" />
                          Copiar Ruta de Archivo ({(codeSnippet?.file || detectedFile).split(/[\\/]/).pop()})
                        </button>
                      </div>
                    </>
                  );
                })()}

                {/* Visor de Código en Vivo */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono flex items-center gap-1.5">
                    <Terminal size={10} className="text-violet-400" /> Visor de Código en Vivo:
                  </span>
                  
                  {loadingCode && (
                    <div className="p-6 bg-[#0c101a] border border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center gap-2.5 min-h-[140px]">
                      <Activity size={18} className="text-indigo-400 animate-spin" />
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold">Conectando con CLI Bridge...</span>
                    </div>
                  )}

                  {codeError && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[10px] font-mono text-amber-500 leading-relaxed font-bold">
                      ⚠️ {codeError}
                    </div>
                  )}

                  {!loadingCode && !codeError && codeSnippet && (
                    <div className="bg-[#0c101a] border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col shadow-inner select-text">
                      <div className="bg-[#070b12] px-3.5 py-2 border-b border-[var(--color-border)] flex items-center justify-between font-mono text-[9px] text-slate-400">
                        <span className="truncate">{codeSnippet.file.split(/[\\/]/).slice(-2).join('/')}</span>
                        {codeSnippet.targetLine && (
                          <span className="text-violet-400 font-extrabold shrink-0 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                            Línea: {codeSnippet.targetLine}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 overflow-x-auto text-[9.5px] font-mono leading-relaxed text-slate-350 max-h-[260px] overflow-y-auto scrollbar-thin">
                        <pre className="grid grid-cols-1 font-bold">
                          {(() => {
                            const lines = codeSnippet.content.split('\n');
                            const target = codeSnippet.targetLine;
                            const startIdx = target ? Math.max(0, target - 6) : 0;
                            const endIdx = target ? Math.min(lines.length - 1, target + 5) : lines.length - 1;
                            
                            const snippetLines = [];
                            for (let i = startIdx; i <= endIdx; i++) {
                              const lineNum = i + 1;
                              const isTarget = lineNum === target;
                              snippetLines.push(
                                <div 
                                  key={i} 
                                  className={`flex items-start select-text ${isTarget ? 'bg-red-500/15 text-red-200 border-l-2 border-red-500 pl-1 -ml-1 py-0.5 font-bold' : ''}`}
                                >
                                  <span className={`w-8 text-right select-none text-[8.5px] pr-2.5 font-mono ${isTarget ? 'text-red-400' : 'text-slate-600'}`}>
                                    {lineNum}
                                  </span>
                                  <span className="whitespace-pre break-all font-mono">
                                    {lines[i]}
                                  </span>
                                </div>
                              );
                            }
                            return snippetLines;
                          })()}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contexto de Entorno */}
                {selectedDiagnosticError.environment && (
                  <div className="space-y-3 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] p-4 rounded-2xl text-xs select-text">
                    <h4 className="font-extrabold text-xs text-[var(--color-text)] flex items-center gap-1.5 border-b border-[var(--color-border)] pb-2 mb-2">
                      <Smartphone size={13} className="text-indigo-400" />
                      Entorno de Ejecución
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[var(--color-text-muted)] font-mono text-[10px] font-bold">
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] block">Resolución:</span>
                        <span>{selectedDiagnosticError.environment.screenResolution || 'Desconocida'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] block">Viewport:</span>
                        <span>{selectedDiagnosticError.environment.viewport || 'Desconocido'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] block">Idioma:</span>
                        <span>{selectedDiagnosticError.environment.language || 'Desconocido'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] block">Página Activa:</span>
                        <a 
                          href={selectedDiagnosticError.environment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline break-all block"
                        >
                          {selectedDiagnosticError.environment.url ? new URL(selectedDiagnosticError.environment.url).pathname : 'Ver URL'}
                        </a>
                      </div>
                    </div>
                    {selectedDiagnosticError.environment.userAgent && (
                      <div className="mt-2 text-[9px] font-mono bg-slate-900/60 p-2 rounded-xl text-slate-400 break-all select-all">
                        <span className="font-bold text-[var(--color-text-muted)] block mb-1">User Agent:</span>
                        {selectedDiagnosticError.environment.userAgent}
                      </div>
                    )}
                  </div>
                )}

                {/* Datos de Usuario */}
                {selectedDiagnosticError.user && (
                  <div className="space-y-2 bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-2xl text-xs select-text">
                    <h4 className="font-extrabold text-xs text-[var(--color-text)] flex items-center gap-1.5 border-b border-[var(--color-border)]/30 pb-2 mb-2">
                      <User size={13} className="text-indigo-400" />
                      Usuario Sesión
                    </h4>
                    <div className="space-y-1.5 text-[var(--color-text-muted)] font-mono text-[10px] font-bold">
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] mr-1">UID:</span>
                        <span className="select-all">{selectedDiagnosticError.user.uid || 'N/A'}</span>
                      </div>
                      {selectedDiagnosticError.user.email && (
                        <div>
                          <span className="font-extrabold text-[var(--color-text)] mr-1">Email:</span>
                          <span className="select-all">{selectedDiagnosticError.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono">Stack Trace Completo:</span>
                  <pre className="bg-[#0c101a] font-mono text-[9px] p-4 rounded-2xl border border-[var(--color-border)] overflow-x-auto text-red-350/90 leading-relaxed shadow-inner select-text select-all font-bold">
                    {selectedDiagnosticError.stack || "Sin stack trace disponible."}
                  </pre>
                </div>
              </div>

              {/* Footer Drawer */}
              <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedDiagnosticError(null)}
                  className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 transition-all cursor-pointer bg-transparent"
                >
                  Cerrar
                </button>

                {!selectedDiagnosticError.resolved && (
                  <button
                    onClick={async () => {
                      await handleResolveFailure(selectedDiagnosticError.id);
                      setSelectedDiagnosticError(null);
                    }}
                    className="px-4 py-2 bg-emerald-650 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow border-none"
                  >
                    Resolver Incidente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE SIMULACION DE FALLOS ===== */}
      {isSimulateFailureModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4 select-none">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsSimulateFailureModalOpen(false)} />
          <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <Activity size={16} className="text-violet-400 animate-pulse" />
                  Simulador de Fallos Telemetría (Sandbox)
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-bold">Inyecta fallos de prueba dirigidos a clientes y entornos reales o manuales.</p>
              </div>
              <button 
                onClick={() => setIsSimulateFailureModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors bg-transparent border-none"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left select-text">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">1. Cliente Destino</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-1 font-bold">Seleccionar de CRM</span>
                    <select
                      value={simFailureClientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSimFailureClientId(val);
                        if (val !== 'manual') {
                          const cli = clientesSaas.find(c => c.id === val);
                          setSimFailureNiche(cli ? (cli.niche || 'General') : 'General');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70 font-bold"
                    >
                      {clientesSaas.map(c => (
                        <option key={c.id} value={c.id}>{c.id} ({c.niche || 'General'})</option>
                      ))}
                      <option value="manual">-- Ingresar ID Manual --</option>
                    </select>
                  </div>
                  
                  {simFailureClientId === 'manual' ? (
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-1 font-bold">ID Cliente & Nicho</span>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="cliente-test"
                          value={simFailureManualClientId}
                          onChange={(e) => setSimFailureManualClientId(e.target.value)}
                          className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70 font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Nicho (ej. Modas)"
                          value={simFailureNiche}
                          onChange={(e) => setSimFailureNiche(e.target.value)}
                          className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70 font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-end">
                      <div className="p-2.5 bg-slate-950/50 border border-slate-800/40 rounded-xl">
                        <div className="text-[9px] text-slate-500 font-bold">Nicho Detectado</div>
                        <div className="font-extrabold text-slate-300 mt-0.5">{simFailureNiche}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">2. Tipo de Incidente / Error</label>
                <select
                  value={simFailureErrorType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSimFailureErrorType(val);
                    if (val !== 'custom') {
                      const errTemplates = [
                        {
                          msg: "TypeError: Cannot read properties of undefined (reading 'split')",
                          stack: "TypeError: Cannot read properties of undefined (reading 'split')\n    at CategoriasView.jsx:42:15\n    at renderWithHooks (react-dom.development.js:15486:18)\n    at updateFunctionComponent (react-dom.development.js:17356:15)"
                        },
                        {
                          msg: "FirebaseError: [code=unavailable]: The service is temporarily unavailable.",
                          stack: "FirebaseError: The service is temporarily unavailable.\n    at index.esm2017.js:520:25\n    at async fetchCollection (uploadService.js:12:15)"
                        },
                        {
                          msg: "ReferenceError: process is not defined",
                          stack: "ReferenceError: process is not defined\n    at index.js:12:5\n    at Object.module.exports (main.js:2:1)"
                        },
                        {
                          msg: "TypeError: Failed to fetch (Network Request Blocked)",
                          stack: "TypeError: Failed to fetch\n    at async postTelemetry (telemetryService.js:45:12)\n    at async triggerReport (DeveloperBillingPanel.jsx:112:9)"
                        },
                        {
                          msg: "PaymentGatewayError: [code=gateway_timeout]: Connection to payment server timed out.",
                          stack: "PaymentGatewayError: Connection to payment server timed out.\n    at paymentService.js:84:18\n    at async processCheckout (CartDrawer.jsx:220:14)"
                        }
                      ];
                      const errT = errTemplates[parseInt(val)];
                      setSimFailureCustomMsg(errT.msg);
                      setSimFailureCustomStack(errT.stack);
                    } else {
                      setSimFailureCustomMsg('');
                      setSimFailureCustomStack('');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70 font-bold"
                >
                  <option value="0">TypeError (split of undefined) - JS Componentes</option>
                  <option value="1">FirebaseError (Servicio temporalmente caído) - Base de Datos</option>
                  <option value="2">ReferenceError (process is not defined) - Entorno/Vite</option>
                  <option value="3">TypeError: Failed to fetch - Problemas de Red/CORS</option>
                  <option value="4">PaymentGatewayError (Timeout) - Cobros/Monetización</option>
                  <option value="custom">-- Error Personalizado --</option>
                </select>
              </div>

              {(simFailureErrorType === 'custom' || simFailureCustomMsg) && (
                <div className="space-y-3.5 animate-in fade-in duration-200 select-text">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">Mensaje de Error</span>
                    <input
                      type="text"
                      placeholder="Mensaje o firma de error..."
                      value={simFailureCustomMsg}
                      onChange={(e) => setSimFailureCustomMsg(e.target.value)}
                      disabled={simFailureErrorType !== 'custom'}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70 font-mono text-[10px] font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">Pila de Llamadas (Stack Trace)</span>
                    <textarea
                      placeholder="Stack trace..."
                      value={simFailureCustomStack}
                      onChange={(e) => setSimFailureCustomStack(e.target.value)}
                      rows={3}
                      disabled={simFailureErrorType !== 'custom'}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70 font-mono text-[9px] resize-none font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">3. Tipo de Severidad</label>
                  <div className="flex gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800">
                    {[
                      { id: 'error', label: 'FAIL (Crítico)' },
                      { id: 'warning', label: 'WARN' },
                      { id: 'info', label: 'INFO' }
                    ].map(x => (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => setSimFailureType(x.id)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-extrabold cursor-pointer transition-all border-none ${
                          simFailureType === x.id 
                            ? (x.id === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : (x.id === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'))
                            : 'text-slate-400 hover:text-white bg-transparent'
                        }`}
                      >
                        {x.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">4. Origen de Reporte</label>
                  <div className="flex gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800">
                    {[
                      { id: 'automatic', label: 'Automático' },
                      { id: 'manual', label: 'Manual' }
                    ].map(x => (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => setSimFailureSource(x.id)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-extrabold cursor-pointer transition-all border-none ${
                          simFailureSource === x.id 
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                            : 'text-slate-400 hover:text-white bg-transparent'
                        }`}
                      >
                        {x.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsSimulateFailureModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalClientId = simFailureClientId === 'manual' ? simFailureManualClientId : simFailureClientId;
                  if (!finalClientId) {
                    showToast('Por favor escribe el ID del cliente', { type: 'error' });
                    return;
                  }
                  
                  let msg = simFailureCustomMsg;
                  let stk = simFailureCustomStack;
                  
                  if (simFailureErrorType !== 'custom') {
                    const idx = parseInt(simFailureErrorType);
                    const defaultTemplates = [
                      {
                        msg: "TypeError: Cannot read properties of undefined (reading 'split')",
                        stack: "TypeError: Cannot read properties of undefined (reading 'split')\n    at CategoriasView.jsx:42:15\n    at renderWithHooks (react-dom.development.js:15486:18)\n    at updateFunctionComponent (react-dom.development.js:17356:15)"
                      },
                      {
                        msg: "FirebaseError: [code=unavailable]: The service is temporarily unavailable.",
                        stack: "FirebaseError: The service is temporarily unavailable.\n    at index.esm2017.js:520:25\n    at async fetchCollection (uploadService.js:12:15)"
                      },
                      {
                        msg: "ReferenceError: process is not defined",
                        stack: "ReferenceError: process is not defined\n    at index.js:12:5\n    at Object.module.exports (main.js:2:1)"
                      },
                      {
                        msg: "TypeError: Failed to fetch (Network Request Blocked)",
                        stack: "TypeError: Failed to fetch\n    at async postTelemetry (telemetryService.js:45:12)\n    at async triggerReport (DeveloperBillingPanel.jsx:112:9)"
                      },
                      {
                        msg: "PaymentGatewayError: [code=gateway_timeout]: Connection to payment server timed out.",
                        stack: "PaymentGatewayError: Connection to payment server timed out.\n    at paymentService.js:84:18\n    at async processCheckout (CartDrawer.jsx:220:14)"
                      }
                    ];
                    msg = defaultTemplates[idx].msg;
                    stk = defaultTemplates[idx].stack;
                  }
                  
                  handleSimulateFailure({
                    clientId: finalClientId,
                    niche: simFailureNiche,
                    errorMsg: msg || 'Error simulado',
                    stack: stk || 'Stack simulado',
                    type: simFailureType,
                    source: simFailureSource
                  });
                  
                  setIsSimulateFailureModalOpen(false);
                }}
                className="px-4 py-2 bg-violet-650 hover:bg-violet-600/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-violet-950/20 border-none"
              >
                Inyectar Incidente
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.isVisible && (
        <GuidedToast 
          message={toast.message} 
          type={toast.type} 
          actionText={toast.actionText} 
          onActionClick={toast.onActionClick} 
          onClose={hideToast} 
        />
      )}
    </div>
  );
}
