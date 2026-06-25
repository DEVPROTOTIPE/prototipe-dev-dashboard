import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, RefreshCw, Activity, Download, Plus, Search, AlertCircle, 
  ArrowUpRight, Terminal, StopCircle, Play, ChevronRight, Check, 
  CheckCircle, Eye, RotateCcw, X, GitCommit, Database, Layers
} from 'lucide-react';

import { useDevStore } from '../../stores/devStore';
import { useAuthStore } from '../../stores/authStore';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { exportClientsDirectoryPDF } from '../../services/pdfService';
import { CLI_URL } from '../../config/constants';

import CustomSelect from '../../components/ui/CustomSelect';
import { useAlertConfirm } from '../../components/common/AlertConfirmContext';
import useToast from '../../hooks/useToast';
import GuidedToast from '../../components/ui/GuidedToast';

import { createPortal } from 'react-dom';

// Importaciones del CRM Comercial
import CrmDashboardView from '../../components/admin/crm/CrmDashboardView';
const CrmDashboardExecutiveView = lazy(() => import('../../components/admin/crm/CrmDashboardExecutiveView'));
const CrmBiView = lazy(() => import('../../components/admin/crm/CrmBiView'));
const CrmReportsView = lazy(() => import('../../components/admin/crm/CrmReportsView'));
const CrmProvisioningView = lazy(() => import('../../components/admin/crm/CrmProvisioningView'));
import CrmLeadsView from '../../components/admin/crm/CrmLeadsView';
import CrmMeetingsView from '../../components/admin/crm/CrmMeetingsView';
import CrmDiagnosticsView from '../../components/admin/crm/CrmDiagnosticsView';
import CrmProposalsView from '../../components/admin/crm/CrmProposalsView';
import CrmClientsView from '../../components/admin/crm/CrmClientsView';
import CrmProjectsView from '../../components/admin/crm/CrmProjectsView';
import CrmFollowupsView from '../../components/admin/crm/CrmFollowupsView';
import CrmTasksView from '../../components/admin/crm/CrmTasksView';

function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}

