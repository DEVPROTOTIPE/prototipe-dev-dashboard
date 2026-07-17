import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  ListTodo, 
  Check, 
  Loader2, 
  ShieldCheck,
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
  CheckSquare,
  Palette,
  Database,
  Search,
  X,
  Plus,
  FolderOpen,
  Calendar,
  Tag,
  ChevronRight,
  BarChart2,
  GitBranch,
  Info
} from 'lucide-react';

import { CLI_URL } from '../../config';
import CustomSelect from '../ui/CustomSelect';
import { useAlertConfirm } from '../common/AlertConfirmContext';

export default function SkillsRoadmapPanel({ showToast, dashBgSettings = {}, updateDashBgSetting }) {
  const { showConfirm } = useAlertConfirm();
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [integrityLoading, setIntegrityLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('roadmap');
  const [roadmapPage, setRoadmapPage] = useState(1);
  const ROADMAP_PAGE_SIZE = 20;

  // Estados Roadmap avanzado
  const [roadmapSearch, setRoadmapSearch] = useState('');
  const [roadmapFilter, setRoadmapFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [domainFilter, setDomainFilter] = useState('all');   // 'all' | 'CORE' | 'CLI' | 'DASH' | ...
  const [selectedTask, setSelectedTask] = useState(null);
  const [addTaskText, setAddTaskText] = useState('');
  const [addTaskDomain, setAddTaskDomain] = useState('CORE');
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const searchInputRef = useRef(null);

  // Estados de Edición de Tareas
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskFiles, setEditTaskFiles] = useState([]);
  const [saveEditLoading, setSaveEditLoading] = useState(false);
  const [batchBitacoraLoading, setBatchBitacoraLoading] = useState(false);
  const [bulkSandboxLoading, setBulkSandboxLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishLog, setPublishLog] = useState([]);

  // Estados de Drifts de Tareas
  const [roadmapDrifts, setRoadmapDrifts] = useState(null);
  const [codeDrifts, setCodeDrifts] = useState([]);
  const [sandboxDrifts, setSandboxDrifts] = useState([]);
  const [commitDrifts, setCommitDrifts] = useState([]);
  const [commitsList, setCommitsList] = useState([]);
  const [activeDriftTab, setActiveDriftTab] = useState('roadmap'); // 'roadmap' | 'code' | 'sandbox' | 'commits'
  const [gitModifiedFiles, setGitModifiedFiles] = useState([]);
  const [gitStatusLoading, setGitStatusLoading] = useState(false);
  const [driftsLoading, setDriftsLoading] = useState(false);

  const fetchGitStatus = async () => {
    setGitStatusLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/roadmap/git-status`);
      if (!res.ok) throw new Error('Error al conectar con la API de Git.');
      const data = await res.json();
      setGitModifiedFiles(data.files || []);
    } catch (err) {
      console.error('Fallo al obtener estado de Git:', err);
    } finally {
      setGitStatusLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      setIsEditingTask(false);
      setEditTaskDesc((selectedTask.detail?.descripcion || []).join('\n'));
      setEditTaskFiles(selectedTask.detail?.archivos || []);
      fetchGitStatus();
    } else {
      setIsEditingTask(false);
      setEditTaskDesc('');
      setEditTaskFiles([]);
      setGitModifiedFiles([]);
    }
  }, [selectedTask]);

  // Configuración de dominios del ecosistema
  const TASK_DOMAINS = [
    { value: 'CORE', label: '🌐 CORE — Transversal',    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { value: 'CLI',  label: '⚙️ CLI — Motor Bridge',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { value: 'DASH', label: '📊 DASH — Dashboard',      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { value: 'TPL',  label: '🗂️ TPL — Plantillas Base', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { value: 'PLT',  label: '🎨 PLT — Plantillas Core', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    { value: 'INST', label: '🏪 INST — Instancias',     color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { value: 'DOC',  label: '📄 DOC — Documentación',  color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { value: 'LND',  label: '🚀 LND — Landing Page',    color: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' },
    { value: 'BIZ',  label: '💼 BIZ — Negocio & Marca',  color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  ];
  const domainColor = (d) => TASK_DOMAINS.find(x => x.value === d)?.color || 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] border-[var(--color-border)]';

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
  const [scanLoading, setScanLoading] = useState(false);
  const [cleanupScanResults, setCleanupScanResults] = useState(null);

  // Estados de Sembrado Seguro
  const [seederLoading, setSeederLoading] = useState(false);
  const [seederResult, setSeederResult] = useState(null);

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
        setRoadmapPage(1); // Resetear paginación al recargar
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
        if (data.success && data.templates) {
          // Obtener nombres únicos de los clientes locales detectados
          const folders = data.templates.flatMap(tpl => 
            (tpl.clients || []).map(inst => inst.folderName)
          );
          setClientList([...new Set(folders)]);
        }
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
        // Actualizar también la tarea seleccionada si coincide
        if (selectedTask && selectedTask.lineIndex === task.lineIndex) {
          const updated = data.tasks.find(t => t.lineIndex === task.lineIndex);
          if (updated) setSelectedTask(updated);
        }
        if (showToast) showToast('Estado actualizado en el archivo físico ✓', { type: 'success' });
      } else {
        throw new Error(data.error || 'Error al persistir cambios.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`No se pudo actualizar la tarea: ${err.message}`, { type: 'error' });
    }
  };

  const handleAddTask = async () => {
    if (!addTaskText.trim()) return;
    setAddTaskLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/roadmap/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: addTaskText.trim(), domain: addTaskDomain })
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
        setAddTaskText('');
        setRoadmapPage(1);
        setRoadmapFilter('pending');
        setSelectedTask(data.tasks.find(t => t.id === data.newId) || null);
        if (showToast) showToast(`Tarea ${data.newId} creada ✓`, { type: 'success' });
      } else {
        throw new Error(data.error || 'Error al crear tarea.');
      }
    } catch (err) {
      if (showToast) showToast(`Fallo al crear tarea: ${err.message}`, { type: 'error' });
    } finally {
      setAddTaskLoading(false);
    }
  };

  // Funciones controladoras del Editor de Tareas
  const handleAddEditFileRow = () => {
    setEditTaskFiles(prev => [...prev, { name: '', action: 'MODIFY', url: '' }]);
  };

  const handleUpdateEditFileField = (index, field, value) => {
    setEditTaskFiles(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      
      // Auto-generar URL de acceso local basada en el nombre para consistencia
      if (field === 'name') {
        const cleanName = value.trim();
        copy[index].url = cleanName ? `file:///d:/PROTOTIPE/${cleanName.replace(/\\/g, '/')}` : '';
      }
      
      return copy;
    });
  };

  const handleRemoveEditFileRow = (index) => {
    setEditTaskFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveTaskEdits = async () => {
    if (!selectedTask) return;
    setSaveEditLoading(true);
    
    // Filtrar filas de archivos vacías
    const cleanFiles = editTaskFiles
      .filter(f => f.name && f.name.trim())
      .map(f => ({
        name: f.name.trim(),
        action: f.action || 'MODIFY',
        url: f.url || `file:///d:/PROTOTIPE/${f.name.trim().replace(/\\/g, '/')}`
      }));

    try {
      const res = await fetch(`${CLI_URL}/api/roadmap/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineIndex: selectedTask.lineIndex,
          descripcion: editTaskDesc.trim(),
          archivos: cleanFiles
        })
      });
      
      if (!res.ok) throw new Error('Error al guardar cambios de la tarea en el Bridge.');
      const data = await res.json();
      
      if (data.success) {
        setTasks(data.tasks);
        const updated = data.tasks.find(t => t.lineIndex === selectedTask.lineIndex);
        if (updated) {
          setSelectedTask(updated);
        }
        setIsEditingTask(false);
        if (showToast) showToast('Detalles de tarea actualizados en el archivo físico ✓', { type: 'success' });
      } else {
        throw new Error(data.error || 'Error al persistir cambios.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al guardar cambios: ${err.message}`, { type: 'error' });
    } finally {
      setSaveEditLoading(false);
    }
  };

  const handleVerifyRoadmapDrifts = async () => {
    setDriftsLoading(true);
    setRoadmapDrifts(null);
    setCodeDrifts([]);
    setSandboxDrifts([]);
    setCommitDrifts([]);
    setCommitsList([]);
    setActiveDriftTab('roadmap');
    try {
      const res = await fetch(`${CLI_URL}/api/integrity/status`);
      if (!res.ok) throw new Error('Error al comunicar con el validador físico del CLI.');
      const data = await res.json();
      
      const drifts = data.roadmapDrifts || [];
      const code = data.codeDrifts || [];
      const sandboxes = data.sandboxDrifts || [];
      const commits = data.commitDrifts || [];
      
      setRoadmapDrifts(drifts);
      setCodeDrifts(code);
      setSandboxDrifts(sandboxes);
      setCommitDrifts(commits);
      setCommitsList(data.commitsList || []);
      
      const totalDrifts = drifts.length + code.length + sandboxes.length;
      if (totalDrifts === 0) {
        if (showToast) showToast('¡Consistencia física y documental perfecta! 0 desviaciones detectadas ✓', { type: 'success' });
      } else {
        if (showToast) showToast(`Verificación completada: se detectaron desviaciones en el ecosistema.`, { type: 'warning' });
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al verificar desviaciones: ${err.message}`, { type: 'error' });
    } finally {
      setDriftsLoading(false);
    }
  };

  const handleFixMap = async (file, taskId) => {
    try {
      const res = await fetch(`${CLI_URL}/api/integrity/fix-map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, id: taskId })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message, { type: 'success' });
        handleVerifyRoadmapDrifts();
      } else {
        throw new Error(data.error || 'Error al registrar en mapa.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al registrar en mapa: ${err.message}`, { type: 'error' });
    }
  };

  const handleFixMapBulk = async () => {
    const mapMissingDrifts = codeDrifts.filter(d => d.type === 'MAP_MISSING');
    if (mapMissingDrifts.length === 0) return;

    try {
      const res = await fetch(`${CLI_URL}/api/integrity/fix-map-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: mapMissingDrifts.map(d => ({ file: d.file, id: d.id })) })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message, { type: 'success' });
        handleVerifyRoadmapDrifts();
      } else {
        throw new Error(data.error || 'Error al registrar drifts en lote.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al registrar en lote: ${err.message}`, { type: 'error' });
    }
  };

  const handleLinkMissingCommits = async () => {
    if (commitDrifts.length === 0) return;
    const taskIds = commitDrifts.map(d => d.id);

    try {
      const res = await fetch(`${CLI_URL}/api/git/link-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message, { type: 'success' });
        handleVerifyRoadmapDrifts();
      } else {
        throw new Error(data.error || 'Error al vincular tareas a Git.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al vincular tareas: ${err.message}`, { type: 'error' });
    }
  };

  const handlePruneDrifts = async () => {
    const notFoundDrifts = codeDrifts.filter(d => d.type === 'FILE_NOT_FOUND');
    if (notFoundDrifts.length === 0) return;

    const confirmed = await showConfirm({
      title: '¿Confirmar Limpieza de Referencias?',
      message: `Esta acción eliminará físicamente ${notFoundDrifts.length} referencia(s) a archivos inexistentes del archivo tareas_pendientes.md. ¿Deseas proceder?`,
      variant: 'warning',
      confirmText: 'Sí, limpiar',
      cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${CLI_URL}/api/integrity/prune-drifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: notFoundDrifts.map(d => ({ file: d.file, id: d.id })) })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message, { type: 'success' });
        handleVerifyRoadmapDrifts();
      } else {
        throw new Error(data.error || 'Error al purgar referencias en lote.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al purgar referencias: ${err.message}`, { type: 'error' });
    }
  };

  const handleScaffoldSandbox = async (technicalName, fullName) => {
    try {
      const res = await fetch(`${CLI_URL}/api/integrity/scaffold-sandbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicalName, fullName })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message, { type: 'success' });
        handleVerifyRoadmapDrifts();
      } else {
        throw new Error(data.error || 'Error al crear Sandbox.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al crear Sandbox: ${err.message}`, { type: 'error' });
    }
  };

  const handleBatchRegisterBitacora = async () => {
    if (!roadmapDrifts || roadmapDrifts.length === 0) return;
    setBatchBitacoraLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/integrity/batch-register-bitacora`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drifts: roadmapDrifts.map(d => ({ id: d.id, message: d.message })) })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message, { type: 'success' });
        handleVerifyRoadmapDrifts();
      } else {
        throw new Error(data.error || 'Error al registrar en bitácora.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo: ${err.message}`, { type: 'error' });
    } finally {
      setBatchBitacoraLoading(false);
    }
  };

  const handleScaffoldSandboxBulk = async () => {
    if (!sandboxDrifts || sandboxDrifts.length === 0) return;
    setBulkSandboxLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/integrity/scaffold-sandbox-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxes: sandboxDrifts.map(d => ({ technicalName: d.technicalName, fullName: d.fullName })) })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message, { type: 'success' });
        handleVerifyRoadmapDrifts();
      } else {
        throw new Error(data.error || 'Error al crear sandboxes en lote.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo: ${err.message}`, { type: 'error' });
    } finally {
      setBulkSandboxLoading(false);
    }
  };

  const handlePublishTask = async () => {
    if (!selectedTask) return;
    setPublishLoading(true);
    setPublishLog([]);
    try {
      const res = await fetch(`${CLI_URL}/api/roadmap/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          description: editTaskDesc || selectedTask.detail?.descripcion?.join(' ') || '',
          files: editTaskFiles.length > 0 ? editTaskFiles : (selectedTask.detail?.archivos || []),
          commitMessage: editTaskDesc
            ? editTaskDesc.substring(0, 80).replace(/\n/g, ' ')
            : selectedTask.text?.replace(/^Tarea\s+[a-zA-Z0-9-]+:\s*/i, '').substring(0, 80)
        })
      });
      const data = await res.json();
      if (data.success) {
        setPublishLog(data.log || []);
        if (showToast) showToast(data.message, { type: 'success' });
        setIsEditingTask(false);
        handleVerifyRoadmapDrifts();
        fetchRoadmap();
      } else {
        throw new Error(data.error || 'Error en la publicación.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al publicar: ${err.message}`, { type: 'error' });
    } finally {
      setPublishLoading(false);
    }
  };

  // Atajo de teclado '/' para enfocar buscador
  useEffect(() => {
    const handler = (e) => {
      if (activeSubTab === 'roadmap' && e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSubTab]);

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

  const handleRunAutofix = async () => {
    setIntegrityLoading(true);
    setIntegrityStatus(null);
    try {
      const res = await fetch(`${CLI_URL}/api/integrity/autofix`, { method: 'POST' });
      if (!res.ok) throw new Error('Error al comunicar con el motor de autocuración del CLI.');
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Autocuración de catálogo ejecutada exitosamente ✓', { type: 'success' });
        
        const reportsText = data.reports.length > 0 
          ? `EJECUTANDO AUTOCURACIÓN DE BIBLIOTECA...\n\n` + data.reports.map(r => `✅ [Autocure] ${r}`).join('\n') + `\n\n==================================================\n  ✅ OPERACIONES DE AUTOCURACIÓN FINALIZADAS.\n==================================================`
          : `EJECUTANDO AUTOCURACIÓN DE BIBLIOTECA...\n\nNo se encontraron advertencias o rutas que requieran curación automática. ¡El catálogo está impecable!\n\n==================================================\n  ✅ OPERACIONES DE AUTOCURACIÓN FINALIZADAS.\n==================================================`;
        
        setIntegrityStatus({
          success: true,
          stdout: reportsText,
          code: 0
        });
      } else {
        throw new Error(data.error || 'Error desconocido.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo al ejecutar autocuración: ${err.message}`, { type: 'error' });
      setIntegrityStatus({
        success: false,
        stderr: `[Error] Fallo al ejecutar autocuración: ${err.message}`,
        code: 1
      });
    } finally {
      setIntegrityLoading(false);
    }
  };

  const formatIntegrityLine = (line) => {
    if (!line.trim()) return <div className="h-4" />;
    
    let colorClass = 'text-slate-300';
    
    const lower = line.toLowerCase();
    
    if (lower.includes('[éxito]') || lower.includes('✅') || lower.includes('[exito]')) {
      colorClass = 'text-emerald-400 font-semibold';
    } else if (lower.includes('[error]') || lower.includes('[fallo]') || lower.includes('❌')) {
      colorClass = 'text-red-400 font-bold bg-red-950/20 px-1 rounded';
    } else if (lower.includes('[advertencia]') || lower.includes('⚠️') || lower.includes('[alerta linter]')) {
      colorClass = 'text-amber-400 font-semibold';
    } else if (lower.includes('[info]') || lower.includes('🆕') || lower.includes('🔒')) {
      colorClass = 'text-sky-400';
    } else if (line.startsWith('====') || line.startsWith('----')) {
      colorClass = 'text-indigo-400/80 font-bold';
    }
    
    return (
      <div className={`py-0.5 border-b border-slate-900/40 last:border-0 ${colorClass}`}>
        {line}
      </div>
    );
  };

  // --- LÓGICA LOG STREAMER ---
  const formatLogLine = (logLine) => {
    if (!logLine) return '';

    // 1. Limpiar todos los códigos de escape ANSI
    // eslint-disable-next-line no-control-regex -- La expresión elimina secuencias ANSI.
    const cleanLine = logLine.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

    // 2. Extraer timestamp e info si tiene el formato estándar [YYYY-MM-DDTHH:mm:ss.sssZ] [INFO]
    const match = cleanLine.match(/^\[([^\]]+)\]\s+\[(INFO|WARN|ERROR)\]\s+([\s\S]*)$/);
    if (!match) {
      return <span className="text-slate-300">{cleanLine}</span>;
    }

    const [, timestamp, level, message] = match;

    // Formatear el timestamp a hora local legible
    let timeStr = timestamp;
    try {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        timeStr = date.toLocaleTimeString();
      }
    } catch { /* Conservar el timestamp original si no se puede convertir. */ }

    // Color de nivel
    let levelClass = "text-slate-400";
    if (level === "WARN") levelClass = "text-amber-400 font-bold";
    if (level === "ERROR") levelClass = "text-rose-500 font-bold";

    // Pintar mensaje de forma inteligente
    let msgElement = <span className="text-slate-200">{message}</span>;
    if (message.includes("GET ")) {
      msgElement = (
        <span>
          <span className="text-emerald-400 font-bold">GET</span>{' '}
          <span className="text-slate-300">{message.substring(message.indexOf("GET ") + 4)}</span>
        </span>
      );
    } else if (message.includes("POST ")) {
      msgElement = (
        <span>
          <span className="text-amber-400 font-bold">POST</span>{' '}
          <span className="text-slate-300">{message.substring(message.indexOf("POST ") + 5)}</span>
        </span>
      );
    } else if (message.includes("PUT ")) {
      msgElement = (
        <span>
          <span className="text-violet-400 font-bold">PUT</span>{' '}
          <span className="text-slate-300">{message.substring(message.indexOf("PUT ") + 4)}</span>
        </span>
      );
    } else if (message.includes("DELETE ")) {
      msgElement = (
        <span>
          <span className="text-rose-500 font-bold">DELETE</span>{' '}
          <span className="text-slate-300">{message.substring(message.indexOf("DELETE ") + 7)}</span>
        </span>
      );
    } else if (message.includes("[Backup]")) {
      msgElement = <span className="text-purple-400">{message}</span>;
    } else if (message.includes("[lock]")) {
      msgElement = <span className="text-cyan-400">{message}</span>;
    } else if (message.includes("✅")) {
      msgElement = <span className="text-emerald-300 font-medium">{message}</span>;
    } else if (message.includes("⚠️")) {
      msgElement = <span className="text-amber-300">{message}</span>;
    }

    return (
      <div className="flex items-start gap-3 hover:bg-slate-900/60 py-0.5 px-1.5 rounded transition-colors text-[10.5px]">
        <span className="text-slate-500 select-none font-mono text-[9px] mt-0.5 w-[65px] shrink-0">{timeStr}</span>
        <span className={`${levelClass} select-none text-[9.5px] w-[50px] shrink-0`}>[{level}]</span>
        <span className="flex-1 font-mono text-slate-200">{msgElement}</span>
      </div>
    );
  };

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
      } catch { /* Ignorar eventos SSE incompletos. */ }
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
  const handleScanCleanup = async () => {
    if (!selectedCleanupClient) {
      if (showToast) showToast('Por favor selecciona un cliente para escanear.', { type: 'warning' });
      return;
    }

    setScanLoading(true);
    setCleanupScanResults(null);
    setCleanupResult(null); // ← Limpiar resultado previo para que los resultados del escaneo sean visibles
    try {
      const res = await fetch(`${CLI_URL}/api/project/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedCleanupClient, scanOnly: true })
      });
      const data = await res.json();
      if (data.success) {
        setCleanupScanResults(data.scan);
        const existCount = (data.scan || []).filter(i => i.exists).length;
        const msg = existCount > 0
          ? `Escaneo completo: ${existCount} directorio(s) con datos para purgar ✓`
          : `Escaneo completo: todos los directorios ya están limpios ✓`;
        if (showToast) showToast(msg, { type: existCount > 0 ? 'warning' : 'success' });
      } else {
        throw new Error(data.error || 'Error al escanear temporales.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo en el escaneo: ${err.message}`, { type: 'error' });
    } finally {
      setScanLoading(false);
    }
  };

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
        setCleanupScanResults(null); // Limpiar escaneo previo tras eliminar
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

  const handleRunSeeder = async () => {
    if (!selectedCleanupClient) {
      if (showToast) showToast('Por favor selecciona una instancia para el sembrado.', { type: 'warning' });
      return;
    }

    setSeederLoading(true);
    setSeederResult(null);
    try {
      const res = await fetch(`${CLI_URL}/api/project/db/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedCleanupClient })
      });
      const data = await res.json();
      if (data.success) {
        setSeederResult(data);
        if (showToast) showToast(`Sembrado finalizado con éxito ✓`, { type: 'success' });
      } else {
        throw new Error(data.error || 'Error al sembrar datos.');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(`Fallo en el sembrador: ${err.message}`, { type: 'error' });
      setSeederResult({ error: err.message });
    } finally {
      setSeederLoading(false);
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
        <div className="flex bg-[var(--color-surface-2)]/50 p-1 rounded-xl border border-[var(--color-border)] shrink-0 overflow-x-auto scrollbar-none gap-1 max-w-full">
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
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
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
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
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
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
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
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
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
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
        {activeSubTab === 'roadmap' && (() => {
          // ── Derivados computados ──────────────────────────────────────────
          const totalTasks   = tasks.length;
          const doneTasks    = tasks.filter(t => t.completed).length;
          const pendingTasks = totalTasks - doneTasks;
          const progress     = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
          const lastCore     = tasks.reduce((max, t) => {
            const n = parseInt((t.id.match(/CORE-(\d+)/) || [])[1] || 0, 10);
            return n > max ? n : max;
          }, 0);

          const filteredTasks = tasks.filter(t => {
            const q = roadmapSearch.toLowerCase();
            const matchSearch = !q ||
              t.id.toLowerCase().includes(q) ||
              t.text.toLowerCase().includes(q) ||
              (t.detail?.descripcion || []).some(d => d.toLowerCase().includes(q));
            const matchFilter =
              roadmapFilter === 'all' ||
              (roadmapFilter === 'pending'   && !t.completed) ||
              (roadmapFilter === 'completed' &&  t.completed);
            // Filtro de dominio: usa domains[] inferido por el servidor
            const matchDomain =
              domainFilter === 'all' ||
              (t.domains?.includes(domainFilter) ?? t.domain === domainFilter);
            return matchSearch && matchFilter && matchDomain;
          });

          const totalPages = Math.ceil(filteredTasks.length / ROADMAP_PAGE_SIZE);
          const safePage   = Math.min(roadmapPage, Math.max(1, totalPages));
          const paginated  = filteredTasks.slice((safePage - 1) * ROADMAP_PAGE_SIZE, safePage * ROADMAP_PAGE_SIZE);

          const actionColor = (action) => {
            if (!action) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            const a = action.toUpperCase();
            if (a.includes('NEW'))    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            if (a.includes('DELETE')) return 'bg-red-500/10 text-red-400 border-red-500/20';
            if (a.includes('DEPLOY')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
          };

          return (
            <div className="space-y-4">
              {/* ── Cabecera ─────────────────────────────────────────────── */}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVerifyRoadmapDrifts}
                    disabled={driftsLoading || tasksLoading}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text)] hover:text-indigo-400 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Verificar consistencia de bitácora y roadmap"
                  >
                    {driftsLoading ? <Loader2 size={12} className="animate-spin text-indigo-400" /> : <ShieldCheck size={12} className="text-emerald-400" />}
                    <span>Validar Drifts</span>
                  </button>
                  <button
                    onClick={fetchRoadmap}
                    disabled={tasksLoading}
                    className="p-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer disabled:opacity-50"
                    title="Sincronizar con disco"
                  >
                    <RefreshCw size={14} className={tasksLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {tasksLoading && tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Sincronizando tareas desde el disco...</span>
                </div>
              ) : (
                <>
                  {/* ── Métricas de Sprint ──────────────────────────────── */}
                  {totalTasks > 0 && (
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 size={13} />
                          <span className="text-[11px] font-bold">{doneTasks} completadas</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          <Loader2 size={13} />
                          <span className="text-[11px] font-bold">{pendingTasks} pendientes</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          <BarChart2 size={13} />
                          <span className="text-[11px] font-bold">{progress}% completado</span>
                        </div>
                        {lastCore > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                            <Tag size={12} />
                            <span className="text-[11px] font-bold font-mono">#{`CORE-${lastCore}`} último</span>
                          </div>
                        )}
                      </div>
                      <div className="w-full h-2 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Alerta de Consistencia Tridimensional (Drifts) */}
                  {roadmapDrifts !== null && (() => {
                    const totalRoadmapDrifts = roadmapDrifts.length;
                    const totalCodeDrifts = codeDrifts.length;
                    const totalSandboxDrifts = sandboxDrifts.length;
                    const totalCommitDrifts = commitDrifts.length;
                    const grandTotal = totalRoadmapDrifts + totalCodeDrifts + totalSandboxDrifts;

                    return (
                      <div className={`p-5 rounded-2xl border flex flex-col gap-4 shadow-sm transition-all duration-300 ${
                        grandTotal === 0
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                          : 'bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-400'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg border shrink-0 ${
                              grandTotal === 0
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                              {grandTotal === 0 ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider">
                                {grandTotal === 0
                                  ? 'Consistencia Multidimensional al 100% OK'
                                  : `Consistencia Multidimensional: ${grandTotal} Advertencias`}
                              </h4>
                              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                                Diagnóstico integrado de Bitácora, Archivos físicos, Sandboxes e Historial de Git.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setRoadmapDrifts(null);
                              setCodeDrifts([]);
                              setSandboxDrifts([]);
                              setCommitDrifts([]);
                              setCommitsList([]);
                            }}
                            className="text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-0 outline-none"
                          >
                            Cerrar diagnóstico
                          </button>
                        </div>

                        {/* Pastillas de sub-pestañas internas de la alerta */}
                        <div className="flex border-b border-[var(--color-border)]/60 pb-1.5 gap-2 overflow-x-auto scrollbar-none">
                          <button
                            onClick={() => setActiveDriftTab('roadmap')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeDriftTab === 'roadmap'
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-transparent'
                            }`}
                          >
                            <span>1. Bitácora</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] font-mono">
                              {totalRoadmapDrifts}
                            </span>
                          </button>
                          <button
                            onClick={() => setActiveDriftTab('code')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeDriftTab === 'code'
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-transparent'
                            }`}
                          >
                            <span>2. Archivos y Mapa</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] font-mono">
                              {totalCodeDrifts}
                            </span>
                          </button>
                          <button
                            onClick={() => setActiveDriftTab('sandbox')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeDriftTab === 'sandbox'
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-transparent'
                            }`}
                          >
                            <span>3. Playgrounds</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] font-mono">
                              {totalSandboxDrifts}
                            </span>
                          </button>
                          <button
                            onClick={() => setActiveDriftTab('commits')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeDriftTab === 'commits'
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-transparent'
                            }`}
                          >
                            <span>4. Historial Git</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] font-mono">
                              {totalCommitDrifts}
                            </span>
                          </button>
                        </div>

                        {/* Contenido de la sub-pestaña activa de drifts */}
                        <div className="text-xs space-y-2">
                          {activeDriftTab === 'roadmap' && (
                            <div className="space-y-1.5">
                              <p className="text-[11px] opacity-90 leading-relaxed">
                                {totalRoadmapDrifts === 0
                                  ? '✓ Todo el Roadmap y la Bitácora de Cambios están perfectamente alineados en caliente.'
                                  : 'Se detectaron tareas completadas en la hoja de ruta física sin entrada descriptiva en la bitácora de cambios:'}
                              </p>
                              {totalRoadmapDrifts > 0 && (
                                <div className="space-y-2 mt-2">
                                  <div className="flex justify-end">
                                    <button
                                      onClick={handleBatchRegisterBitacora}
                                      disabled={batchBitacoraLoading}
                                      className="px-2.5 py-1 rounded-lg text-xs font-black bg-violet-600 hover:bg-violet-500 !text-white border border-violet-500 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {batchBitacoraLoading ? '⏳' : '📝'} Registrar en Bitácora ({totalRoadmapDrifts})
                                    </button>
                                  </div>
                                  {roadmapDrifts.map((d, i) => (
                                    <div key={i} className="flex gap-2 items-center bg-[var(--color-surface-2)]/40 p-2 rounded-xl border border-[var(--color-border)]/60">
                                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/15 border border-red-500/20 text-red-400 shrink-0">
                                        {d.id}
                                      </span>
                                      <span className="text-[11px] text-[var(--color-text)] truncate">{d.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {activeDriftTab === 'code' && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-[11px] opacity-90 leading-relaxed">
                                  {totalCodeDrifts === 0
                                    ? '✓ Todos los archivos declarados existen en disco y están registrados en el mapa_aplicacion.md.'
                                    : 'Desviaciones físicas encontradas entre los archivos declarados por tareas en el Roadmap y la realidad del disco:'}
                                </p>
                                <div className="flex gap-2 shrink-0">
                                  {codeDrifts.filter(d => d.type === 'MAP_MISSING').length > 0 && (
                                    <button
                                      onClick={handleFixMapBulk}
                                      className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 !text-white border border-emerald-500 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      ⚡ Registrar todos ({codeDrifts.filter(d => d.type === 'MAP_MISSING').length})
                                    </button>
                                  )}
                                  {codeDrifts.filter(d => d.type === 'FILE_NOT_FOUND').length > 0 && (
                                    <button
                                      onClick={handlePruneDrifts}
                                      className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-600 hover:bg-amber-500 !text-white border border-amber-500 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      🧹 Limpiar rotos ({codeDrifts.filter(d => d.type === 'FILE_NOT_FOUND').length})
                                    </button>
                                  )}
                                </div>
                              </div>
                              {totalCodeDrifts > 0 && (
                                <div className="space-y-1.5 mt-2 max-h-[160px] overflow-y-auto pr-1">
                                  {codeDrifts.map((d, i) => (
                                    <div key={i} className="flex flex-col gap-1 bg-[var(--color-surface-2)]/40 p-2.5 rounded-xl border border-[var(--color-border)]/60">
                                      <div className="flex items-center justify-between">
                                        <div className="flex gap-2 items-center">
                                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
                                            {d.id}
                                          </span>
                                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                            d.type === 'FILE_NOT_FOUND' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                          }`}>
                                            {d.type}
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-[var(--color-text-muted)] font-mono truncate max-w-[200px]" title={d.file}>
                                          {d.file.split('/').pop()}
                                        </span>
                                      </div>
                                      <div className="flex items-start justify-between gap-3 mt-1">
                                        <span className="text-[11px] text-[var(--color-text)] leading-snug">{d.message}</span>
                                        {d.type === 'MAP_MISSING' && (
                                          <button
                                            onClick={() => handleFixMap(d.file, d.id)}
                                            className="px-2 py-1 rounded-md text-[9px] font-black bg-indigo-600 hover:bg-indigo-500 !text-white border border-indigo-500 transition-colors shrink-0 cursor-pointer"
                                          >
                                            🔧 Registrar
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {activeDriftTab === 'sandbox' && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] opacity-90 leading-relaxed">
                                  {totalSandboxDrifts === 0
                                    ? '✓ Todos los componentes catalogados en la Biblioteca tienen su respectivo playground Sandbox activo.'
                                    : 'Se detectaron componentes registrados en el catálogo de biblioteca sin Sandbox interactivo de simulación:'}
                                </p>
                                {totalSandboxDrifts > 0 && (
                                  <button
                                    onClick={handleScaffoldSandboxBulk}
                                    disabled={bulkSandboxLoading}
                                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-600 hover:bg-indigo-500 !text-white border border-indigo-500 transition-colors shrink-0 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {bulkSandboxLoading ? '⏳' : '⚡'} Crear todos ({totalSandboxDrifts})
                                  </button>
                                )}
                              </div>
                              {totalSandboxDrifts > 0 && (
                                <div className="space-y-1.5 mt-2 max-h-[160px] overflow-y-auto pr-1">
                                  {sandboxDrifts.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between gap-3 bg-[var(--color-surface-2)]/40 p-2 rounded-xl border border-[var(--color-border)]/60">
                                      <div className="min-w-0">
                                        <span className="text-[11px] text-[var(--color-text)] font-bold block truncate">{d.fullName}</span>
                                        <span className="text-[9px] text-[var(--color-text-muted)] font-mono">{d.technicalName}</span>
                                      </div>
                                      <button
                                        onClick={() => handleScaffoldSandbox(d.technicalName, d.fullName)}
                                        className="px-2 py-1 rounded-md text-[9px] font-black bg-indigo-600 hover:bg-indigo-500 !text-white border border-indigo-500 transition-colors shrink-0 cursor-pointer"
                                      >
                                        🛠️ Crear
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {activeDriftTab === 'commits' && (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <p className="text-[11px] opacity-90 leading-relaxed">
                                  Trazabilidad de Git: se contrastan los últimos 15 commits en la rama de desarrollo con las tareas de la hoja de ruta.
                                </p>
                                {totalCommitDrifts > 0 && (
                                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg p-2.5 text-[10px] leading-snug flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                      ⚠️ {totalCommitDrifts} tareas completadas recientes carecen de commits vinculados en el historial Git inmediato (últimos 15 commits).
                                    </div>
                                    <button
                                      onClick={handleLinkMissingCommits}
                                      className="px-2.5 py-1 rounded-md text-[9px] font-black bg-amber-600 hover:bg-amber-500 !text-white border border-amber-500 transition-colors shrink-0 cursor-pointer shadow-sm"
                                    >
                                      🔗 Vincular Todo
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Historial de Commits Recientes</p>
                                {commitsList.length === 0 ? (
                                  <p className="text-[11px] text-[var(--color-text-muted)] italic">No se pudo cargar el historial de Git.</p>
                                ) : (
                                  commitsList.map((c, i) => (
                                    <div key={i} className="flex items-start justify-between gap-3 py-1.5 px-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]/60 text-[11px] font-medium">
                                      <div className="min-w-0">
                                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono mr-2">{c.hash}</span>
                                        <span className="text-[var(--color-text)] truncate">{c.subject}</span>
                                        <span className="text-[9px] text-[var(--color-text-muted)] block mt-0.5">Autor: {c.author} · Fecha: {c.date}</span>
                                      </div>
                                      {c.taskId ? (
                                        <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 shrink-0">
                                          {c.taskId}
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] text-[var(--color-text-muted)] shrink-0">
                                          SIN ENLACE
                                        </span>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Buscador + Filtros + Creador ────────────────────── */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Buscador */}
                    <div className="relative flex-1">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={roadmapSearch}
                        onChange={e => { setRoadmapSearch(e.target.value); setRoadmapPage(1); }}
                        placeholder='Buscar por ID o descripción… (atajo: /)'
                        className="w-full pl-8 pr-8 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-indigo-500 transition-colors"
                      />
                      {roadmapSearch && (
                        <button onClick={() => { setRoadmapSearch(''); setRoadmapPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    {/* Filtros pill estado */}
                    <div className="flex bg-[var(--color-surface-2)]/50 p-0.5 rounded-xl border border-[var(--color-border)] shrink-0 gap-0.5">
                      {[['all','Todas'],['pending','Pendientes'],['completed','Hechas']].map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => { setRoadmapFilter(val); setRoadmapPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            roadmapFilter === val
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtros pill dominio — filtra por dominio inferido de rutas + keywords */}
                  <div className="flex gap-1 flex-wrap pb-1">
                    <button
                      onClick={() => { setDomainFilter('all'); setRoadmapPage(1); }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                        domainFilter === 'all'
                          ? 'bg-[var(--color-surface-3)] border-[var(--color-text-muted)]/40 text-[var(--color-text)]'
                          : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      Todos los dominios
                    </button>
                    {TASK_DOMAINS.map(({ value, label, color }) => {
                      const count = tasks.filter(t =>
                        t.domains?.includes(value) ?? t.domain === value
                      ).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={value}
                          onClick={() => { setDomainFilter(value); setRoadmapPage(1); }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                            domainFilter === value
                              ? color + ' shadow-sm'
                              : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                          }`}
                        >
                          {label} <span className="opacity-60">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Creador de tarea ──────────────────────────────────── */}
                  <div className="bg-[var(--color-surface-2)]/20 p-3 rounded-2xl border border-[var(--color-border)]/60 relative z-30">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-2">Crear nueva tarea en el roadmap</p>
                    <div className="flex gap-2 items-center flex-col sm:flex-row">
                      {/* Selector de dominio compacto */}
                      <div className="w-full sm:w-48 shrink-0">
                        <CustomSelect
                          value={addTaskDomain}
                          onChange={setAddTaskDomain}
                          options={TASK_DOMAINS.map(d => ({ value: d.value, label: d.label }))}
                        />
                      </div>
                      {/* Input de texto */}
                      <div className="flex-1 w-full relative">
                        <input
                          type="text"
                          value={addTaskText}
                          onChange={e => setAddTaskText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                          placeholder={`Nueva descripción para la tarea (Enter para crear)`}
                          className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      {/* Botón de envío */}
                      <button
                        onClick={handleAddTask}
                        disabled={addTaskLoading || !addTaskText.trim()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 !text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/20"
                      >
                        {addTaskLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                        Crear {addTaskDomain}
                      </button>
                    </div>
                  </div>

                  {/* ── Layout principal: Lista + Panel Detalle ─────────── */}
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-2)]/20">
                      <Search size={32} className="mx-auto text-[var(--color-text-muted)]/40 mb-3" />
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {roadmapSearch ? `Sin resultados para "${roadmapSearch}"` : 'No hay tareas en esta categoría.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* ─ Lista paginada ─ */}
                      <div className={`${selectedTask ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden divide-y divide-[var(--color-border)]">
                          {paginated.map((task, idx) => (
                            <div
                              key={`${task.lineIndex}-${idx}`}
                              onClick={() => setSelectedTask(selectedTask?.lineIndex === task.lineIndex ? null : task)}
                              className={`flex items-start gap-3 p-3.5 transition-all cursor-pointer ${
                                selectedTask?.lineIndex === task.lineIndex
                                  ? 'bg-indigo-600/10 border-l-2 border-indigo-500'
                                  : 'hover:bg-[var(--color-surface-2)]/40 border-l-2 border-transparent'
                              } ${task.completed ? 'opacity-60' : ''}`}
                            >
                              <button
                                onClick={e => { e.stopPropagation(); handleToggleTask(task); }}
                                className={`mt-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                                  task.completed
                                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                                    : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-indigo-500'
                                }`}
                              >
                                {task.completed && <Check size={10} strokeWidth={3} />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                  <span className={`text-[10px] font-mono font-bold shrink-0 ${task.completed ? 'text-[var(--color-text-muted)] line-through opacity-60' : 'text-indigo-400'}`}>
                                    {task.id}
                                  </span>
                                  {(task.domains || [task.domain]).map(dom => {
                                    if (!dom) return null;
                                    return (
                                      <span key={dom} className={`text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 ${domainColor(dom)}`}>
                                        {dom}
                                      </span>
                                    );
                                  })}
                                  {task.detail?.fecha && (
                                    <span className="text-[9px] text-[var(--color-text-muted)] shrink-0">{task.detail.fecha}</span>
                                  )}
                                </div>
                                <p className={`text-[11px] leading-snug break-words ${
                                  task.completed
                                    ? 'line-through text-[var(--color-text-muted)] font-normal'
                                    : 'text-[var(--color-text)] font-semibold'
                                }`}>
                                  {task.text.replace(/^Tarea\s+[a-zA-Z0-9-]+:\s*/i, '')}
                                </p>
                                {task.detail?.archivos?.length > 0 && (
                                  <span className="text-[9px] text-[var(--color-text-muted)] mt-0.5 block">
                                    {task.detail.archivos.length} archivo{task.detail.archivos.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              {selectedTask?.lineIndex === task.lineIndex && (
                                <ChevronRight size={14} className="text-indigo-400 shrink-0 mt-1" />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              {(safePage - 1) * ROADMAP_PAGE_SIZE + 1}–{Math.min(safePage * ROADMAP_PAGE_SIZE, filteredTasks.length)} de {filteredTasks.length}
                            </span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setRoadmapPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
                                ← Ant.
                              </button>
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push('…'); acc.push(p); return acc; }, [])
                                .map((p, i) => p === '…'
                                  ? <span key={`e-${i}`} className="px-1.5 text-[11px] text-[var(--color-text-muted)]">…</span>
                                  : <button key={p} onClick={() => setRoadmapPage(p)}
                                      className={`w-7 h-6 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                        safePage === p ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text)]'
                                      }`}>{p}</button>
                                )
                              }
                              <button onClick={() => setRoadmapPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
                                Sig. →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ─ Panel de Detalle ─ */}
                      {selectedTask && (
                        <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                          {/* Header del panel */}
                          <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/40 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[11px] font-mono font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                                  {selectedTask.id}
                                </span>
                                {selectedTask.detail?.estatus && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    selectedTask.completed
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                    {selectedTask.detail.estatus}
                                  </span>
                                )}
                                {selectedTask.detail?.fecha && (
                                  <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                                    <Calendar size={10} />
                                    {selectedTask.detail.fecha}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-bold text-[var(--color-text)] leading-snug">
                                {selectedTask.text.replace(/^Tarea\s+[a-zA-Z0-9-]+:\s*/i, '')}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isEditingTask ? (
                                <>
                                  <button
                                    onClick={handleSaveTaskEdits}
                                    disabled={saveEditLoading}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 !text-white border border-indigo-500 shadow-sm shadow-indigo-500/20 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    {saveEditLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => setIsEditingTask(false)}
                                    disabled={saveEditLoading}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setIsEditingTask(true)}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text)] hover:border-indigo-500 hover:text-indigo-400 transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    Editar
                                  </button>
                                  {!selectedTask.completed && (
                                    <button
                                      onClick={handlePublishTask}
                                      disabled={publishLoading}
                                      className="px-3 py-1.5 rounded-lg text-[11px] font-black border bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 !text-white border-indigo-500 shadow-sm shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                                      title="Marcar como completada + registrar en Bitácora + Git commit"
                                    >
                                      {publishLoading ? <Loader2 size={11} className="animate-spin" /> : '🚀'}
                                      1-Click Commit
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleToggleTask(selectedTask)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                      selectedTask.completed
                                        ? 'bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-amber-500/50 hover:text-amber-400'
                                        : 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-500'
                                    }`}
                                  >
                                    <Check size={11} strokeWidth={3} />
                                    {selectedTask.completed ? 'Reabrir' : 'Completar'}
                                  </button>
                                </>
                              )}
                              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer">
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Cuerpo del panel */}
                          <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {isEditingTask ? (
                          <div className="space-y-4">
                                {/* Editor de descripción */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] block">Descripción Detallada</label>
                                  <textarea
                                    value={editTaskDesc}
                                    onChange={e => setEditTaskDesc(e.target.value)}
                                    placeholder="Describe detalladamente el trabajo de esta tarea..."
                                    rows={7}
                                    className="w-full px-4 py-3 text-xs rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-indigo-500 transition-colors resize-y font-medium"
                                  />
                                </div>

                                {/* Sugerencias de Git (Fase 1) */}
                                {gitModifiedFiles.length > 0 && (
                                  <div className="space-y-2 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                                        <GitBranch size={12} /> Sugerencias de Git Status
                                      </span>
                                      {gitStatusLoading && <Loader2 size={10} className="animate-spin text-indigo-400" />}
                                    </div>
                                    <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                                      Detectamos cambios locales en tu repositorio. Marca las casillas para asociar estos archivos directamente a esta tarea.
                                    </p>
                                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 mt-2">
                                      {gitModifiedFiles.map((file, fileIdx) => {
                                        const isChecked = editTaskFiles.some(f => f.name === file.path);
                                        return (
                                          <label key={fileIdx} className="flex items-start gap-2.5 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]/60 text-xs font-semibold cursor-pointer hover:bg-[var(--color-surface-2)]/60 transition-colors select-none">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={e => {
                                                if (e.target.checked) {
                                                  setEditTaskFiles([...editTaskFiles, { name: file.path, action: file.action }]);
                                                } else {
                                                  setEditTaskFiles(editTaskFiles.filter(f => f.name !== file.path));
                                                }
                                              }}
                                              className="mt-0.5 rounded border-[var(--color-border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <span className="text-[11px] text-[var(--color-text)] block truncate font-mono" title={file.path}>
                                                {file.path}
                                              </span>
                                              <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                                                file.action === 'NEW' ? 'bg-emerald-500/10 text-emerald-450' : file.action === 'DELETE' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                                              }`}>
                                                {file.action}
                                              </span>
                                            </div>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Editor de archivos */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] block">
                                      Archivos Modificados ({editTaskFiles.length})
                                    </label>
                                    <button
                                      onClick={handleAddEditFileRow}
                                      className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
                                    >
                                      <Plus size={12} /> Agregar archivo
                                    </button>
                                  </div>

                                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                    {editTaskFiles.length === 0 ? (
                                      <p className="text-[11px] text-[var(--color-text-muted)] italic py-2">Ningún archivo asociado aún.</p>
                                    ) : (
                                      editTaskFiles.map((file, fileIdx) => (
                                        <div key={fileIdx} className="flex gap-2 items-center bg-[var(--color-surface-2)]/40 p-2 rounded-xl border border-[var(--color-border)]/60">
                                          {/* Ruta del archivo */}
                                          <input
                                            type="text"
                                            value={file.name}
                                            onChange={e => handleUpdateEditFileField(fileIdx, 'name', e.target.value)}
                                            placeholder="Ruta (ej: src/components/ui/MiBoton.jsx)"
                                            className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-indigo-500 transition-colors"
                                          />
                                          {/* Acción select */}
                                          <div className="w-28 shrink-0">
                                            <CustomSelect
                                              value={file.action || 'MODIFY'}
                                              onChange={val => handleUpdateEditFileField(fileIdx, 'action', val)}
                                              options={[
                                                { value: 'MODIFY', label: 'MODIFY' },
                                                { value: 'NEW',    label: 'NEW' },
                                                { value: 'DELETE', label: 'DELETE' },
                                                { value: 'DEPLOY', label: 'DEPLOY' }
                                              ]}
                                            />
                                          </div>
                                          {/* Eliminar fila */}
                                          <button
                                            onClick={() => handleRemoveEditFileRow(fileIdx)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer bg-transparent border-0 shrink-0 outline-none"
                                            title="Eliminar fila"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                {/* Log de publicación 1-Click */}
                                {publishLog.length > 0 && (
                                  <div className="space-y-1 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1.5">📋 Log de Publicación</p>
                                    {publishLog.map((line, i) => (
                                      <p key={i} className="text-[11px] font-mono text-[var(--color-text-muted)] leading-relaxed">{line}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                {/* Descripción */}
                                {selectedTask.detail?.descripcion?.length > 0 ? (
                                  <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Descripción</h4>
                                    <div className="space-y-1.5">
                                      {selectedTask.detail.descripcion.map((line, i) => {
                                        const isNumbered = /^\d+\./.test(line);
                                        const isBullet = line.startsWith('- ');
                                        const cleanLine = line.replace(/^(\d+\.\s|-\s)/, '').replace(/\*\*([^*]+)\*\*/g, '$1');
                                        return (
                                          <div key={i} className={`flex gap-2.5 text-xs text-[var(--color-text)] leading-relaxed ${(isNumbered || isBullet) ? 'pl-2' : ''}`}>
                                            {isNumbered && (
                                              <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-black flex items-center justify-center mt-0.5">
                                                {line.match(/^(\d+)/)?.[1]}
                                              </span>
                                            )}
                                            {isBullet && <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]/60" />}
                                            <span>{cleanLine}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : null}

                                {/* Archivos */}
                                {selectedTask.detail?.archivos?.length > 0 ? (
                                  <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-1.5">
                                      <FolderOpen size={11} />
                                      Archivos Modificados ({selectedTask.detail.archivos.length})
                                    </h4>
                                    <div className="space-y-1.5">
                                      {selectedTask.detail.archivos.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between gap-3 py-1.5 px-3 rounded-xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)]/60 hover:border-[var(--color-border)] transition-colors">
                                          <span className="text-[11px] text-[var(--color-text)] font-mono truncate min-w-0 flex-1" title={file.name}>
                                            {file.name.split('/').pop()}
                                            <span className="text-[var(--color-text-muted)] ml-1 text-[9px]">
                                              {file.name.includes('/') ? `(${file.name.split('/').slice(0, -1).join('/')})` : ''}
                                            </span>
                                          </span>
                                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shrink-0 ${actionColor(file.action)}`}>
                                            {file.action}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}

                                {/* Estado vacío del panel de detalle */}
                                {(!selectedTask.detail?.descripcion?.length && !selectedTask.detail?.archivos?.length) && (
                                  <div className="text-center py-8">
                                    <FileText size={28} className="mx-auto text-[var(--color-text-muted)]/30 mb-2" />
                                    <p className="text-xs text-[var(--color-text-muted)]">Esta tarea no tiene detalles registrados aún.</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}


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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunIntegrityCheck}
                  disabled={integrityLoading}
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-bold shadow-sm hover:border-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {integrityLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Ejecutando...</span>
                    </>
                  ) : (
                    <>
                      <Activity size={14} className="text-indigo-400" />
                      <span>Escanear Biblioteca</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRunAutofix}
                  disabled={integrityLoading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {integrityLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Curando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Autocurar Catálogo</span>
                    </>
                  )}
                </button>
              </div>
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

                {/* Alertas de Consistencia Documental */}
                {integrityStatus.roadmapDrifts && integrityStatus.roadmapDrifts.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 text-amber-800 dark:text-amber-400 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
                        <AlertTriangle size={16} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Consistencia Documental: {integrityStatus.roadmapDrifts.length} Desviaciones
                      </h4>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      Se detectaron tareas completadas en el Roadmap físico que no tienen registro descriptivo en la bitácora de cambios. Completa la documentación de estas tareas para mantener el histórico sincronizado:
                    </p>
                    <div className="max-h-[150px] overflow-y-auto border border-amber-500/10 rounded-xl bg-amber-500/5 p-3 space-y-1.5 scrollbar-thin">
                      {integrityStatus.roadmapDrifts.map(drift => (
                        <div key={drift.id} className="flex items-start gap-2 text-[10px] font-mono leading-relaxed">
                          <span className="bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30 text-[9px] font-black shrink-0">{drift.id}</span>
                          <span className="opacity-95">{drift.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  <div className="p-4 bg-slate-950 text-slate-100 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[350px] whitespace-pre-wrap">
                    {(integrityStatus.stdout || integrityStatus.stderr || 'No se recibió salida.').split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {formatIntegrityLine(line)}
                      </React.Fragment>
                    ))}
                  </div>
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
                    <div key={idx} className="border-b border-slate-900/20 last:border-0 pb-0.5">
                      {formatLogLine(logLine)}
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

        {/* --- LIMPIADOR SEGURO & AJUSTES DE FONDO --- */}
        {activeSubTab === 'cleanup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMNA IZQUIERDA: HERRAMIENTAS DE DESARROLLO */}
            <div className="space-y-6 flex flex-col">
              {/* PANEL DE LIMPIEZA SEGURA */}
              <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/45 backdrop-blur-md rounded-2xl p-5 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                      <Trash2 size={16} className="text-indigo-400" />
                      Limpiador Seguro de Temporales y Cachés (Lista Blanca)
                    </h2>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      Borra cachés obsoletas de Vite, temporales de E2E y duplicados de roadmap de forma segura para optimizar almacenamiento.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Instancia del Proyecto
                      </label>
                      <CustomSelect
                        value={selectedCleanupClient}
                        onChange={setSelectedCleanupClient}
                        options={clientList.map(c => ({ value: c, label: c }))}
                        placeholder="-- Seleccionar Instancia --"
                        direction="up"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleScanCleanup}
                        disabled={scanLoading || cleanupLoading || !selectedCleanupClient}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] hover:bg-[var(--color-surface-4)] text-[var(--color-text)] border border-[var(--color-border)] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {scanLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Escaneando...</span>
                          </>
                        ) : (
                          <>
                            <Search size={14} className="text-indigo-400" />
                            <span>Escanear Directorios</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleRunCleanup}
                        disabled={cleanupLoading || scanLoading || !selectedCleanupClient}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {cleanupScanResults && (
                    <div className="space-y-4 pt-2">
                      <div className="border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm bg-[var(--color-surface-2)]/30">
                        <div className="bg-[var(--color-surface-2)]/60 px-4 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                            <Search size={14} className="text-indigo-400" />
                            Resultado del Escaneo Pre-Purgado
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                            Lista Blanca Segura
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          {cleanupScanResults.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-[var(--color-border)]/50 pb-2 last:border-0 last:pb-0">
                              <div className="min-w-0 flex-1 pr-4">
                                <p className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                                  <span className="text-[9px] text-slate-500 font-mono">[{item.type}]</span>
                                  {item.name}
                                </p>
                                <p className="text-[9px] text-[var(--color-text-muted)] truncate font-mono mt-0.5">{item.path}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {item.exists ? (
                                  <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-bold border border-amber-500/20 flex items-center gap-1">
                                    ⚠️ Existe
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-slate-500/10 text-[var(--color-text-muted)] px-2 py-0.5 rounded-md font-bold border border-[var(--color-border)] flex items-center gap-1">
                                    ✓ Limpio
                                  </span>
                                )}
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold border border-emerald-500/20">
                                  Seguro
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {cleanupResult && (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400 flex items-start gap-3 shadow-sm">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider">Purgado Seguro Completado</h4>
                          <p className="text-[11px] opacity-90 mt-1">{cleanupResult.message}</p>
                        </div>
                      </div>

                      <div className="border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-[var(--color-surface-2)]/60 px-4 py-2 border-b border-[var(--color-border)] flex items-center">
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
              </div>

              {/* PANEL DE SEMBRADO SEGURO (SMART SEEDING) */}
              <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/45 backdrop-blur-md rounded-2xl p-5 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                      <Database size={16} className="text-indigo-400" />
                      Sembrador Inteligente de Datos de Prueba (Smart Seeding)
                    </h2>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      Inicializa o siembra colecciones de prueba (productos, categorías) en Firestore para la instancia seleccionada, validando esquemas contra la documentación del Core.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Instancia para Sembrado
                      </label>
                      <CustomSelect
                        value={selectedCleanupClient}
                        onChange={setSelectedCleanupClient}
                        options={clientList.map(c => ({ value: c, label: c }))}
                        placeholder="-- Seleccionar Instancia --"
                        direction="up"
                      />
                    </div>

                    <button
                      onClick={handleRunSeeder}
                      disabled={seederLoading || !selectedCleanupClient}
                      className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {seederLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Sembrando...</span>
                        </>
                      ) : (
                        <>
                          <Database size={14} />
                          <span>Sembrar Datos de Prueba</span>
                        </>
                      )}
                    </button>
                  </div>

                  {seederResult && (
                    <div className="space-y-4 pt-2">
                      {seederResult.error ? (
                        <div className="p-4 rounded-xl border bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-400 flex items-start gap-3 shadow-sm">
                          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider">Error de Sembrado</h4>
                            <p className="text-[11px] opacity-90 mt-1">{seederResult.error}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400 flex items-start gap-3 shadow-sm">
                          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider">Sembrado Completado</h4>
                            <p className="text-[11px] opacity-90 mt-1">{seederResult.message}</p>
                            {seederResult.schemaChecked && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-extrabold uppercase tracking-wider">
                                Esquema Validado ✓
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PANEL DE PERSONALIZACIÓN DEL FONDO */}
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/45 backdrop-blur-md rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    Personalización del Fondo de Pantalla (Global)
                  </h2>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                    Ajusta los efectos visuales, la densidad, colores y la velocidad del fondo animado en tiempo real.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const defaults = {
                      bgType: 'mesh',
                      bgMouseTracking: true,
                      bgParticlesCount: 40,
                      bgParticlesSpeed: 0.8,
                      bgParticlesSize: 2,
                      bgParticlesOpacity: 0.35,
                      bgParticlesDirection: 'random',
                      bgParticlesShape: 'circle',
                      bgOrbsCount: 3,
                      bgOrbsOpacity: 0.16,
                      bgOrbsSpeed: 1.0,
                      bgOrbsSize: 1.0,
                      bgOrbsBlur: 1.0,
                      primaryColor: '#6366f1',
                      secondaryColor: '#a855f7',
                      bgColor: '#070a13'
                    };
                    Object.entries(defaults).forEach(([k, v]) => {
                      if (updateDashBgSetting) updateDashBgSetting(k, v);
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1 cursor-pointer"
                  title="Restablecer todos los valores del fondo a su configuración original"
                >
                  <RefreshCw size={10} />
                  Restablecer
                </button>
              </div>

              {/* TIPO DE FONDO */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Tipo de Fondo
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--color-surface-2)]/60 rounded-xl border border-[var(--color-border)]">
                  <button
                    onClick={() => updateDashBgSetting?.('bgType', 'mesh')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dashBgSettings.bgType === 'mesh'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    Mesh Dinámico
                  </button>
                  <button
                    onClick={() => updateDashBgSetting?.('bgType', 'particles')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dashBgSettings.bgType === 'particles'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    Partículas Suspendidas
                  </button>
                </div>
              </div>

              {/* SEGUIMIENTO DE CURSOR (SPOTLIGHT) */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                <div>
                  <span className="text-xs font-bold text-[var(--color-text)] block">
                    Seguimiento Interactivo del Cursor
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">
                    Permite que el destello (Spotlight) y las perturbaciones físicas reaccionen al mouse.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!dashBgSettings.bgMouseTracking}
                    onChange={(e) => updateDashBgSetting?.('bgMouseTracking', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[var(--color-surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* PALETAS PREESTABLECIDAS */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Palette size={11} className="text-indigo-400" />
                  Paletas de Color Preestablecidas
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { name: 'Indigo', primary: '#6366f1', secondary: '#a855f7', bg: '#070a13' },
                    { name: 'Aurora', primary: '#10b981', secondary: '#06b6d4', bg: '#022c22' },
                    { name: 'Cyber', primary: '#ec4899', secondary: '#06b6d4', bg: '#0f051d' },
                    { name: 'Eclipse', primary: '#475569', secondary: '#1e293b', bg: '#090d16' },
                    { name: 'Golden', primary: '#f59e0b', secondary: '#ef4444', bg: '#1c1002' }
                  ].map((preset, idx) => {
                    const isSelected = 
                      dashBgSettings.primaryColor === preset.primary &&
                      dashBgSettings.secondaryColor === preset.secondary &&
                      dashBgSettings.bgColor === preset.bg;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          updateDashBgSetting?.('primaryColor', preset.primary);
                          updateDashBgSetting?.('secondaryColor', preset.secondary);
                          updateDashBgSetting?.('bgColor', preset.bg);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all hover:bg-[var(--color-surface-2)] cursor-pointer flex flex-col gap-1 items-center justify-center ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-500/10 shadow-sm shadow-indigo-500/10' 
                            : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30'
                        }`}
                      >
                        <span className="text-[9px] font-extrabold text-[var(--color-text)] truncate w-full text-center">
                          {preset.name}
                        </span>
                        <div className="flex gap-1 items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.primary }} />
                          <div className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.secondary }} />
                          <div className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.bg }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELECTORES DE COLOR PERSONALIZADOS */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20">
                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">
                    Primario
                  </label>
                  <div className="relative group">
                    <input
                      type="color"
                      value={dashBgSettings.primaryColor || '#6366f1'}
                      onChange={(e) => updateDashBgSetting?.('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-full border border-[var(--color-border)] cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full shadow-inner hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] select-all text-center truncate w-full">
                    {dashBgSettings.primaryColor}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">
                    Secundario
                  </label>
                  <div className="relative group">
                    <input
                      type="color"
                      value={dashBgSettings.secondaryColor || '#a855f7'}
                      onChange={(e) => updateDashBgSetting?.('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded-full border border-[var(--color-border)] cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full shadow-inner hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] select-all text-center truncate w-full">
                    {dashBgSettings.secondaryColor}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">
                    Fondo Base
                  </label>
                  <div className="relative group">
                    <input
                      type="color"
                      value={dashBgSettings.bgColor || '#070a13'}
                      onChange={(e) => updateDashBgSetting?.('bgColor', e.target.value)}
                      className="w-10 h-10 rounded-full border border-[var(--color-border)] cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full shadow-inner hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] select-all text-center truncate w-full">
                    {dashBgSettings.bgColor}
                  </span>
                </div>
              </div>

              {/* CONTROLES ESPECÍFICOS DE MESH DINÁMICO */}
              {dashBgSettings.bgType === 'mesh' && (
                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                  <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                    Parámetros del Mesh Dinámico
                  </span>

                  {/* Cantidad de Esferas */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Cantidad de Orbes</span>
                      <span className="text-[var(--color-text)] font-extrabold">{dashBgSettings.bgOrbsCount}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="1"
                      value={dashBgSettings.bgOrbsCount || 3}
                      onChange={(e) => updateDashBgSetting?.('bgOrbsCount', parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Velocidad de Movimiento */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Velocidad del Fluido</span>
                      <span className="text-[var(--color-text)] font-extrabold">{Number(dashBgSettings.bgOrbsSpeed).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="4.0"
                      step="0.1"
                      value={dashBgSettings.bgOrbsSpeed || 1.0}
                      onChange={(e) => updateDashBgSetting?.('bgOrbsSpeed', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Tamaño de Esferas */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Escala de Orbes</span>
                      <span className="text-[var(--color-text)] font-extrabold">{Number(dashBgSettings.bgOrbsSize).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={dashBgSettings.bgOrbsSize || 1.0}
                      onChange={(e) => updateDashBgSetting?.('bgOrbsSize', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Difuminación / Blur */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Grado de Difuminado (Blur)</span>
                      <span className="text-[var(--color-text)] font-extrabold">{Number(dashBgSettings.bgOrbsBlur).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={dashBgSettings.bgOrbsBlur || 1.0}
                      onChange={(e) => updateDashBgSetting?.('bgOrbsBlur', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Opacidad */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Opacidad del Fluido</span>
                      <span className="text-[var(--color-text)] font-extrabold">{Math.round(dashBgSettings.bgOrbsOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.02"
                      max="0.60"
                      step="0.01"
                      value={dashBgSettings.bgOrbsOpacity || 0.16}
                      onChange={(e) => updateDashBgSetting?.('bgOrbsOpacity', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              )}

              {/* CONTROLES ESPECÍFICOS DE PARTÍCULAS SUSPENDIDAS */}
              {dashBgSettings.bgType === 'particles' && (
                <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
                  <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                    Parámetros de Partículas
                  </span>

                  {/* Cantidad de Partículas */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Cantidad de Partículas</span>
                      <span className="text-[var(--color-text)] font-extrabold">{dashBgSettings.bgParticlesCount}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={dashBgSettings.bgParticlesCount || 40}
                      onChange={(e) => updateDashBgSetting?.('bgParticlesCount', parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Velocidad */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Velocidad de Traslación</span>
                      <span className="text-[var(--color-text)] font-extrabold">{Number(dashBgSettings.bgParticlesSpeed).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="4.0"
                      step="0.1"
                      value={dashBgSettings.bgParticlesSpeed || 0.8}
                      onChange={(e) => updateDashBgSetting?.('bgParticlesSpeed', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Tamaño */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Tamaño de Partículas</span>
                      <span className="text-[var(--color-text)] font-extrabold">{dashBgSettings.bgParticlesSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      step="1"
                      value={dashBgSettings.bgParticlesSize || 2}
                      onChange={(e) => updateDashBgSetting?.('bgParticlesSize', parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Opacidad */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)] font-medium">Opacidad</span>
                      <span className="text-[var(--color-text)] font-extrabold">{Math.round(dashBgSettings.bgParticlesOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.90"
                      step="0.05"
                      value={dashBgSettings.bgParticlesOpacity || 0.35}
                      onChange={(e) => updateDashBgSetting?.('bgParticlesOpacity', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Dirección y Forma en una sola fila */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Dirección de Vuelo
                      </span>
                      <CustomSelect
                        value={dashBgSettings.bgParticlesDirection || 'random'}
                        onChange={(val) => updateDashBgSetting?.('bgParticlesDirection', val)}
                        direction="up"
                        options={[
                          { value: 'random', label: 'Aleatorio' },
                          { value: 'up', label: 'Hacia Arriba' },
                          { value: 'down', label: 'Hacia Abajo' },
                          { value: 'left', label: 'Hacia la Izquierda' },
                          { value: 'right', label: 'Hacia la Derecha' }
                        ]}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Geometría / Forma
                      </span>
                      <CustomSelect
                        value={dashBgSettings.bgParticlesShape || 'circle'}
                        onChange={(val) => updateDashBgSetting?.('bgParticlesShape', val)}
                        direction="up"
                        options={[
                          { value: 'circle', label: 'Círculos' },
                          { value: 'glow', label: 'Brillo / Glow' },
                          { value: 'star', label: 'Chispas' },
                          { value: 'niche', label: 'Icono del Rubro' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
