import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  HeartPulse, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Globe, 
  Search,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';
import { doc, setDoc, getDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { createPortal } from 'react-dom';
import { CLI_URL } from '../../config';

const PAGE_SIZE = 15;

export default function HealthMonitorView({ dbInstance, showToast }) {
  const [clientes, setClientes] = useState([]);
  const [healthData, setHealthData] = useState({});
  const [checking, setChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    return localStorage.getItem('health_monitor_auto_refresh') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('health_monitor_auto_refresh', autoRefresh);
  }, [autoRefresh]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de configuración de alertas omnicanal
  const [config, setConfig] = useState({
    telegramToken: '',
    telegramChatId: '',
    discordWebhookUrl: '',
    alertsEnabled: false
  });

  // Escuchar configuración de alertas en tiempo real
  useEffect(() => {
    if (!dbInstance) return;
    const docRef = doc(dbInstance, 'configuracion_sistema', 'monitoreo');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const cfg = {
          telegramToken: data.telegramToken || '',
          telegramChatId: data.telegramChatId || '',
          discordWebhookUrl: data.discordWebhookUrl || '',
          alertsEnabled: !!data.alertsEnabled
        };
        setConfig(cfg);
        
        // Sincronizar configuración con el CLI local para que lo tenga en caché
        fetch(`${CLI_URL}/api/project/notify/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cfg)
        }).catch((e) => console.warn("No se pudo sincronizar config con CLI local:", e.message));
      }
    }, (err) => {
      console.warn("Error al escuchar configuracion de monitoreo:", err);
    });
    return () => unsubscribe();
  }, [dbInstance]);

  // Función de despacho de alertas (Telegram y Discord)
  const dispatchAlert = async (type, clientName, clientUrl, details, currentConfig) => {
    const { telegramToken, telegramChatId, discordWebhookUrl, alertsEnabled } = currentConfig;
    if (!alertsEnabled) return;

    // Telegram: formato HTML
    let tgMessage = '';
    if (type === 'down') {
      tgMessage = `🔴 <b>SaaS Down:</b> ${clientName} (${clientUrl}) está caído.\n\n<b>Detalles:</b> ${details}`;
    } else if (type === 'up') {
      tgMessage = `🟢 <b>SaaS Up:</b> ${clientName} (${clientUrl}) se ha recuperado.\n\n<b>Detalles:</b> ${details}`;
    } else if (type === 'test') {
      tgMessage = `🔔 <b>Alerta de Prueba:</b> El sistema de notificaciones de Central PROTOTIPE está activo.`;
    }

    // Discord: formato Markdown
    let dsMessage = '';
    if (type === 'down') {
      dsMessage = `🔴 **SaaS Down:** **${clientName}** (${clientUrl}) está caído.\n\n**Detalles:** ${details}`;
    } else if (type === 'up') {
      dsMessage = `🟢 **SaaS Up:** **${clientName}** (${clientUrl}) se ha recuperado.\n\n**Detalles:** ${details}`;
    } else if (type === 'test') {
      dsMessage = `🔔 **Alerta de Prueba:** El sistema de notificaciones de Central PROTOTIPE está activo.`;
    }

    const promises = [];

    // Telegram Dispatch
    if (telegramToken && telegramChatId) {
      const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
      promises.push(
        fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: tgMessage,
            parse_mode: 'HTML'
          })
        }).then(async r => {
          if (!r.ok) {
            const errData = await r.json();
            throw new Error(errData.description || 'Error de API Telegram');
          }
        })
      );
    }

    // Discord Dispatch
    if (discordWebhookUrl) {
      promises.push(
        fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: dsMessage
          })
        }).then(async r => {
          if (!r.ok) {
            throw new Error(`Error de API Discord Status: ${r.status}`);
          }
        })
      );
    }

    await Promise.all(promises);
  };

  const handleTestAlert = async (testConfig) => {
    setTestingAlert(true);
    try {
      const response = await fetch(`${CLI_URL}/api/project/notify/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testConfig)
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsed;
        try { parsed = JSON.parse(errText); } catch (_) {}
        throw new Error(parsed?.error || errText);
      }

      showToast('Alerta de prueba enviada exitosamente ✓', { type: 'success' });
    } catch (err) {
      showToast(`Fallo al enviar alerta de prueba: ${err.message}`, { type: 'error' });
    } finally {
      setTestingAlert(false);
    }
  };

  // Escuchar la lista de clientes
  useEffect(() => {
    if (!dbInstance) return;
    const q = collection(dbInstance, 'clientes_control');
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const url = data.url
          || data.appUrl
          || (data.firebaseConfig?.projectId ? `https://${data.firebaseConfig.projectId}.web.app` : null)
          || `https://${docSnap.id}.web.app`;
        const nombre = data.nombre || data.name || docSnap.id;
        list.push({ id: docSnap.id, nombre, url, projectId: data.firebaseConfig?.projectId || data.projectId || docSnap.id });
      });
      setClientes(list);
    });
    return () => unsubscribe();
  }, [dbInstance]);

  // Cargar estados guardados de Firestore
  useEffect(() => {
    if (!dbInstance || clientes.length === 0) return;
    clientes.forEach(async (c) => {
      try {
        const docRef = doc(dbInstance, 'health_checks', c.id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setHealthData(prev => ({ ...prev, [c.id]: snap.data() }));
        }
      } catch (err) {
        console.warn(`Error al recuperar estado de salud para ${c.id}`);
      }
    });
  }, [dbInstance, clientes]);

  const checkAllRef = useRef(null);
  useEffect(() => {
    checkAllRef.current = handleCheckAll;
  });

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    
    // Ejecutar inmediatamente al activar
    checkAllRef.current?.();

    const interval = setInterval(() => {
      checkAllRef.current?.();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filtrado + paginación derivados
  const filteredClientes = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return clientes;
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.url.toLowerCase().includes(q)
    );
  }, [clientes, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredClientes.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageClientes = filteredClientes.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Resetear página al buscar
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleCheckSingle = async (clientId, url) => {
    try {
      const res = await fetch(`${CLI_URL}/api/health/${clientId}?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const prevStatus = healthData[clientId]?.status;
      const newStatus = data.status;
      let alertType = null;
      let alertDetails = '';
      if (newStatus === 'red' && prevStatus !== 'red' && prevStatus !== undefined) {
        alertType = 'down';
        alertDetails = `HTTP Status: ${data.httpStatus || 'N/A'}. Latencia: ${data.responseTimeMs}ms.`;
      } else if (newStatus === 'green' && prevStatus === 'red') {
        alertType = 'up';
        alertDetails = `Latencia actual: ${data.responseTimeMs}ms.`;
      }

      const currentHistory = healthData[clientId]?.history || [];
      const now = new Date().toISOString();
      const newEntry = { responseTimeMs: data.responseTimeMs, timestamp: now };
      const updatedHistory = [newEntry, ...currentHistory].slice(0, 10);
      const fullData = { ...data, history: updatedHistory, lastCheck: now };

      setHealthData(prev => ({ ...prev, [clientId]: fullData }));

      if (dbInstance) {
        const docRef = doc(dbInstance, 'health_checks', clientId);
        await setDoc(docRef, { ...fullData, actualizadoEn: serverTimestamp() });
      }
      showToast(`Estado verificado para ${clientId} ✓`, { type: 'success' });

      // Despachar alerta fuera de los actualizadores de estado de React
      if (alertType) {
        const clientInfo = clientes.find(c => c.id === clientId);
        const clientName = clientInfo ? clientInfo.nombre : clientId;
        dispatchAlert(alertType, clientName, url, alertDetails, config).catch(err => {
          console.error(`Error al notificar alerta para ${clientId}:`, err);
        });
      }
    } catch (err) {
      showToast(`Fallo en check de ${clientId}: ${err.message}`, { type: 'error' });
    }
  };

  const handleCheckAll = async () => {
    if (clientes.length === 0) return;
    setChecking(true);
    const clientsQuery = clientes.map(c => `${c.id},${c.url}`).join(';');
    try {
      const res = await fetch(`${CLI_URL}/api/health/check?clients=${encodeURIComponent(clientsQuery)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const alertsToSend = [];
      const updatedHealth = { ...healthData };
      const now = new Date().toISOString();

      for (const clientResult of data) {
        const cId = clientResult.id;
        const prevStatus = healthData[cId]?.status;
        const newStatus = clientResult.status;

        let alertType = null;
        let alertDetails = '';

        if (newStatus === 'red' && prevStatus !== 'red' && prevStatus !== undefined) {
          alertType = 'down';
          alertDetails = `HTTP Status: ${clientResult.httpStatus || 'N/A'}. Latencia: ${clientResult.responseTimeMs}ms.`;
        } else if (newStatus === 'green' && prevStatus === 'red') {
          alertType = 'up';
          alertDetails = `Latencia actual: ${clientResult.responseTimeMs}ms.`;
        }

        if (alertType) {
          const clientInfo = clientes.find(c => c.id === cId);
          if (clientInfo) {
            alertsToSend.push({ type: alertType, name: clientInfo.nombre, url: clientInfo.url, details: alertDetails });
          }
        }

        const currentHistory = healthData[cId]?.history || [];
        const newEntry = { responseTimeMs: clientResult.responseTimeMs, timestamp: now };
        const updatedHistory = [newEntry, ...currentHistory].slice(0, 10);
        const fullData = { ...clientResult, history: updatedHistory, lastCheck: now };
        updatedHealth[cId] = fullData;

        if (dbInstance) {
          const docRef = doc(dbInstance, 'health_checks', cId);
          setDoc(docRef, { ...fullData, actualizadoEn: serverTimestamp() }).catch(err => {
            console.warn(`Error guardando check de salud en DB para ${cId}:`, err);
          });
        }
      }

      setHealthData(updatedHealth);
      showToast('Monitoreo general de salud completado ✓', { type: 'success' });

      // Despachar alertas fuera del ciclo de renderizado
      if (alertsToSend.length > 0) {
        alertsToSend.forEach(alertItem => {
          dispatchAlert(alertItem.type, alertItem.name, alertItem.url, alertItem.details, config).catch(err => {
            console.error(`Error enviando notificacion para ${alertItem.name}:`, err);
          });
        });
      }
    } catch (err) {
      showToast(`Error de conexión con Bridge CLI: ${err.message}`, { type: 'error' });
    } finally {
      setChecking(false);
    }
  };  const greenCount = clientes.filter(c => healthData[c.id]?.status === 'green').length;
  const redCount   = clientes.filter(c => healthData[c.id] && healthData[c.id].status !== 'green' && healthData[c.id].status !== 'yellow').length;
  const yellowCount= clientes.filter(c => healthData[c.id]?.status === 'yellow').length;

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden text-[var(--color-text)] shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <HeartPulse className="text-rose-500 w-6 h-6 animate-pulse" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">Health Monitor</h2>
            <span className="text-[10px] text-[var(--color-text-muted)] block font-semibold mt-0.5">
              Semáforo de Disponibilidad, Tiempos de Respuesta y PWA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sumario rápido */}
          {clientes.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{greenCount} OK</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{yellowCount} Lento</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />{redCount} Caído</span>
            </div>
          )}

          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1.5 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)]">Auto-refresh (30 min)</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-8 h-4.5 rounded-full p-0.5 transition-all ${autoRefresh ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all ${autoRefresh ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </button>
          </div>

          <button
            onClick={handleCheckAll}
            disabled={checking}
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-2 text-white transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
            Verificar Todo
          </button>
        </div>
      </div>

      {/* ── Barra de búsqueda + contador ── */}
      <div className="px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/10 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar cliente, ID o URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2 text-xs focus:border-indigo-500 outline-none text-[var(--color-text)] transition-all placeholder:text-slate-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[var(--color-text)] transition-colors text-[10px] font-bold"
            >✕</button>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-semibold shrink-0">
          {filteredClientes.length} de {clientes.length} instancias
          {totalPages > 1 && ` · Página ${safePage} / ${totalPages}`}
        </span>
      </div>

      {/* ── Grid de Instancias ── */}
      <div className="flex-1 p-6 overflow-y-auto">
        {clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Globe className="text-slate-600 w-12 h-12" />
            <span className="text-xs text-slate-500 font-semibold italic">No se detectaron instancias registradas en el CRM para monitorear.</span>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Search className="text-slate-600 w-10 h-10" />
            <span className="text-xs text-slate-500 font-semibold italic">Sin resultados para "{searchTerm}"</span>
            <button onClick={() => setSearchTerm('')} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2">Limpiar búsqueda</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {pageClientes.map(c => {
              const statusData = healthData[c.id];
              const isChecked = !!statusData;
              const isGreen  = statusData?.status === 'green';
              const isYellow = statusData?.status === 'yellow';

              return (
                <div
                  key={c.id}
                  className={`bg-[var(--color-surface-2)]/40 border p-5 rounded-2xl flex flex-col justify-between transition-all
                    ${isChecked
                      ? isGreen  ? 'border-emerald-500/20 hover:border-emerald-500/40'
                      : isYellow ? 'border-amber-500/20 hover:border-amber-500/40'
                      :            'border-rose-500/20 hover:border-rose-500/40'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border)]'
                    }`}
                >
                  <div className="space-y-4">
                    {/* Instancia Info */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest block">Cliente</span>
                        <h4 className="text-xs font-black text-[var(--color-text)] truncate">{c.nombre}</h4>
                        <span className="text-[9px] text-slate-500 block font-semibold truncate">{c.url}</span>
                      </div>

                      {/* Semáforo Badge */}
                      {isChecked ? (
                        <div className="flex items-center gap-1 shrink-0">
                          {isGreen  && <CheckCircle size={14} className="text-emerald-400" />}
                          {isYellow && <AlertTriangle size={14} className="text-amber-400" />}
                          {!isGreen && !isYellow && <XCircle size={14} className="text-rose-500" />}
                          <span className={`text-[9px] font-black uppercase ${isGreen ? 'text-emerald-400' : isYellow ? 'text-amber-400' : 'text-rose-500'}`}>
                            {statusData.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-600 bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5 rounded-lg uppercase tracking-wider shrink-0">
                          Sin Verificar
                        </span>
                      )}
                    </div>

                    {/* Métricas */}
                    {isChecked && (
                      <div className="grid grid-cols-3 gap-2 bg-[var(--color-bg)]/40 border border-[var(--color-border)]/60 p-2.5 rounded-xl text-center text-[10px]">
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase font-bold">HTTP Status</span>
                          <span className={`font-black mt-0.5 block ${isGreen ? 'text-emerald-400' : isYellow ? 'text-amber-400' : 'text-rose-500'}`}>
                            {statusData.httpStatus}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase font-bold">Tiempo</span>
                          <span className="font-black text-[var(--color-text)] mt-0.5 block">{statusData.responseTimeMs} ms</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase font-bold">PWA</span>
                          <span className={`font-black mt-0.5 block ${statusData.hasPwa ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {statusData.hasPwa ? 'Sí' : 'No'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Historial gráfico micro */}
                    {isChecked && statusData.history?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">Tiempos Históricos (ms)</span>
                        <div className="flex gap-1.5 items-end h-8 bg-[var(--color-surface)]/20 p-1.5 rounded-xl border border-[var(--color-border)]/50">
                           {statusData.history.map((item, idx) => {
                             const timeVal = typeof item === 'object' && item !== null ? item.responseTimeMs : item;
                             const timestampVal = typeof item === 'object' && item !== null ? item.timestamp : null;
                             const heightPercent = Math.min((timeVal / 2500) * 100, 100);
                             const formattedTime = timestampVal 
                               ? new Date(timestampVal).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) 
                               : '';
                             const tooltipText = `${timeVal} ms${formattedTime ? ` · ${formattedTime}` : ''}`;

                             return (
                               <div key={idx} className="relative group flex-1 h-full flex items-end cursor-pointer">
                                 <div
                                   className="w-full rounded-sm min-h-[2px] transition-all group-hover:opacity-80"
                                   style={{
                                     height: `${heightPercent}%`,
                                     backgroundColor: timeVal < 1500 ? '#34d399' : timeVal < 3000 ? '#fbbf24' : '#f87171'
                                   }}
                                 />
                                 {/* Custom Premium Tooltip */}
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                                   <div className="bg-slate-900 border border-slate-700/80 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-xl whitespace-nowrap">
                                     {tooltipText}
                                   </div>
                                   <div className="w-1 h-1 bg-slate-900 border-r border-b border-slate-700/80 rotate-45 -mt-0.5" />
                                 </div>
                               </div>
                             );
                           })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Check */}
                  <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-3 mt-4">
                    <span className="text-[8px] text-slate-500 font-bold flex items-center gap-1">
                      <Clock size={10} />
                      {statusData?.lastCheck ? new Date(statusData.lastCheck).toLocaleTimeString('es-CO') : 'Sin check'}
                    </span>
                    <button
                      onClick={() => handleCheckSingle(c.id, c.url)}
                      className="px-2.5 py-1 bg-[var(--color-surface)] hover:bg-slate-800 border border-[var(--color-border)] rounded-lg text-[9px] font-black cursor-pointer text-[var(--color-text)] transition-all active:scale-95"
                    >
                      Re-verificar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="border-t border-[var(--color-border)] px-6 py-3 flex items-center justify-between bg-[var(--color-surface)]">
          <span className="text-[10px] text-slate-500 font-semibold">
            Mostrando {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredClientes.length)} de {filteredClientes.length} instancias
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/40 hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-[var(--color-text)]"
            >
              <ChevronLeft size={13} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer
                  ${page === safePage
                    ? 'bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/20'
                    : 'border border-[var(--color-border)] bg-[var(--color-bg)]/40 hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/40 hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-[var(--color-text)]"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