export default function CrmPage() {
  const navigate = useNavigate();
  const { showConfirm } = useAlertConfirm();
  const { toast, showToast, hideToast } = useToast();
  const { role } = useAuthStore();

  const { 
    clientesSaas, reports, telemetryTokens, failures, setClientesSaas, setFailures,
    isSimulated, addLog, crmSubTab, setCrmSubTab, setTerminalDrawer, terminalDrawer
  } = useDevStore();

  // Estados locales de CRM
  const [crmSearch, setCrmSearch] = useState('');
  const [selectedCrmClientId, setSelectedCrmClientId] = useState(null);
  const [activeMetricModal, setActiveMetricModal] = useState(null);
  const [crmTab, setCrmTab] = useState('config'); // 'config' | 'drift'

  // Modo de visualización: Comercial vs Técnico
  const [crmMode, setCrmMode] = useState('tecnico');
  const [commercialTab, setCommercialTab] = useState('dashboard');

  useEffect(() => {
    if (role === 'comercial') {
      setCrmMode('comercial');
    } else {
      setCrmMode('tecnico');
    }
  }, [role]);

  const [localServers, setLocalServers] = useState({});
  const [driftLoading, setDriftLoading] = useState(false);
  const [driftData, setDriftData] = useState(null);
  const [syncingFile, setSyncingFile] = useState({});

  const [bulkSyncFiles, setBulkSyncFiles] = useState({});
  const [isBulkSyncModalOpen, setIsBulkSyncModalOpen] = useState(false);
  const [bulkSyncLoading, setBulkSyncLoading] = useState(false);

  const [isDeployTerminalOpen, setIsDeployTerminalOpen] = useState(false);
  const [deployTerminalClientId, setDeployTerminalClientId] = useState('');
  const [deployLogs, setDeployLogs] = useState([]);
  const [deployError, setDeployError] = useState(null);
  const [deployAuditScore, setDeployAuditScore] = useState(null);
  const [deployState, setDeployState] = useState('idle'); // 'idle' | 'running' | 'success' | 'failed'
  const [deployProgressPercent, setDeployProgressPercent] = useState(0);

  const [deployQueue, setDeployQueue] = useState([]);
  const [deployQueueIndex, setDeployQueueIndex] = useState(-1);

  // Estados de Sincronización / Despliegues globales
  const [globalSyncCheckedClients, setGlobalSyncCheckedClients] = useState({});
  const [isGlobalSyncConfigModalOpen, setIsGlobalSyncConfigModalOpen] = useState(false);
  const [isGlobalSyncProcessActive, setIsGlobalSyncProcessActive] = useState(false);
  const [globalSyncCurrentClient, setGlobalSyncCurrentClient] = useState('');

  const [globalDeployCheckedClients, setGlobalDeployCheckedClients] = useState({});
  const [isGlobalDeployConfigModalOpen, setIsGlobalDeployConfigModalOpen] = useState(false);

  const [globalTelemetryCheckedClients, setGlobalTelemetryCheckedClients] = useState({});
  const [isGlobalTelemetryModalOpen, setIsGlobalTelemetryModalOpen] = useState(false);

  const [gitDiffModal, setGitDiffModal] = useState({ open: false, clientId: '', file: '', diff: '' });
  const [gitDiffLoading, setGitDiffLoading] = useState(false);
  const [gitDiscardingFile, setGitDiscardingFile] = useState(null);

  const [activeRulesDiff, setActiveRulesDiff] = useState(null);
  const [activeDiffFile, setActiveDiffFile] = useState(null);

  // Campos de edición de Configuración Operativa
  const [editNiche, setEditNiche] = useState('retail_clothing');
  const [editBillingMode, setEditBillingMode] = useState('percentage');
  const [editComisionPorcentaje, setEditComisionPorcentaje] = useState(1.5);
  const [editMontoFijoServicio, setEditMontoFijoServicio] = useState(500);
  const [editPagoMensualFijo, setEditPagoMensualFijo] = useState(50000);
  const [editEnableDianBilling, setEditEnableDianBilling] = useState(false);
  const [editCostoPorFacturaDian, setEditCostoPorFacturaDian] = useState(150);

  const [editAlertActive, setEditAlertActive] = useState(false);
  const [editAlertTitle, setEditAlertTitle] = useState('');
  const [editAlertMessage, setEditAlertMessage] = useState('');
  const [editAlertType, setEditAlertType] = useState('info');
  const [editAlertDismissible, setEditAlertDismissible] = useState(true);

  // Datos globales de Drift & Firebase Rules
  const [globalDrift, setGlobalDrift] = useState([]);
  const [globalDriftLoading, setGlobalDriftLoading] = useState(false);
  const [firebaseRulesDrift, setFirebaseRulesDrift] = useState([]);
  const [firebaseRulesDriftLoading, setFirebaseRulesDriftLoading] = useState(false);
  const [deployingRulesClientId, setDeployingRulesClientId] = useState(null);

  // Clientes agregados con ventas y comisiones totales históricas
  const clientAggregated = useMemo(() => {
    const initialMap = clientesSaas.reduce((acc, c) => {
      acc[c.id] = {
        name: c.id,
        totalSales: 0,
        totalCommission: 0,
        reportCount: 0,
        pendingCount: 0
      };
      return acc;
    }, {});

    return reports.reduce((acc, r) => {
      if (!acc[r.clientId]) {
        acc[r.clientId] = {
          name: r.clientId,
          totalSales: 0,
          totalCommission: 0,
          reportCount: 0,
          pendingCount: 0
        };
      }
      acc[r.clientId].totalSales += (r.totalVentas || 0);
      acc[r.clientId].totalCommission += (r.comisionValor || 0);
      acc[r.clientId].reportCount += 1;
      const reportStatus = (r.estadoPago || 'pendiente').toLowerCase();
      if (reportStatus === 'pendiente') {
        acc[r.clientId].pendingCount += 1;
      }
      return acc;
    }, initialMap);
  }, [reports, clientesSaas]);

  // Carga reactiva de servidores locales al ingresar a la pestaña CRM
  useEffect(() => {
    if (clientesSaas.length > 0) {
      clientesSaas.forEach(async (c) => {
        try {
          const res = await fetch(`${CLI_URL}/api/project/dev/status?clientId=${encodeURIComponent(c.id)}`);
          const data = await res.json();
          if (data.success) {
            setLocalServers(prev => ({
              ...prev,
              [c.id]: { running: data.running, url: data.url || '', loading: false }
            }));
          }
        } catch (err) {
          console.error("Error al obtener status local:", err);
        }
      });
    }
  }, [clientesSaas]);

  // Carga automática de drifts según sub-pestaña seleccionada
  useEffect(() => {
    if (crmSubTab === 'firebase-rules') {
      fetchFirebaseRulesDrift();
    } else if (crmSubTab === 'paridad') {
      fetchGlobalDrift();
    }
  }, [crmSubTab]);

  // Cola Reactiva de Despliegue Global
  useEffect(() => {
    if (deployQueueIndex >= 0 && deployQueueIndex < deployQueue.length) {
      const nextClientId = deployQueue[deployQueueIndex];
      addLog(`[Cola Global] Iniciando despliegue de (${deployQueueIndex + 1}/${deployQueue.length}): ${nextClientId}...`, "info");
      handleDeployClient(nextClientId, false);
    } else if (deployQueueIndex >= deployQueue.length && deployQueue.length > 0) {
      addLog(`[Cola Global] Proceso de despliegue en lote completado.`, "success");
      showToast("Despliegue global finalizado.", { type: 'success' });
      setDeployQueue([]);
      setDeployQueueIndex(-1);
    }
  }, [deployQueueIndex]);

  useEffect(() => {
    if (deployQueueIndex >= 0 && (deployState === 'success' || deployState === 'failed')) {
      const timer = setTimeout(() => {
        setDeployQueueIndex(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deployState, deployQueueIndex]);

  // Funciones locales de red / endpoints CLI
  const handleStartLocalServer = async (clientId) => {
    setLocalServers(prev => ({ ...prev, [clientId]: { ...prev[clientId], loading: true } }));
    addLog(`[Local Server] Iniciando npm run dev para ${clientId}...`, 'info');
    try {
      const res = await fetch(`${CLI_URL}/api/project/dev/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      const data = await res.json();
      if (data.success) {
        setLocalServers(prev => ({
          ...prev,
          [clientId]: { running: true, url: data.url, loading: false }
        }));
        addLog(`[Local Server] Servidor local iniciado para ${clientId} en ${data.url}`, 'success');
        showToast(`Servidor local de ${clientId} iniciado`, { type: 'success' });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      setLocalServers(prev => ({ ...prev, [clientId]: { running: false, url: '', loading: false } }));
      addLog(`[Local Server Error] Falló al iniciar servidor local para ${clientId}: ${err.message}`, 'error');
      showToast(`Error al iniciar servidor local para ${clientId}`, { type: 'error' });
    }
  };

  const handleStopLocalServer = async (clientId) => {
    setLocalServers(prev => ({ ...prev, [clientId]: { ...prev[clientId], loading: true } }));
    addLog(`[Local Server] Deteniendo servidor local de ${clientId}...`, 'info');
    try {
      const res = await fetch(`${CLI_URL}/api/project/dev/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      const data = await res.json();
      if (data.success) {
        setLocalServers(prev => ({
          ...prev,
          [clientId]: { running: false, url: '', loading: false }
        }));
        addLog(`[Local Server] Servidor local detenido para ${clientId}`, 'info');
        showToast(`Servidor local de ${clientId} detenido`, { type: 'info' });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      setLocalServers(prev => ({ ...prev, [clientId]: { running: false, url: '', loading: false } }));
      addLog(`[Local Server Error] Falló al detener servidor para ${clientId}: ${err.message}`, 'error');
      showToast(`Error al detener servidor para ${clientId}`, { type: 'error' });
    }
  };

  const fetchGlobalDrift = async () => {
    setGlobalDriftLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/project/drift/global`);
      const data = await res.json();
      if (data.success) {
        setGlobalDrift(data.driftMatrix || []);
      } else {
        throw new Error(data.error || 'Error al obtener drift global');
      }
    } catch (err) {
      console.error(err);
      addLog(`[Drift Global] Error: ${err.message}`, 'error');
    } finally {
      setGlobalDriftLoading(false);
    }
  };

  const fetchFirebaseRulesDrift = async () => {
    setFirebaseRulesDriftLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/project/firebase-rules/drift-global`);
      const data = await res.json();
      if (data.success) {
        setFirebaseRulesDrift(data.driftMatrix || []);
      } else {
        throw new Error(data.error || 'Error al obtener drift de reglas Firebase');
      }
    } catch (err) {
      console.error(err);
      addLog(`[Reglas Firebase] Error de escaneo: ${err.message}`, 'error');
      showToast(`Fallo al escanear reglas de Firebase: ${err.message}`, { type: 'error' });
    } finally {
      setFirebaseRulesDriftLoading(false);
    }
  };

  const handleDeployFirebaseRules = async (clientId, type = 'all') => {
    const confirmText = type === 'all' 
      ? `¿Desplegar todas las reglas de Firebase (Firestore y Storage) para la marca "${clientId}"?`
      : `¿Desplegar reglas de ${type === 'firestore' ? 'Firestore' : 'Storage'} para la marca "${clientId}"?`;
    const proceed = await showConfirm({
      title: 'Desplegar Reglas de Seguridad',
      message: confirmText,
      confirmText: 'Sí, Desplegar',
      cancelText: 'Cancelar'
    });
    if (!proceed) return;

    setDeployingRulesClientId(`${clientId}_${type}`);
    addLog(`[Firebase Rules] Iniciando despliegue de reglas (${type}) para ${clientId}...`, 'info');
    try {
      const res = await fetch(`${CLI_URL}/api/project/firebase-rules/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, type })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`[Firebase Rules] Reglas (${type}) desplegadas con éxito para ${clientId}. Output: ${data.output || ''}`, 'success');
        showToast(`Reglas (${type}) desplegadas correctamente en ${clientId}.`, { type: 'success' });
        fetchFirebaseRulesDrift();
      } else {
        throw new Error(data.error || 'Fallo desconocido en deploy');
      }
    } catch (err) {
      console.error(err);
      addLog(`[Firebase Rules] Error al desplegar rules: ${err.message}`, 'error');
      showToast(`Error de despliegue: ${err.message}`, { type: 'error' });
    } finally {
      setDeployingRulesClientId(null);
    }
  };

  const handleSaveCrmConfig = async () => {
    if (!selectedCrmClientId) return;
    
    addLog(`Guardando configuración de vertical/cobro para cliente ${selectedCrmClientId}...`, "info");
    
    const updateData = {
      niche: editNiche,
      billingMode: editBillingMode,
      comisionPorcentaje: editComisionPorcentaje,
      montoFijoServicio: editMontoFijoServicio,
      pagoMensualFijo: editPagoMensualFijo,
      enableDianBilling: editEnableDianBilling,
      costoPorFacturaDian: editCostoPorFacturaDian,
      sistemaAlerta: editAlertActive ? {
        active: true,
        title: editAlertTitle.trim(),
        message: editAlertMessage.trim(),
        type: editAlertType,
        dismissible: editAlertDismissible,
        alertId: Date.now().toString()
      } : null
    };

    if (isSimulated) {
      setClientesSaas(prev => prev.map(c => c.id.toLowerCase() === selectedCrmClientId.toLowerCase() ? {
        ...c,
        ...updateData
      } : c));
      
      addLog(`[Sandbox] Configuración de cliente ${selectedCrmClientId} actualizada localmente.`, "success");
      showToast('Configuración guardada (Modo Sandbox)', { type: 'success' });
      setActiveMetricModal(null);
      setSelectedCrmClientId(null);
      return;
    }

    try {
      const clientRef = doc(db, 'clientes_control', selectedCrmClientId.toLowerCase());
      await updateDoc(clientRef, updateData);
      
      addLog(`[Firestore] Configuración de cliente ${selectedCrmClientId} guardada en Firestore central.`, "success");
      showToast('Configuración guardada correctamente', { type: 'success' });
      setActiveMetricModal(null);
      setSelectedCrmClientId(null);
    } catch (err) {
      console.error("Error al actualizar cliente:", err);
      addLog(`Error al guardar configuración de cliente: ${err.message}`, "error");
      showToast(`Error al guardar configuración: ${err.message}`, { type: 'error' });
    }
  };

  const loadDriftData = async (clientId) => {
    setDriftLoading(true);
    setDriftData(null);
    try {
      const res = await fetch(`${CLI_URL}/api/project/drift?clientId=${encodeURIComponent(clientId)}`);
      const data = await res.json();
      if (data.success) {
        setDriftData(data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast(`Error al cargar desviación del Core: ${err.message}`, { type: 'error' });
    } finally {
      setDriftLoading(false);
    }
  };

  const handleSyncFile = async (clientId, filename) => {
    setSyncingFile(p => ({ ...p, [filename]: true }));
    try {
      const res = await fetch(`${CLI_URL}/api/project/sync-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, file: filename })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Sincronizado: ${filename}`, { type: 'success' });
        await loadDriftData(clientId);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast(`Error al sincronizar: ${err.message}`, { type: 'error' });
    } finally {
      setSyncingFile(p => ({ ...p, [filename]: false }));
    }
  };

  const isFileSensitive = (filename) => {
    const sens = ['index.html', 'package.json', 'tailwind.config.js', 'postcss.config.js', 'vite.config.js', 'firestore.rules', 'firestore.indexes.json', 'storage.rules', '.firebaserc', 'firebase.json'];
    const lower = filename.toLowerCase();
    if (sens.includes(lower)) return true;
    if (lower.startsWith('public/')) return true;
    return false;
  };

  const handleBulkSync = async (clientId, selectedFiles) => {
    setBulkSyncLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/project/sync-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, files: selectedFiles })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Sincronizados ${selectedFiles.length} archivos con éxito`, { type: 'success' });
        setIsBulkSyncModalOpen(false);
        await loadDriftData(clientId);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast(`Error en sincronización masiva: ${err.message}`, { type: 'error' });
    } finally {
      setBulkSyncLoading(false);
    }
  };

  const handleDeployClient = (clientId, force = false) => {
    setDeployLogs([]);
    setDeployError(null);
    setDeployAuditScore(null);
    setDeployTerminalClientId(clientId);
    setDeployState('running');
    setDeployProgressPercent(5);
    setIsDeployTerminalOpen(true);

    const eventSource = new EventSource(`${CLI_URL}/api/project/deploy?clientId=${encodeURIComponent(clientId)}&force=${force}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'log') {
          setDeployLogs(prev => [...prev, data.line]);
          
          if (data.line.includes('Compilando aplicación local')) {
            setDeployProgressPercent(25);
          } else if (data.line.includes('Compilación exitosa')) {
            setDeployProgressPercent(50);
          } else if (data.line.includes('auditoría física')) {
            setDeployProgressPercent(70);
          } else if (data.line.includes('Subiendo a Firebase Hosting')) {
            setDeployProgressPercent(85);
          } else if (data.line.includes('Despliegue completado con éxito')) {
            setDeployProgressPercent(100);
            setDeployState('success');
          }
        } else if (data.type === 'result') {
          if (data.success) {
            setDeployState('success');
            setDeployProgressPercent(100);
            showToast(`¡Despliegue exitoso para ${clientId}!`, { type: 'success' });
          } else {
            setDeployState('failed');
            setDeployError(data.error);
            showToast(`Fallo en despliegue de ${clientId}`, { type: 'error' });
          }
          eventSource.close();
        } else if (data.type === 'audit_failed') {
          setDeployState('failed');
          setDeployAuditScore(data.score);
          setDeployLogs(prev => [...prev, `❌ AUDITORÍA DE CALIDAD FALLÓ (Puntaje: ${data.score}/100)`]);
          showToast(`Despliegue cancelado por puntaje de auditoría bajo: ${data.score}`, { type: 'error' });
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing deploy message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Deploy EventSource error:", err);
      setDeployState('failed');
      setDeployError("Conexión interrumpida con el servidor de compilación");
      eventSource.close();
    };
  };

  const handleGlobalSyncSafeFiles = () => {
    const active = clientesSaas.filter(c => !c.archived);
    if (active.length === 0) {
      showToast("No hay clientes activos para sincronizar", { type: 'error' });
      return;
    }
    const initialChecked = {};
    active.forEach(c => {
      initialChecked[c.id] = true;
    });
    setGlobalSyncCheckedClients(initialChecked);
    setIsGlobalSyncConfigModalOpen(true);
  };

  const handleExecuteGlobalSync = async () => {
    const active = clientesSaas.filter(c => !c.archived);
    const selectedIds = active.filter(c => globalSyncCheckedClients[c.id]).map(c => c.id);
    
    if (selectedIds.length === 0) {
      showToast("Debe seleccionar al menos un cliente para sincronizar", { type: 'error' });
      return;
    }
    
    setIsGlobalSyncConfigModalOpen(false);
    setIsGlobalSyncProcessActive(true);
    addLog(`[Sincronización Global] Iniciando análisis y sincronización para ${selectedIds.length} clientes...`, "info");
    showToast("Iniciando sincronización...", { type: 'info' });
    let totalSynced = 0;
    
    for (const clientId of selectedIds) {
      setGlobalSyncCurrentClient(clientId);
      try {
        const res = await fetch(`${CLI_URL}/api/project/drift?clientId=${encodeURIComponent(clientId)}`);
        const drift = await res.json();
        
        if (drift.success && drift.differences.length > 0) {
          const safeFiles = drift.differences
            .filter(d => !isFileSensitive(d.file))
            .map(d => d.file);
            
          if (safeFiles.length > 0) {
            addLog(`Sincronizando ${safeFiles.length} archivos seguros para: ${clientId}...`, "info");
            const syncRes = await fetch(`${CLI_URL}/api/project/sync-files`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientId, files: safeFiles })
            });
            const syncData = await syncRes.json();
            if (syncData.success) {
              totalSynced += safeFiles.length;
              addLog(`✔ Sincronización completa para ${clientId}.`, "success");
            }
          } else {
            addLog(`Sincronización para ${clientId}: Sin archivos core pendientes de actualizar.`, "info");
          }
        } else {
          addLog(`Sincronización para ${clientId}: Paridad total con el Core de referencia.`, "success");
        }
      } catch (err) {
        addLog(`❌ Error sincronizando ${clientId}: ${err.message}`, "error");
      }
    }
    
    setIsGlobalSyncProcessActive(false);
    setGlobalSyncCurrentClient('');
    if (totalSynced > 0) {
      showToast(`Sincronización global completada: ${totalSynced} archivos seguros actualizados.`, { type: 'success' });
    } else {
      showToast("Sincronización global terminada sin cambios pendientes.", { type: 'info' });
    }
    fetchGlobalDrift();
  };

  const handleGlobalDeployAll = () => {
    const active = clientesSaas.filter(c => !c.archived);
    if (active.length === 0) {
      showToast("No hay clientes activos para desplegar", { type: 'error' });
      return;
    }
    const initialChecked = {};
    active.forEach(c => {
      initialChecked[c.id] = true;
    });
    setGlobalDeployCheckedClients(initialChecked);
    setIsGlobalDeployConfigModalOpen(true);
  };

  const handleExecuteGlobalDeploy = () => {
    const active = clientesSaas.filter(c => !c.archived);
    const selectedIds = active.filter(c => globalDeployCheckedClients[c.id]).map(c => c.id);
    
    if (selectedIds.length === 0) {
      showToast("Debe seleccionar al menos un cliente para desplegar", { type: 'error' });
      return;
    }
    
    setIsGlobalDeployConfigModalOpen(false);
    addLog(`[Cola Global] Iniciando despliegue de hosting para ${selectedIds.length} clientes seleccionados.`, "info");
    setDeployQueue(selectedIds);
    setDeployQueueIndex(0);
  };

  const handleRequestClientTelemetry = async (clientId) => {
    addLog(`Solicitando reporte de telemetría a ${clientId}...`, "info");
    
    if (isSimulated) {
      addLog(`[Sandbox] Telemetría solicitada para ${clientId}. (Simulado)`, "success");
      showToast(`[Sandbox] Telemetría solicitada para ${clientId}`, { type: 'success' });
      return;
    }

    try {
      const clientRef = doc(db, 'clientes_control', clientId.toLowerCase());
      await updateDoc(clientRef, {
        triggerTelemetryReport: Date.now()
      });
      addLog(`[Firestore] Telemetría solicitada exitosamente para ${clientId}.`, "success");
      showToast(`Telemetría solicitada para ${clientId}`, { type: 'success' });
    } catch (err) {
      console.error("Error solicitando telemetría:", err);
      addLog(`Error al solicitar telemetría para ${clientId}: ${err.message}`, "error");
      showToast(`Error al solicitar telemetría: ${err.message}`, { type: 'error' });
    }
  };

  const handleRequestAllTelemetry = () => {
    const active = clientesSaas.filter(c => !c.archived);
    if (active.length === 0) {
      showToast("No hay clientes activos para solicitar telemetría", { type: 'error' });
      return;
    }
    const initialChecked = {};
    active.forEach(c => {
      initialChecked[c.id] = true;
    });
    setGlobalTelemetryCheckedClients(initialChecked);
    setIsGlobalTelemetryModalOpen(true);
  };

  const handleExecuteGlobalTelemetry = async () => {
    const active = clientesSaas.filter(c => !c.archived);
    const selectedIds = active.filter(c => globalTelemetryCheckedClients[c.id]).map(c => c.id);

    if (selectedIds.length === 0) {
      showToast("Debe seleccionar al menos un cliente para solicitar telemetría", { type: 'error' });
      return;
    }

    setIsGlobalTelemetryModalOpen(false);
    addLog(`Solicitando reporte de telemetría para ${selectedIds.length} clientes...`, "info");
    
    if (isSimulated) {
      addLog(`[Sandbox] Telemetría global solicitada para: ${selectedIds.join(', ')}. (Simulado)`, "success");
      showToast(`[Sandbox] Telemetría global solicitada`, { type: 'success' });
      return;
    }

    try {
      const timestamp = Date.now();
      const promises = selectedIds.map(clientId => {
        const clientRef = doc(db, 'clientes_control', clientId.toLowerCase());
        return updateDoc(clientRef, {
          triggerTelemetryReport: timestamp
        });
      });
      await Promise.all(promises);
      addLog(`[Firestore] Telemetría solicitada para ${selectedIds.length} clientes: ${selectedIds.join(', ')}.`, "success");
      showToast(`Telemetría solicitada para ${selectedIds.length} clientes`, { type: 'success' });
    } catch (err) {
      console.error("Error solicitando telemetría global:", err);
      addLog(`Error al solicitar telemetría global: ${err.message}`, "error");
      showToast(`Error al solicitar telemetría global: ${err.message}`, { type: 'error' });
    }
  };

  const handleGitDiscard = async (clientId, file, discardAll = false) => {
    const confirmMsg = discardAll 
      ? `¿Estás seguro de que deseas descartar TODOS los cambios locales de Git en la marca "${clientId}"? Esto borrará el código modificado y restaurará la copia exacta del último commit de producción.`
      : `¿Estás seguro de descartar las modificaciones del archivo "${file}" en el cliente "${clientId}"?`;
    
    const proceed = await showConfirm({
      title: discardAll ? 'Limpiar Git Local' : 'Descartar Cambios',
      message: confirmMsg,
      confirmText: 'Sí, Descartar',
      cancelText: 'Cancelar'
    });
    if (!proceed) return;

    setGitDiscardingFile(file || 'all');
    try {
      const res = await fetch(`${CLI_URL}/api/git/discard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, file, all: discardAll })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, { type: 'success' });
        addLog(`[Git Discard] ${data.message}`, 'success');
        if (driftData && selectedCrmClientId === clientId) {
          loadDriftData(clientId);
        } else {
          fetchGlobalDrift();
        }
      } else {
        throw new Error(data.error || 'Error de Git');
      }
    } catch (err) {
      showToast(`Fallo al deshacer cambios: ${err.message}`, { type: 'error' });
      addLog(`[Git Discard Error] ${err.message}`, 'error');
    } finally {
      setGitDiscardingFile(null);
    }
  };

  const handleGitDiff = async (clientId, file) => {
    setGitDiffLoading(true);
    setGitDiffModal({ open: true, clientId, file, diff: '' });
    try {
      const res = await fetch(`${CLI_URL}/api/git/diff-file?clientId=${encodeURIComponent(clientId)}&file=${encodeURIComponent(file)}`);
      const data = await res.json();
      if (data.success) {
        setGitDiffModal(prev => ({ ...prev, diff: data.diff }));
      } else {
        throw new Error(data.error || 'No se pudo obtener el diff');
      }
    } catch (err) {
      setGitDiffModal(prev => ({ ...prev, diff: `Error al obtener el diff: ${err.message}` }));
    } finally {
      setGitDiffLoading(false);
    }
  };

  const activeCrmMode = role === 'comercial' ? 'comercial' : crmMode;

  if (activeCrmMode === 'comercial') {
    return (
      <div className="space-y-6 tab-content-enter select-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
              <Users size={20} className="text-indigo-400" />
              CRM Comercial
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">Gestión operativa de preventa: leads, reuniones y briefings de descubrimiento.</p>
          </div>
          
          {role === 'admin' && (
            <div className="flex bg-[var(--color-surface-2)]/60 p-1 rounded-xl border border-[var(--color-border)] w-max text-xs font-bold shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setCrmMode('comercial')}
                className={`px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all ${
                  crmMode === 'comercial'
                    ? 'bg-indigo-600 text-white font-black'
                    : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                CRM Comercial
              </button>
              <button
                type="button"
                onClick={() => setCrmMode('tecnico')}
                className={`px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all ${
                  crmMode === 'tecnico'
                    ? 'bg-indigo-600 text-white font-black'
                    : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Consola Técnica
              </button>
            </div>
          )}
        </div>

        {/* Sub-navegación comercial */}
        <div className="flex border-b border-[var(--color-border)] gap-6 text-xs font-bold shrink-0 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
          <button onClick={() => setCommercialTab('dashboard')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'dashboard' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Dashboard CRM
          </button>
          <button onClick={() => setCommercialTab('executive')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'executive' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Dashboard Ejecutivo
          </button>
          <button onClick={() => setCommercialTab('bi')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'bi' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Analítica y BI
          </button>
          <button onClick={() => setCommercialTab('reports')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'reports' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Reportes y Exportación
          </button>
          <button onClick={() => setCommercialTab('leads')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'leads' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Leads y Prospectos
          </button>
          <button onClick={() => setCommercialTab('meetings')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'meetings' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Reuniones y Agenda
          </button>
          <button onClick={() => setCommercialTab('diagnostics')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'diagnostics' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Briefings y Diagnósticos
          </button>
          <button onClick={() => setCommercialTab('proposals')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'proposals' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Propuestas Comerciales
          </button>
          <button onClick={() => setCommercialTab('clientes')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'clientes' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Clientes Activos
          </button>
          <button onClick={() => setCommercialTab('provisioning')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'provisioning' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Aprovisionamiento
          </button>
          <button onClick={() => setCommercialTab('projects')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'projects' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Proyectos Core
          </button>
          <button onClick={() => setCommercialTab('followups')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'followups' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Historial de Seguimientos
          </button>
          <button onClick={() => setCommercialTab('tasks')}
            className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
              commercialTab === 'tasks' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            Tareas y Backlog
          </button>
        </div>

        {/* Vistas operativas */}
        <div className="tab-content-enter">
          <Suspense fallback={
            <div className="p-16 text-center text-slate-400 text-xs space-y-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
              <RefreshCw size={22} className="mx-auto animate-spin text-indigo-400" />
              <p className="font-semibold uppercase tracking-wider text-[10px]">Cargando vista analítica...</p>
            </div>
          }>
            {commercialTab === 'dashboard' && <CrmDashboardView />}
            {commercialTab === 'executive' && <CrmDashboardExecutiveView />}
            {commercialTab === 'bi' && <CrmBiView />}
            {commercialTab === 'reports' && <CrmReportsView />}
            {commercialTab === 'leads' && <CrmLeadsView />}
            {commercialTab === 'meetings' && <CrmMeetingsView />}
            {commercialTab === 'diagnostics' && <CrmDiagnosticsView />}
            {commercialTab === 'proposals' && <CrmProposalsView />}
            {commercialTab === 'clientes' && <CrmClientsView />}
            {commercialTab === 'provisioning' && <CrmProvisioningView />}
            {commercialTab === 'projects' && <CrmProjectsView />}
            {commercialTab === 'followups' && <CrmFollowupsView />}
            {commercialTab === 'tasks' && <CrmTasksView />}
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 tab-content-enter select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
              <Users size={20} className="text-purple-400" />
              Consola Técnica de Clientes
            </h1>
            {role === 'admin' && (
              <div className="flex bg-[var(--color-surface-2)]/60 p-1 rounded-xl border border-[var(--color-border)] text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setCrmMode('comercial')}
                  className="px-3 py-1.5 rounded-lg bg-transparent text-slate-400 hover:text-slate-200 border-none cursor-pointer font-bold"
                >
                  CRM Comercial
                </button>
                <button
                  type="button"
                  onClick={() => setCrmMode('tecnico')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-black border-none cursor-pointer"
                >
                  Consola Técnica
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Directorio completo, configuración de facturación y portal de cada cliente.</p>
        </div>
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2.5 w-full lg:w-auto mt-2 lg:mt-0">
          <button onClick={handleGlobalSyncSafeFiles}
            className="w-full md:w-auto px-3 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer">
            <RefreshCw size={13} className="animate-pulse" />
            Sincronización Global
          </button>
          <button onClick={handleGlobalDeployAll}
            className="w-full md:w-auto px-3 py-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer">
            <Activity size={13} />
            Despliegue Global
          </button>
          <button onClick={handleRequestAllTelemetry}
            className="w-full md:w-auto px-3 py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/25 text-purple-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer">
            <Activity size={13} />
            Telemetría Global
          </button>
          <button onClick={() => {
              exportClientsDirectoryPDF(clientesSaas);
              addLog('Directorio de clientes exportado a PDF.', 'success');
            }}
            className="w-full md:w-auto px-3 py-2.5 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer">
            <Download size={13} />
            Exportar Directorio
          </button>
          <button onClick={() => navigate('/onboarding')}
            className="w-full md:w-auto px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-[0.98] cursor-pointer border-none">
            <Plus size={13} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Sub-pestañas CRM */}
      <div className="flex border-b border-[var(--color-border)] gap-6 text-xs font-bold shrink-0">
        <button onClick={() => setCrmSubTab('directorio')}
          className={`pb-3 border-b-2 transition-all cursor-pointer border-none bg-transparent ${
            crmSubTab === 'directorio' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}>
          Directorio Clientes
        </button>
        <button onClick={() => setCrmSubTab('paridad')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 border-none bg-transparent ${
            crmSubTab === 'paridad' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}>
          Matriz de Paridad (Drift Heatmap)
          {globalDrift.some(d => d.parityPercent < 100 || d.dependenciesOutOfSync) && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
        <button onClick={() => setCrmSubTab('firebase-rules')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 border-none bg-transparent ${
            crmSubTab === 'firebase-rules' ? 'border-indigo-500 text-indigo-400 font-extrabold border-solid' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}>
          Reglas Firebase (Drift & Deploy)
          {firebaseRulesDrift.some(d => d.firestore.drift || d.storage.drift) && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {crmSubTab === 'directorio' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2.5 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-all">
            <Search size={14} className="text-slate-500 shrink-0" />
            <input type="text" placeholder="Buscar cliente..." value={crmSearch} onChange={e => setCrmSearch(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0 focus:border-none focus:outline-none" />
          </div>
          
          {/* Lista de clientes */}
          {Object.values(clientAggregated).filter(c => c.name.toLowerCase().includes(crmSearch.toLowerCase())).map(client => {
            const driftInfo = globalDrift.find(d => d.clientId.toLowerCase() === client.name.toLowerCase());
            return (
              <div key={client.name} className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black flex items-center justify-center text-sm border border-indigo-500/20 shrink-0">
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[var(--color-text)]">{client.name}</p>
                      {driftInfo && (
                        <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-black border ${
                          driftInfo.parityPercent >= 95 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                          driftInfo.parityPercent >= 80 ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
                          'bg-red-500/15 text-red-400 border-red-500/25'
                        }`}>
                          {driftInfo.parityPercent}% Paridad
                        </span>
                      )}
                      {driftInfo?.dependenciesOutOfSync && (
                        <span className="px-1.5 py-0.2 rounded text-[7.5px] font-extrabold bg-amber-500/15 text-amber-550 border border-amber-500/25 flex items-center gap-0.5" title="Dependencias NPM desactualizadas">
                          <AlertCircle size={9} />
                          Deps ⚠️
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{client.reportCount} reportes · {client.pendingCount} pendientes</p>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full lg:w-auto gap-4 mt-2 lg:mt-0 pt-3 lg:pt-0 border-t border-[var(--color-border)] lg:border-t-0">
                  <div className="flex items-center gap-6 pr-2">
                    <div>
                      <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Ventas</span>
                      <span className="text-xs font-black font-mono text-[var(--color-text)]">${client.totalSales.toLocaleString('es-CO')}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Comisión</span>
                      <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">${client.totalCommission.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                    {/* BOTÓN DESPLEGAR EN LOCAL */}
                    {(() => {
                      const server = localServers[client.name] || { running: false, url: '', loading: false };
                      if (server.loading) {
                          return (
                            <button disabled
                              className="flex-1 sm:flex-initial px-3 py-1.5 bg-violet-600/10 text-violet-400 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all opacity-50 border border-violet-500/10 min-w-[120px] sm:min-w-0">
                              <RefreshCw size={11} className="animate-spin" />
                              Procesando...
                            </button>
                          );
                      }
                      if (server.running) {
                        return (
                          <div className="contents sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
                            <a href={server.url} target="_blank" rel="noopener noreferrer"
                              className="flex-1 sm:flex-initial px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm border-none min-w-[90px] sm:min-w-0 decoration-none">
                              <ArrowUpRight size={11} className="mr-0.5" />
                              Ir a Local
                            </a>
                            <button onClick={() => setTerminalDrawer({ open: true, clientId: client.name.toLowerCase(), title: `Terminal Vite - ${client.name}`, type: 'dev' })}
                              className="px-3 py-1.5 sm:p-1.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-xl cursor-pointer flex items-center justify-center transition-all border border-slate-500/15 min-w-[40px] sm:min-w-0"
                              title="Ver Consola de Desarrollo">
                              <Terminal size={12} />
                            </button>
                            <button onClick={() => handleStopLocalServer(client.name)}
                              className="flex-1 sm:flex-initial px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-95 border border-red-500/10 hover:border-red-500/30 min-w-[80px] sm:min-w-0">
                              <StopCircle size={11} />
                              Detener
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button onClick={() => handleStartLocalServer(client.name)}
                          className="flex-1 sm:flex-initial px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 rounded-xl text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-95 border border-violet-500/10 hover:border-violet-500/30 min-w-[120px] sm:min-w-0">
                          <Play size={11} />
                          Desplegar en Local
                        </button>
                      );
                    })()}

                    {driftInfo?.dependenciesOutOfSync && (
                      <button onClick={() => setTerminalDrawer({ open: true, clientId: client.name.toLowerCase(), title: `Instalar Dependencias - ${client.name}`, type: 'npm' })}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-amber-500/15 hover:bg-amber-550/25 text-amber-500 border border-amber-500/25 rounded-xl text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-95 min-w-[120px] sm:min-w-0">
                        <RefreshCw size={11} className="animate-spin-slow" />
                        Instalar Deps
                      </button>
                    )}
                    <button onClick={() => handleRequestClientTelemetry(client.name)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-95 border border-emerald-500/10 hover:border-emerald-500/30 min-w-[130px] sm:min-w-0">
                      <Activity size={11} className="animate-pulse" />
                      Obtener Telemetría
                    </button>
                    <button onClick={() => { 
                      const cfg = clientesSaas.find(c => c.id.toLowerCase() === client.name.toLowerCase()) || {};
                      setEditNiche(cfg.niche || 'retail_clothing');
                      setEditBillingMode(cfg.billingMode || 'percentage');
                      setEditComisionPorcentaje(cfg.comisionPorcentaje !== undefined ? cfg.comisionPorcentaje : 1.5);
                      setEditMontoFijoServicio(cfg.montoFijoServicio !== undefined ? cfg.montoFijoServicio : 500);
                      setEditPagoMensualFijo(cfg.pagoMensualFijo !== undefined ? cfg.pagoMensualFijo : 50000);
                      setEditEnableDianBilling(!!cfg.enableDianBilling);
                      setEditCostoPorFacturaDian(cfg.costoPorFacturaDian !== undefined ? cfg.costoPorFacturaDian : 150);
                      
                      const alertCfg = cfg.sistemaAlerta || {};
                      setEditAlertActive(!!alertCfg.active);
                      setEditAlertTitle(alertCfg.title || '');
                      setEditAlertMessage(alertCfg.message || '');
                      setEditAlertType(alertCfg.type || 'info');
                      setEditAlertDismissible(alertCfg.dismissible !== undefined ? alertCfg.dismissible : true);

                      setCrmTab('config');
                      setDriftData(null);
                      setSelectedCrmClientId(client.name); 
                      setActiveMetricModal('clientes'); 
                    }}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm border-none min-w-[100px] sm:min-w-0">
                      Gestionar
                      <ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {Object.values(clientAggregated).filter(c => c.name.toLowerCase().includes(crmSearch.toLowerCase())).length === 0 && (
            <div className="p-12 text-center text-slate-500 text-xs">No hay clientes que coincidan con la búsqueda.</div>
          )}
        </div>
      ) : crmSubTab === 'paridad' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-muted)]">Mapa de paridad física del código del ecosistema respecto a los Cores de Referencia.</p>
            <button onClick={fetchGlobalDrift} disabled={globalDriftLoading}
              className="px-3 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors">
              <RefreshCw size={12} className={globalDriftLoading ? 'animate-spin' : ''} />
              Refrescar
            </button>
          </div>
          {globalDriftLoading && globalDrift.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs space-y-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
              <RefreshCw size={22} className="mx-auto animate-spin text-indigo-400" />
              <p className="font-semibold uppercase tracking-wider text-[10px]">Analizando paridad de archivos en el ecosistema...</p>
            </div>
          ) : globalDrift.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
              No se encontraron datos de paridad. Intenta refrescar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalDrift.map(drift => {
                const client = Object.values(clientAggregated).find(c => c.name.toLowerCase() === drift.clientId.toLowerCase()) || { name: drift.projectName, totalSales: 0 };
                const cardColor = drift.parityPercent >= 95 ? 'border-emerald-500/20 bg-emerald-500/[0.01]' :
                                  drift.parityPercent >= 80 ? 'border-amber-500/20 bg-amber-500/[0.01]' :
                                  'border-red-500/20 bg-red-500/[0.01]';
                const barColor = drift.parityPercent >= 95 ? 'bg-emerald-500' :
                                 drift.parityPercent >= 80 ? 'bg-amber-500' :
                                 'bg-red-500';

                return (
                  <div key={drift.clientId} className={`p-4 rounded-2xl border ${cardColor} transition-all hover:scale-[1.01] flex flex-col gap-3 relative overflow-hidden group bg-[var(--color-surface)]`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-xs text-[var(--color-text)] truncate max-w-[150px]">{client.name}</h4>
                        <span className="text-[8px] text-[var(--color-text-muted)] font-mono block">Core: {drift.coreId}</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black font-mono border ${
                        drift.parityPercent >= 95 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
                        drift.parityPercent >= 80 ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                        'bg-red-500/10 text-red-400 border-red-500/25'
                      }`}>
                        {drift.parityPercent}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[8px] text-[var(--color-text-muted)]">
                        <span>Paridad de código</span>
                        <span className="font-mono">{drift.parityPercent}/100</span>
                      </div>
                      <div className="h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${drift.parityPercent}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <div className="p-1.5 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] flex flex-col items-center">
                        <span className="text-[7.5px] uppercase font-bold text-[var(--color-text-muted)]">Modificados</span>
                        <span className="font-bold text-amber-400 mt-0.5">{drift.modifiedCount}</span>
                      </div>
                      <div className="p-1.5 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] flex flex-col items-center">
                        <span className="text-[7.5px] uppercase font-bold text-[var(--color-text-muted)]">Faltantes</span>
                        <span className="font-bold text-red-400 mt-0.5">{drift.missingCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-2.5 mt-1 text-[9px]">
                      {drift.dependenciesOutOfSync ? (
                        <span className="text-[7.5px] font-bold text-amber-500 flex items-center gap-0.5">
                          <AlertCircle size={9} />
                          Deps ⚠️
                        </span>
                      ) : (
                        <span className="text-[7.5px] font-semibold text-[var(--color-text-muted)] flex items-center gap-0.5">
                          <Check size={9} className="text-emerald-500" />
                          Deps OK
                        </span>
                      )}
                      
                      <div className="flex gap-1">
                        {drift.parityPercent < 100 && (
                          <button onClick={async () => {
                            const proceed = await showConfirm({
                              title: 'Sincronizar Lógica Core',
                              message: `¿Sincronizar los ${drift.modifiedCount + drift.missingCount} archivos core en el cliente "${client.name}"?`,
                              confirmText: 'Sí, Sincronizar',
                              cancelText: 'Cancelar'
                            });
                            if (!proceed) return;
                            const filesToSync = [...drift.modifiedFiles, ...drift.missingFiles];
                            try {
                              const res = await fetch(`${CLI_URL}/api/project/sync-files`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ clientId: drift.clientId, files: filesToSync })
                              });
                              const resData = await res.json();
                              if (resData.success) {
                                showToast(`Sincronización masiva para ${client.name} completada con éxito.`, { type: 'success' });
                                fetchGlobalDrift();
                              } else {
                                throw new Error(resData.error);
                              }
                            } catch (e) {
                              showToast(`Error: ${e.message}`, { type: 'error' });
                            }
                          }}
                            className="px-2 py-1 bg-indigo-650 hover:bg-indigo-500 text-white font-bold rounded-lg text-[8px] transition-all cursor-pointer border-none flex items-center gap-0.5">
                            Sincronizar
                          </button>
                        )}

                        <button onClick={() => {
                          const cfg = clientesSaas.find(c => c.id.toLowerCase() === drift.clientId.toLowerCase()) || {};
                          setEditNiche(cfg.niche || 'retail_clothing');
                          setEditBillingMode(cfg.billingMode || 'percentage');
                          setEditComisionPorcentaje(cfg.comisionPorcentaje !== undefined ? cfg.comisionPorcentaje : 1.5);
                          setEditMontoFijoServicio(cfg.montoFijoServicio !== undefined ? cfg.montoFijoServicio : 500);
                          setEditPagoMensualFijo(cfg.pagoMensualFijo !== undefined ? cfg.pagoMensualFijo : 50000);
                          setEditEnableDianBilling(!!cfg.enableDianBilling);
                          setEditCostoPorFacturaDian(cfg.costoPorFacturaDian !== undefined ? cfg.costoPorFacturaDian : 150);

                          const alertCfg = cfg.sistemaAlerta || {};
                          setEditAlertActive(!!alertCfg.active);
                          setEditAlertTitle(alertCfg.title || '');
                          setEditAlertMessage(alertCfg.message || '');
                          setEditAlertType(alertCfg.type || 'info');
                          setEditAlertDismissible(alertCfg.dismissible !== undefined ? alertCfg.dismissible : true);
                          setSelectedCrmClientId(client.name);
                          setActiveMetricModal('clientes');
                          setCrmTab('drift');
                          loadDriftData(client.name);
                        }}
                          className="px-2 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg text-[8px] font-bold border border-[var(--color-border)] transition-colors cursor-pointer">
                          Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-muted)]">Paridad y Despliegue de Reglas de Seguridad (Firestore y Storage) en la Nube vs Core.</p>
            <button onClick={fetchFirebaseRulesDrift} disabled={firebaseRulesDriftLoading}
              className="px-3 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors">
              <RefreshCw size={12} className={firebaseRulesDriftLoading ? 'animate-spin' : ''} />
              Refrescar Reglas
            </button>
          </div>
          {firebaseRulesDriftLoading && firebaseRulesDrift.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs space-y-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
              <RefreshCw size={22} className="mx-auto animate-spin text-indigo-400" />
              <p className="font-semibold uppercase tracking-wider text-[10px]">Analizando paridad de reglas en la nube...</p>
            </div>
          ) : firebaseRulesDrift.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
              No se encontraron instancias con Firebase configurado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {firebaseRulesDrift.map(item => {
                const hasDrift = item.firestore.drift || item.storage.drift;
                const cardColor = !hasDrift ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-amber-500/20 bg-amber-500/[0.01]';
                
                return (
                  <div key={item.clientId} className={`p-4 rounded-2xl border ${cardColor} flex flex-col gap-3 relative overflow-hidden group bg-[var(--color-surface)]`}>
                    <div>
                      <h4 className="font-extrabold text-xs text-[var(--color-text)]">{item.projectName}</h4>
                      <span className="text-[8px] text-[var(--color-text-muted)] font-mono block">Project: {item.firebaseProjectId}</span>
                      <span className="text-[8px] text-[var(--color-text-muted)] font-mono block">Core: {item.templateKey}</span>
                    </div>

                    {/* Firestore Rules Status */}
                    <div className="p-2.5 bg-[var(--color-surface-2)]/40 rounded-xl border border-[var(--color-border)] flex items-center justify-between text-[10px]">
                      <div>
                        <span className="font-bold block">Firestore Rules</span>
                        <span className="text-[8px] text-[var(--color-text-muted)]">
                          {item.firestore.error ? `Error: ${item.firestore.error}` :
                           !item.firestore.hasCloud ? 'Sin desplegar en nube' :
                           item.firestore.drift ? '⚠️ Desviado del Core' : '✅ Alineado'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {item.firestore.hasLocal && item.firestore.hasCloud && (
                          <button onClick={() => setActiveRulesDiff({ local: item.firestore.local, cloud: item.firestore.cloud, title: `${item.projectName} - Firestore Rules` })}
                            className="h-5 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded text-[8px] font-bold border border-slate-700 cursor-pointer">
                            Ver Diff
                          </button>
                        )}
                        <button onClick={() => handleDeployFirebaseRules(item.clientId, 'firestore')}
                          disabled={deployingRulesClientId === `${item.clientId}_firestore`}
                          className="h-5 px-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded text-[8px] font-bold border-none cursor-pointer disabled:opacity-50">
                          {deployingRulesClientId === `${item.clientId}_firestore` ? '...' : 'Deploy'}
                        </button>
                      </div>
                    </div>

                    {/* Storage Rules Status */}
                    <div className="p-2.5 bg-[var(--color-surface-2)]/40 rounded-xl border border-[var(--color-border)] flex items-center justify-between text-[10px]">
                      <div>
                        <span className="font-bold block">Storage Rules</span>
                        <span className="text-[8px] text-[var(--color-text-muted)]">
                          {item.storage.error ? `Error: ${item.storage.error}` :
                           !item.storage.hasCloud ? 'Sin desplegar en nube' :
                           item.storage.drift ? '⚠️ Desviado del Core' : '✅ Alineado'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {item.storage.hasLocal && item.storage.hasCloud && (
                          <button onClick={() => setActiveRulesDiff({ local: item.storage.local, cloud: item.storage.cloud, title: `${item.projectName} - Storage Rules` })}
                            className="h-5 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded text-[8px] font-bold border border-slate-700 cursor-pointer">
                            Ver Diff
                          </button>
                        )}
                        <button onClick={() => handleDeployFirebaseRules(item.clientId, 'storage')}
                          disabled={deployingRulesClientId === `${item.clientId}_storage`}
                          className="h-5 px-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded text-[8px] font-bold border-none cursor-pointer disabled:opacity-50">
                          {deployingRulesClientId === `${item.clientId}_storage` ? '...' : 'Deploy'}
                        </button>
                      </div>
                    </div>

                    <button onClick={() => handleDeployFirebaseRules(item.clientId, 'all')}
                      disabled={deployingRulesClientId === `${item.clientId}_all`}
                      className="py-1.5 mt-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-450 text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50">
                      {deployingRulesClientId === `${item.clientId}_all` ? 'Desplegando...' : 'Desplegar Ambas Reglas'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalle y Gestión de Cliente (CRM) */}
      {activeMetricModal === 'clientes' && selectedCrmClientId && (
        <Portal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-black text-sm uppercase text-indigo-500 tracking-wider flex items-center gap-2">
                <Users size={16} />
                Gestionar Cliente: {selectedCrmClientId}
              </h3>
              <button 
                onClick={() => {
                  setActiveMetricModal(null);
                  setSelectedCrmClientId(null);
                }}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            {/* Selector de Pestañas CRM */}
            <div className="flex border-b border-[var(--color-border)] pb-0.5 mb-2">
              <button
                onClick={() => setCrmTab('config')}
                className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer border-none bg-transparent ${
                  crmTab === 'config'
                    ? 'border-indigo-500 text-indigo-400 border-solid'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Configuración Operativa
              </button>
              <button
                onClick={() => {
                  setCrmTab('drift');
                  loadDriftData(selectedCrmClientId);
                }}
                className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer border-none bg-transparent ${
                  crmTab === 'drift'
                    ? 'border-indigo-500 text-indigo-400 border-solid'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Sincronización Core (Drift)
              </button>
            </div>

            {crmTab === 'config' ? (
              <>
                <div className="space-y-4">
                  {/* Nicho de Mercado */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Nicho de Mercado / Vertical de Negocio</label>
                    <CustomSelect 
                      value={editNiche} 
                      onChange={(e) => setEditNiche(e.target.value)}
                      options={[
                        { id: "retail_clothing", name: "🛍️ Ropa y Retail Tradicional (retail_clothing)" },
                        { id: "technical_services", name: "⚙️ Tornerías y Mecanizado de Precisión (technical_services)" },
                        { id: "refrigeration_ac", name: "❄️ Refrigeración y Climatización (refrigeration_ac)" },
                        { id: "contractors", name: "📐 Contratistas y Construcción (contractors)" },
                        { id: "machinery_rental", name: "🚜 Alquiler de Maquinaria y Equipos (machinery_rental)" },
                        { id: "carpentry", name: "🪚 Carpinterías y Muebles (carpentry)" },
                        { id: "laundry", name: "🧺 Lavanderías y Tintorerías (laundry)" },
                        { id: "furniture_repair", name: "🛋️ Restauración y Tapicería de Muebles (furniture_repair)" },
                        { id: "wellness_podology", name: "💆 Estética, Podología y Bienestar (wellness_podology)" },
                        { id: "grocery_food", name: "🍎 Minimarkets y Alimentos (grocery_food)" }
                      ]}
                    />
                  </div>

                  {/* Modo de Facturación */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Modelo de Cobro Base</label>
                    <CustomSelect
                      value={editBillingMode}
                      onChange={(val) => setEditBillingMode(val)}
                      options={[
                        { id: "percentage", name: "Porcentaje sobre Ventas (%)" },
                        { id: "fixed_per_service", name: "Monto Fijo por Servicio" },
                        { id: "flat_monthly", name: "Pago Mensual Fijo" }
                      ]}
                    />
                  </div>

                  {editBillingMode === 'percentage' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Tasa de Comisión (%)</label>
                      <input 
                        type="number" 
                        value={editComisionPorcentaje} 
                        onChange={(e) => setEditComisionPorcentaje(parseFloat(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono focus:ring-0"
                        step="0.1"
                      />
                    </div>
                  )}

                  {editBillingMode === 'fixed_per_service' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Monto Fijo por Servicio ($ COP)</label>
                      <input 
                        type="number" 
                        value={editMontoFijoServicio} 
                        onChange={(e) => setEditMontoFijoServicio(parseInt(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono focus:ring-0"
                      />
                    </div>
                  )}

                  {editBillingMode === 'flat_monthly' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Pago Mensual Fijo ($ COP)</label>
                      <input 
                        type="number" 
                        value={editPagoMensualFijo} 
                        onChange={(e) => setEditPagoMensualFijo(parseInt(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono focus:ring-0"
                      />
                    </div>
                  )}

                  {/* Facturación Electrónica DIAN */}
                  <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                      <input 
                        type="checkbox" 
                        checked={editEnableDianBilling} 
                        onChange={(e) => setEditEnableDianBilling(e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                      />
                      Habilitar Facturación Electrónica DIAN Directa
                    </label>

                    {editEnableDianBilling && (
                      <div className="space-y-1.5 animate-fade-in pl-6 border-l border-solid border-indigo-500/20">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Costo por Documento DIAN ($ COP)</label>
                        <input 
                          type="number" 
                          value={editCostoPorFacturaDian}
                          onChange={(e) => setEditCostoPorFacturaDian(parseFloat(e.target.value) || 0)}
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs w-full max-w-[200px] text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono focus:ring-0"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Alerta Remota / Bloqueo del Sistema */}
                  <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                      <input 
                        type="checkbox" 
                        checked={editAlertActive} 
                        onChange={(e) => setEditAlertActive(e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                      />
                      Habilitar Alerta Remota / Bloqueo Administrativo
                    </label>

                    {editAlertActive && (
                      <div className="space-y-3 animate-fade-in pl-6 border-l border-solid border-indigo-500/20">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Tipo de Alerta</label>
                          <CustomSelect
                            value={editAlertType}
                            onChange={(val) => setEditAlertType(val)}
                            options={[
                              { id: "info", name: "Información (Azul)" },
                              { id: "warning", name: "Advertencia (Naranja)" },
                              { id: "error", name: "Error / Bloqueante (Rojo)" }
                            ]}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Título de la Alerta</label>
                          <input 
                            type="text" 
                            value={editAlertTitle} 
                            onChange={(e) => setEditAlertTitle(e.target.value)}
                            placeholder="Ej: Prueba de Enlace de Telemetría"
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 focus:ring-0"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Mensaje de la Alerta</label>
                          <textarea 
                            value={editAlertMessage} 
                            onChange={(e) => setEditAlertMessage(e.target.value)}
                            placeholder="Mensaje de advertencia o bloqueo..."
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full h-20 text-[var(--color-text)] outline-none focus:border-indigo-500 resize-none focus:ring-0"
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-[var(--color-text-muted)] select-none">
                          <input 
                            type="checkbox" 
                            checked={editAlertDismissible} 
                            onChange={(e) => setEditAlertDismissible(e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-indigo-600 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                          />
                          Permitir al usuario cerrar el aviso (Dismissible)
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)] border-solid">
                  <button 
                    onClick={() => {
                      setActiveMetricModal(null);
                      setSelectedCrmClientId(null);
                    }}
                    className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] border-solid text-[var(--color-text)] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveCrmConfig}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg active:scale-95 transition-all border-none"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Panel de Sincronización Core (Drift) */}
                <div className="space-y-4">
                  {driftLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-500" />
                      <span className="text-xs text-[var(--color-text-muted)]">Analizando desviación respecto al Core...</span>
                    </div>
                  ) : driftData ? (
                    <div className="space-y-4">
                      {/* Resumen de paridad */}
                      <div className="flex items-center justify-between bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] border-solid rounded-2xl p-4">
                        <div>
                          <p className="text-xs font-black text-[var(--color-text)]">Índice de Paridad de Código</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Core de Referencia: <span className="font-mono font-bold text-indigo-400">{driftData.coreId}</span></p>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          driftData.parityPercent >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-solid border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-solid border-amber-500/20'
                        }`}>
                          {driftData.parityPercent}% Sincronizado
                        </span>
                      </div>

                      {/* Acciones Rápidas del Cliente */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const filesMap = {};
                            driftData.differences.forEach(diff => {
                              filesMap[diff.file] = !isFileSensitive(diff.file);
                            });
                            setBulkSyncFiles(filesMap);
                            setIsBulkSyncModalOpen(true);
                          }}
                          disabled={driftData.differences.length === 0}
                          className="py-2 bg-indigo-650/10 hover:bg-indigo-650/20 border border-indigo-500/25 border-solid text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
                          title="Sincronizar lote con Core"
                        >
                          <RefreshCw size={11} className="animate-pulse" />
                          Lote Core
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGitDiscard(selectedCrmClientId.toLowerCase(), null, true)}
                          disabled={driftData.differences.length === 0 || gitDiscardingFile === 'all'}
                          className="py-2 bg-red-650/10 hover:bg-red-650/20 border border-red-500/25 border-solid text-red-500 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
                          title="Descartar todas las modificaciones de Git"
                        >
                          <RotateCcw size={11} className={gitDiscardingFile === 'all' ? 'animate-spin' : ''} />
                          Limpiar Git
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeployClient(selectedCrmClientId, false)}
                          className="py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 border-solid text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                        >
                          <Activity size={11} />
                          Deploy Host
                        </button>
                      </div>

                      {/* Lista de desviaciones */}
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                        {driftData.differences.length === 0 ? (
                          <div className="text-center py-10 bg-emerald-500/5 border border-emerald-500/10 border-solid rounded-2xl">
                            <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                              <CheckCircle size={14} />
                              ¡Código 100% Alineado!
                            </p>
                            <p className="text-[10px] text-emerald-300/60 mt-1">Esta instancia de cliente no presenta desviaciones físicas con el Core.</p>
                          </div>
                        ) : (
                          driftData.differences.map((diff, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[var(--color-surface-2)]/10 border border-[var(--color-border)] border-solid rounded-xl hover:bg-[var(--color-surface-2)]/20 transition-all">
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-mono font-bold text-[var(--color-text)] break-all">{diff.file}</p>
                                <p className="text-[9px] text-[var(--color-text-muted)]">
                                  {diff.status === 'missing_in_client' ? '⚠️ Archivo ausente en cliente' : '✏️ Archivo modificado/desviado'}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {diff.status === 'modified' && (
                                  <>
                                    <button
                                      onClick={() => handleGitDiff(selectedCrmClientId.toLowerCase(), diff.file)}
                                      className="h-6 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1 border border-solid border-slate-700"
                                      title="Comparar cambios contra Git HEAD"
                                    >
                                      <Eye size={10} />
                                      Git Diff
                                    </button>
                                    <button
                                      onClick={() => handleGitDiscard(selectedCrmClientId.toLowerCase(), diff.file)}
                                      disabled={gitDiscardingFile === diff.file}
                                      className="h-6 px-1.5 bg-red-650 hover:bg-red-500 text-red-500 rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1 disabled:opacity-40 border border-solid border-red-500/10"
                                      title="Descartar cambios en este archivo"
                                    >
                                      <RotateCcw size={10} className={gitDiscardingFile === diff.file ? 'animate-spin' : ''} />
                                      Deshacer
                                    </button>
                                  </>
                                )}
                                {diff.status === 'modified' && (
                                  <button
                                    onClick={() => setActiveDiffFile(diff)}
                                    className="h-6 px-2 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg text-[9px] font-bold cursor-pointer border-solid border border-slate-700"
                                    title="Comparar contra plantilla Core"
                                  >
                                    Diff Core
                                  </button>
                                )}
                                <button
                                  onClick={() => handleSyncFile(selectedCrmClientId, diff.file)}
                                  disabled={syncingFile[diff.file]}
                                  className="h-6 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1 disabled:opacity-40 border-none"
                                >
                                  {syncingFile[diff.file] ? <RefreshCw size={8} className="animate-spin" /> : <RefreshCw size={8} />}
                                  Sincronizar
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">Fallo al obtener estado.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        </Portal>
      )}

      {/* Modal de Sincronización Inteligente Lote (Bulk Sync) */}
      {isBulkSyncModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsBulkSyncModalOpen(false)} />
          <div className="w-full max-w-lg bg-slate-900/90 border border-solid border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-solid border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <RefreshCw size={16} className="text-indigo-400 animate-spin" />
                  Sincronización Inteligente Lote
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Sincroniza múltiples archivos desviados a la vez filtrando elementos sensibles.</p>
              </div>
              <button 
                onClick={() => setIsBulkSyncModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            {/* Lista de Archivos */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              <div className="p-3 bg-amber-500/10 border border-solid border-amber-500/20 rounded-xl space-y-1 text-[10px] text-amber-450 dark:text-amber-400">
                <p className="font-bold flex items-center gap-1.5">
                  ⚠️ Filtro de Seguridad Inteligente Activo
                </p>
                <p className="text-slate-350">
                  Hemos desmarcado por defecto los archivos sensibles (branding, configuraciones de pasarela o index de cliente) para evitar sobreescribir personalizaciones operativas.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Selecciona archivos para actualizar:</p>
                
                <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                  {Object.keys(bulkSyncFiles).map(filename => {
                    const isSensitive = isFileSensitive(filename);
                    return (
                      <label 
                        key={filename} 
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border border-solid transition-all cursor-pointer ${
                          isSensitive 
                            ? 'bg-amber-500/5 border-amber-500/15 hover:bg-amber-500/10' 
                            : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!bulkSyncFiles[filename]}
                          onChange={(e) => {
                            setBulkSyncFiles(prev => ({ ...prev, [filename]: e.target.checked }));
                          }}
                          className="mt-0.5 w-4 h-4 rounded accent-indigo-600 bg-slate-950 border border-slate-800 focus:ring-0 focus:outline-none cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[10px] text-slate-300 break-all">{filename}</span>
                          <span className="block text-[9px] font-bold">
                            {isSensitive ? (
                              <span className="text-amber-400">⚠️ Archivo Sensible (Branding/Config)</span>
                            ) : (
                              <span className="text-indigo-400">✔ Lógica Core (Seguro para actualizar)</span>
                            )}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-solid border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkSyncModalOpen(false)}
                className="px-4 py-2 border border-solid border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={bulkSyncLoading || !Object.values(bulkSyncFiles).some(Boolean)}
                onClick={() => {
                  const filesToSync = Object.keys(bulkSyncFiles).filter(f => bulkSyncFiles[f]);
                  handleBulkSync(selectedCrmClientId, filesToSync);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-indigo-950/25 flex items-center gap-1.5 border-none"
              >
                {bulkSyncLoading && <RefreshCw size={12} className="animate-spin" />}
                Aplicar Sincronización ({Object.values(bulkSyncFiles).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terminal de Despliegue de Hosting (SSE Bridge) */}
      {isDeployTerminalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => {
            if (deployState !== 'running') setIsDeployTerminalOpen(false);
          }} />
          <div className="w-full max-w-xl bg-slate-950 border border-solid border-slate-800 rounded-3xl shadow-2xl relative z-10 flex flex-col h-[70vh] overflow-hidden">
            {/* Header / Barra de título */}
            <div className="p-4 bg-slate-900 border-b border-solid border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-550 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-550 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-550 block"></span>
                <span className="text-[10px] font-mono text-slate-400 font-bold ml-2">
                  ssh developer@bridge-deploy:~/{deployTerminalClientId}
                  {deployQueue.length > 0 && ` [Cola: ${deployQueueIndex + 1}/${deployQueue.length}]`}
                </span>
              </div>
              <button
                onClick={() => setIsDeployTerminalOpen(false)}
                disabled={deployState === 'running'}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            {/* Terminal Screen / Logs */}
            <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-mono text-[10px] text-slate-350 space-y-1.5 scrollbar-thin text-left select-text">
              {deployLogs.map((log, index) => (
                <div key={index} className={`leading-relaxed whitespace-pre-wrap ${
                  log.startsWith('❌') ? 'text-red-400 font-bold' : 
                  log.startsWith('⚠️') || log.startsWith('⚠') ? 'text-amber-400' : 
                  log.startsWith('✅') || log.startsWith('🎉') ? 'text-emerald-400 font-bold' : 
                  log.startsWith('🚀') || log.startsWith('📦') ? 'text-indigo-400 font-bold' : 'text-slate-355'
                }`}>
                  {log}
                </div>
              ))}
              {deployState === 'running' && (
                <div className="flex items-center gap-2 text-indigo-400 font-bold animate-pulse mt-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  <span>Ejecutando operaciones en la instancia...</span>
                </div>
              )}
            </div>

            {/* Status Bar / Progress */}
            <div className="p-4 bg-slate-900 border-t border-solid border-slate-800/80 space-y-3.5">
              {/* Barra de progreso */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400">Progreso de Despliegue</span>
                  <span className={deployState === 'success' ? 'text-emerald-400' : deployState === 'failed' ? 'text-red-400' : 'text-indigo-400'}>
                    {deployState === 'success' ? '✔ COMPLETO' : deployState === 'failed' ? '❌ FALLIDO' : `${deployProgressPercent}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      deployState === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                      deployState === 'failed' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                    }`}
                    style={{ width: `${deployProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Botones de acción del terminal */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  {deployAuditScore !== null && (
                    <div className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-solid border-red-500/20 rounded-md">
                      Puntaje PWA: {deployAuditScore}/100 (Bajo)
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {deployQueue.length > 0 && (
                    <button
                      onClick={() => {
                        setDeployQueue([]);
                        setDeployQueueIndex(-1);
                        setDeployState('idle');
                        addLog(`[Cola Global] Cola de despliegue en lote cancelada por el desarrollador.`, "error");
                        showToast("Cola de despliegue cancelada", { type: 'info' });
                      }}
                      className="px-3.5 py-1.5 bg-red-600/15 hover:bg-red-600/25 border border-solid border-red-500/30 text-red-450 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar Cola
                    </button>
                  )}
                  {deployState === 'failed' && (
                    <button
                      onClick={() => handleDeployClient(deployTerminalClientId, true)}
                      className="px-3.5 py-1.5 bg-amber-600/15 hover:bg-amber-600/25 border border-solid border-amber-500/30 text-amber-450 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Forzar Despliegue (Ignorar Auditoría)
                    </button>
                  )}
                  <button
                    onClick={() => setIsDeployTerminalOpen(false)}
                    disabled={deployState === 'running'}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-solid border-slate-700 text-slate-300 font-bold rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    Cerrar Consola
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Sincronización Global */}
      {isGlobalSyncConfigModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsGlobalSyncConfigModalOpen(false)} />
          <div className="w-full max-w-md bg-slate-900/90 border border-solid border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-solid border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <RefreshCw size={16} className="text-indigo-400" />
                  Sincronización Global Core (Safe)
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Selecciona los clientes en los que deseas sincronizar la lógica de archivos core.</p>
              </div>
              <button 
                onClick={() => setIsGlobalSyncConfigModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            {/* Client Checklist */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Clientes Activos</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const allChecked = {};
                      clientesSaas.filter(c => !c.archived).forEach(c => { allChecked[c.id] = true; });
                      setGlobalSyncCheckedClients(allChecked);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer border-none bg-transparent"
                  >
                    Seleccionar Todos
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => setGlobalSyncCheckedClients({})}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer border-none bg-transparent"
                  >
                    Deseleccionar Todos
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {clientesSaas.filter(c => !c.archived).map(client => (
                  <label 
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-solid border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer"
                  >
                    <input 
                      type="checkbox"
                      checked={!!globalSyncCheckedClients[client.id]}
                      onChange={(e) => {
                        setGlobalSyncCheckedClients(prev => ({ ...prev, [client.id]: e.target.checked }));
                      }}
                      className="w-4 h-4 rounded accent-indigo-600 bg-slate-950 border border-slate-800 focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-200">{client.id}</span>
                      <span className="block text-[9px] text-slate-450 font-medium">Nicho: {client.niche || 'N/A'} • Versión: Ecosistema Core</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-solid border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGlobalSyncConfigModalOpen(false)}
                className="px-4 py-2 border border-solid border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteGlobalSync}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-indigo-950/25 flex items-center gap-1.5 border-none"
              >
                Iniciar Sincronización ({Object.values(globalSyncCheckedClients).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Despliegue Global Hosting */}
      {isGlobalDeployConfigModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsGlobalDeployConfigModalOpen(false)} />
          <div className="w-full max-w-md bg-slate-900/90 border border-solid border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-solid border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  Despliegue Global Hosting
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Selecciona los clientes cuyos proyectos de hosting de Firebase se compilarán y subirán.</p>
              </div>
              <button 
                onClick={() => setIsGlobalDeployConfigModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            {/* Client Checklist */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Clientes Activos</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const allChecked = {};
                      clientesSaas.filter(c => !c.archived).forEach(c => { allChecked[c.id] = true; });
                      setGlobalDeployCheckedClients(allChecked);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer border-none bg-transparent"
                  >
                    Seleccionar Todos
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => setGlobalDeployCheckedClients({})}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer border-none bg-transparent"
                  >
                    Deseleccionar Todos
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {clientesSaas.filter(c => !c.archived).map(client => (
                  <label 
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-solid border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer"
                  >
                    <input 
                      type="checkbox"
                      checked={!!globalDeployCheckedClients[client.id]}
                      onChange={(e) => {
                        setGlobalDeployCheckedClients(prev => ({ ...prev, [client.id]: e.target.checked }));
                      }}
                      className="w-4 h-4 rounded accent-emerald-600 bg-slate-950 border border-slate-800 focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-200">{client.id}</span>
                      <span className="block text-[9px] text-slate-450 font-medium">Nicho: {client.niche || 'N/A'} • Hosting: Firebase</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-solid border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGlobalDeployConfigModalOpen(false)}
                className="px-4 py-2 border border-solid border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteGlobalDeploy}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-950/25 flex items-center gap-1.5 border-none"
              >
                Iniciar Despliegue ({Object.values(globalDeployCheckedClients).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Telemetría Global */}
      {isGlobalTelemetryModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsGlobalTelemetryModalOpen(false)} />
          <div className="w-full max-w-md bg-slate-900/90 border border-solid border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-solid border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <Activity size={16} className="text-slate-400" />
                  Obtener Telemetría Global
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Selecciona los clientes a los que deseas solicitar un reporte de telemetría y diagnóstico inmediato.</p>
              </div>
              <button 
                onClick={() => setIsGlobalTelemetryModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            {/* Client Checklist */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Clientes Activos</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const allChecked = {};
                      clientesSaas.filter(c => !c.archived).forEach(c => { allChecked[c.id] = true; });
                      setGlobalTelemetryCheckedClients(allChecked);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer border-none bg-transparent"
                  >
                    Seleccionar Todos
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => setGlobalTelemetryCheckedClients({})}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer border-none bg-transparent"
                  >
                    Deseleccionar Todos
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {clientesSaas.filter(c => !c.archived).map(client => (
                  <label 
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-solid border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer"
                  >
                    <input 
                      type="checkbox"
                      checked={!!globalTelemetryCheckedClients[client.id]}
                      onChange={(e) => {
                        setGlobalTelemetryCheckedClients(prev => ({ ...prev, [client.id]: e.target.checked }));
                      }}
                      className="w-4 h-4 rounded accent-indigo-600 bg-slate-950 border border-slate-800 focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-200">{client.id}</span>
                      <span className="block text-[9px] text-slate-450 font-medium">Nicho: {client.niche || 'N/A'} • Control de Telemetría</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-solid border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGlobalTelemetryModalOpen(false)}
                className="px-4 py-2 border border-solid border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteGlobalTelemetry}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-indigo-955/25 flex items-center gap-1.5 border-none"
              >
                Solicitar Reporte ({Object.values(globalTelemetryCheckedClients).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Git Diff Plano */}
      {gitDiffModal.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-solid border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[75vh]">
            <div className="p-4 bg-slate-950 border-b border-solid border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCommit size={16} className="text-indigo-400" />
                <h4 className="font-mono text-xs font-bold text-slate-200">
                  Git Diff: {gitDiffModal.file} ({gitDiffModal.clientId})
                </h4>
              </div>
              <button 
                onClick={() => setGitDiffModal({ open: false, clientId: '', file: '', diff: '' })}
                className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-mono text-[10px] text-slate-350 leading-normal scrollbar-thin select-text text-left whitespace-pre-wrap">
              {gitDiffLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <RefreshCw size={20} className="animate-spin text-indigo-500" />
                  <span>Obteniendo diferencias Git...</span>
                </div>
              ) : gitDiffModal.diff ? (
                gitDiffModal.diff.split('\n').map((line, idx) => {
                  const isAdded = line.startsWith('+') && !line.startsWith('+++');
                  const isRemoved = line.startsWith('-') && !line.startsWith('---');
                  const isHeader = line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@');
                  
                  let colorClass = 'text-slate-400';
                  if (isAdded) colorClass = 'text-emerald-400 bg-emerald-950/20 font-semibold';
                  else if (isRemoved) colorClass = 'text-red-400 bg-red-950/20 font-semibold';
                  else if (isHeader) colorClass = 'text-indigo-400 font-bold';

                  return (
                    <div key={idx} className={`px-2 py-0.5 rounded ${colorClass}`}>
                      {line}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No hay cambios detectados respecto a HEAD.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-solid border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleGitDiscard(gitDiffModal.clientId, gitDiffModal.file);
                  setGitDiffModal({ open: false, clientId: '', file: '', diff: '' });
                }}
                className="px-3 py-1.5 bg-red-650 hover:bg-red-500 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 active:scale-95 border-none"
              >
                <RotateCcw size={11} />
                Descartar Cambios
              </button>
              <button
                onClick={() => setGitDiffModal({ open: false, clientId: '', file: '', diff: '' })}
                className="px-4 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-[11px] font-bold rounded-xl cursor-pointer transition-all border border-solid border-slate-850"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Diff de Reglas Firebase */}
      {activeRulesDiff && (
        <Portal>
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in p-4">
            <div className="w-full max-w-5xl bg-slate-900 border border-solid border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
              <div className="p-4 bg-slate-950 border-b border-solid border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-indigo-400" />
                  <h4 className="font-mono text-xs font-bold text-slate-200">
                    Comparador de Reglas: {activeRulesDiff.title}
                  </h4>
                </div>
                <button 
                  onClick={() => setActiveRulesDiff(null)}
                  className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer bg-transparent border-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4 p-5 overflow-hidden bg-slate-950">
                {/* Columna Local Core */}
                <div className="flex flex-col h-full border border-solid border-slate-800/60 rounded-xl overflow-hidden">
                  <div className="bg-slate-900 px-3 py-1.5 border-b border-solid border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-350">
                    <span>Regla Local (Core de Referencia)</span>
                  </div>
                  <pre className="flex-1 p-4 overflow-y-auto font-mono text-[10px] text-slate-355 bg-slate-950/40 text-left select-text scrollbar-thin whitespace-pre-wrap">
                    {activeRulesDiff.local || '// No hay regla local definida'}
                  </pre>
                </div>

                {/* Columna Nube Cliente */}
                <div className="flex flex-col h-full border border-solid border-slate-800/60 rounded-xl overflow-hidden">
                  <div className="bg-slate-900 px-3 py-1.5 border-b border-solid border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-350">
                    <span>Regla Activa en la Nube (Firebase Console)</span>
                  </div>
                  <pre className="flex-1 p-4 overflow-y-auto font-mono text-[10px] text-slate-355 bg-slate-950/40 text-left select-text scrollbar-thin whitespace-pre-wrap">
                    {activeRulesDiff.cloud || '// No hay regla desplegada en la nube'}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border-t border-solid border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveRulesDiff(null)}
                  className="px-5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-[11px] font-bold rounded-xl cursor-pointer transition-all border border-solid border-slate-850"
                >
                  Cerrar Comparador
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal Diff de Código Core */}
      {activeDiffFile && (
        <Portal>
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in p-4">
            <div className="w-full max-w-5xl bg-slate-900 border border-solid border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
              <div className="p-4 bg-slate-950 border-b border-solid border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-indigo-400" />
                  <h4 className="font-mono text-xs font-bold text-slate-200">
                    Diferencias: {activeDiffFile.file} (Nube vs Local Core)
                  </h4>
                </div>
                <button 
                  onClick={() => setActiveDiffFile(null)}
                  className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer bg-transparent border-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-mono text-[10px] text-slate-355 leading-normal scrollbar-thin select-text text-left whitespace-pre-wrap">
                {activeDiffFile.diff ? (
                  activeDiffFile.diff.split('\n').map((line, idx) => {
                    const isAdded = line.startsWith('+') && !line.startsWith('+++');
                    const isRemoved = line.startsWith('-') && !line.startsWith('---');
                    const isHeader = line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@');
                    
                    let colorClass = 'text-slate-400';
                    if (isAdded) colorClass = 'text-emerald-400 bg-emerald-950/20 font-semibold';
                    else if (isRemoved) colorClass = 'text-red-400 bg-red-950/20 font-semibold';
                    else if (isHeader) colorClass = 'text-indigo-400 font-bold';

                    return (
                      <div key={idx} className={`px-2 py-0.5 rounded ${colorClass}`}>
                        {line}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No hay diferencias físicas detectadas.
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900 border-t border-solid border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    handleSyncFile(selectedCrmClientId, activeDiffFile.file);
                    setActiveDiffFile(null);
                  }}
                  className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 active:scale-95 border-none"
                >
                  <RefreshCw size={11} />
                  Sincronizar Archivo
                </button>
                <button
                  onClick={() => setActiveDiffFile(null)}
                  className="px-4 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-[11px] font-bold rounded-xl cursor-pointer transition-all border border-solid border-slate-850"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Toast de Notificaciones */}
      <GuidedToast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        actionText={toast.actionText}
        onActionClick={toast.onActionClick}
      />
    </div>
  );
}
