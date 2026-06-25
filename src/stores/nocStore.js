import { create } from 'zustand';
import { db } from '../services/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { crmService } from '../services/crmService';

let unsubMetrics = null;
let unsubHeartbeats = null;
let unsubVersions = null;
let unsubAlerts = null;
let simInterval = null;

export const useNocStore = create((set, get) => ({
  metrics: [],
  heartbeats: [],
  versions: [],
  alerts: [],
  isLoading: true,

  subscribeNoc: () => {
    get().unsubscribeNoc();
    set({ isLoading: true });

    const isGlobalSimulated = localStorage.getItem('db_simulated') === 'true';

    if (isGlobalSimulated) {
      get().initializeSandboxNoc();
      return;
    }

    try {
      // 1. Suscribirse a Métricas
      const qMetrics = query(collection(db, 'app_metrics'), orderBy('timestamp', 'desc'));
      unsubMetrics = onSnapshot(qMetrics, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ metrics: list });
      });

      // 2. Suscribirse a Heartbeats
      const qHeartbeats = query(collection(db, 'app_heartbeats'), orderBy('timestamp', 'desc'));
      unsubHeartbeats = onSnapshot(qHeartbeats, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ heartbeats: list });
      });

      // 3. Suscribirse a Versiones
      const qVersions = query(collection(db, 'app_versions'), orderBy('releaseDate', 'desc'));
      unsubVersions = onSnapshot(qVersions, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ versions: list });
      });

      // 4. Suscribirse a Alertas de Sistema
      const qAlerts = query(collection(db, 'system_alerts'), orderBy('createdAt', 'desc'));
      unsubAlerts = onSnapshot(qAlerts, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ alerts: list, isLoading: false });
      });

    } catch (err) {
      console.error('Error starting NOC listeners, loading Sandbox fallback:', err);
      get().initializeSandboxNoc();
    }
  },

  unsubscribeNoc: () => {
    if (unsubMetrics) { unsubMetrics(); unsubMetrics = null; }
    if (unsubHeartbeats) { unsubHeartbeats(); unsubHeartbeats = null; }
    if (unsubVersions) { unsubVersions(); unsubVersions = null; }
    if (unsubAlerts) { unsubAlerts(); unsubAlerts = null; }
    if (simInterval) { clearInterval(simInterval); simInterval = null; }
  },

  // inicializar Sandbox / Mocks del NOC
  initializeSandboxNoc: () => {
    console.log('🎮 [NOC Store] Inicializando Sandbox...');
    
    // Releases iniciales de versiones
    const initialVersions = [
      { id: 'v1.0.0', version: '1.0.0', stable: true, description: 'Versión inicial estable de PROTOTIPE Core.', releaseDate: '2026-05-15' },
      { id: 'v1.0.1', version: '1.0.1', stable: true, description: 'Corrección de vulnerabilidades de Stacking Context y auto-purgado.', releaseDate: '2026-06-10' },
      { id: 'v1.1.0', version: '1.1.0', stable: false, description: 'Pre-release: Integración de alertas de sharding y PWA hooks.', releaseDate: '2026-06-22' }
    ];

    // Alertas de sistema iniciales
    const initialAlerts = [
      { id: 'al-1', clientId: 'boutique-bella', type: 'latency', severity: 'warning', message: 'Latencia inusual detectada en Boutique Bella (152ms)', active: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'al-2', clientId: 'smartfix', type: 'error_count', severity: 'critical', message: 'SmartFix reporta más de 5 errores no resueltos', active: true, createdAt: new Date(Date.now() - 1800000).toISOString() }
    ];

    // Métricas iniciales
    const initialMetrics = [
      { id: 'm-1', clientId: 'smartfix', timestamp: new Date().toISOString(), cpu: 22, memory: 58, latency: 25, online: true },
      { id: 'm-2', clientId: 'boutique-bella', timestamp: new Date().toISOString(), cpu: 14, memory: 44, latency: 124, online: true }
    ];

    const initialHeartbeats = [
      { id: 'hb-1', clientId: 'smartfix', timestamp: new Date().toISOString(), online: true, latency: 25 },
      { id: 'hb-2', clientId: 'boutique-bella', timestamp: new Date().toISOString(), online: true, latency: 124 }
    ];

    set({
      versions: initialVersions,
      alerts: initialAlerts,
      metrics: initialMetrics,
      heartbeats: initialHeartbeats,
      isLoading: false
    });

    // Bucle de simulación en segundo plano para Sandbox
    simInterval = setInterval(() => {
      console.log('⚡ [NOC Store] Actualizando telemetría Sandbox...');
      
      const currentMetrics = get().metrics;
      const currentAlerts = [...get().alerts];
      const currentHeartbeats = get().heartbeats;

      // 1. Generar nuevas métricas y heartbeats
      const updatedMetrics = currentMetrics.map(m => {
        // Fluctuación aleatoria de recursos
        const cpu = Math.max(5, Math.min(95, m.cpu + Math.floor(Math.random() * 21) - 10));
        const memory = Math.max(30, Math.min(120, m.memory + Math.floor(Math.random() * 11) - 5));
        
        // Simular pico de latencia o desconexión ocasional
        const isOffline = Math.random() < 0.05 ? false : m.online;
        const latency = isOffline ? 999 : Math.max(5, Math.min(180, m.latency + Math.floor(Math.random() * 31) - 15));

        // Registrar alertas por picos de latencia o CPU
        if (latency > 150 && !currentAlerts.some(a => a.clientId === m.clientId && a.type === 'latency' && a.active)) {
          const newAlert = {
            id: `alert-lat-${Date.now()}`,
            clientId: m.clientId,
            type: 'latency',
            severity: 'warning',
            message: `Latencia crítica detectada en ${m.clientId} (${latency}ms).`,
            active: true,
            createdAt: new Date().toISOString()
          };
          currentAlerts.unshift(newAlert);
          
          // Escribir en log
          crmService.logActivity({
            userId: 'system',
            userName: 'Sistema',
            action: 'ALERT_CREATED',
            entityType: 'alert',
            entityId: newAlert.id,
            details: newAlert.message
          }).catch(() => {});
        }

        return {
          ...m,
          timestamp: new Date().toISOString(),
          cpu,
          memory,
          latency,
          online: isOffline
        };
      });

      const updatedHeartbeats = currentHeartbeats.map(hb => {
        const metric = updatedMetrics.find(m => m.clientId === hb.clientId);
        return {
          ...hb,
          timestamp: new Date().toISOString(),
          online: metric ? metric.online : hb.online,
          latency: metric ? metric.latency : hb.latency
        };
      });

      // 2. Auto-resolución de alertas latencia si baja de 80ms
      const finalAlerts = currentAlerts.map(alert => {
        if (alert.active && alert.type === 'latency') {
          const clientMetric = updatedMetrics.find(m => m.clientId === alert.clientId);
          if (clientMetric && clientMetric.latency < 80) {
            
            crmService.logActivity({
              userId: 'system',
              userName: 'Sistema',
              action: 'ALERT_RESOLVED',
              entityType: 'alert',
              entityId: alert.id,
              details: `Alerta de latencia resuelta automáticamente para ${alert.clientId}`
            }).catch(() => {});

            return {
              ...alert,
              active: false,
              resolvedAt: new Date().toISOString()
            };
          }
        }
        return alert;
      });

      set({
        metrics: updatedMetrics,
        heartbeats: updatedHeartbeats,
        alerts: finalAlerts
      });
    }, 6000); // Ejecutar cada 6 segundos en sandbox
  },

  // Crear Alerta de Sistema
  createSystemAlert: async (clientId, type, severity, message, user) => {
    const isGlobalSimulated = localStorage.getItem('db_simulated') === 'true';
    const alertId = `alert-${Date.now()}`;
    const newAlert = {
      clientId,
      type,
      severity,
      message,
      active: true,
      createdAt: isGlobalSimulated ? new Date().toISOString() : serverTimestamp()
    };

    if (isGlobalSimulated) {
      set(state => ({ alerts: [{ id: alertId, ...newAlert }, ...state.alerts] }));
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'ALERT_CREATED',
        entityType: 'alert',
        entityId: alertId,
        details: message
      });
      return { success: true };
    }

    try {
      const docRef = await addDoc(collection(db, 'system_alerts'), newAlert);
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'ALERT_CREATED',
        entityType: 'alert',
        entityId: docRef.id,
        details: message
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  // Resolver Alerta de Sistema
  resolveSystemAlert: async (alertId, user) => {
    const isGlobalSimulated = localStorage.getItem('db_simulated') === 'true';

    if (isGlobalSimulated) {
      set(state => ({
        alerts: state.alerts.map(a => a.id === alertId ? { ...a, active: false, resolvedAt: new Date().toISOString() } : a)
      }));
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'ALERT_RESOLVED',
        entityType: 'alert',
        entityId: alertId,
        details: `Alerta resuelta manualmente por operador.`
      });
      return { success: true };
    }

    try {
      const alertRef = doc(db, 'system_alerts', alertId);
      await updateDoc(alertRef, {
        active: false,
        resolvedAt: serverTimestamp()
      });
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'ALERT_RESOLVED',
        entityType: 'alert',
        entityId: alertId,
        details: `Alerta resuelta manualmente por el desarrollador.`
      });
      return { success: true };
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  },

  // Publicar versión estable del Core
  publishCoreRelease: async (version, description, user) => {
    const isGlobalSimulated = localStorage.getItem('db_simulated') === 'true';
    const releaseId = `rel-${Date.now()}`;
    const newVersion = {
      version,
      stable: true,
      description,
      releaseDate: new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    };

    if (isGlobalSimulated) {
      set(state => ({
        versions: state.versions.map(v => v.stable ? { ...v, stable: false } : v).concat({ id: releaseId, ...newVersion })
      }));
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'VERSION_UPDATED',
        entityType: 'version',
        entityId: releaseId,
        details: `Nueva versión del Core lanzada: v${version}.`
      });
      return { success: true };
    }

    try {
      // 1. Escribir nueva versión
      const docRef = await addDoc(collection(db, 'app_versions'), newVersion);
      
      // 2. Registrar auditoría
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'VERSION_UPDATED',
        entityType: 'version',
        entityId: docRef.id,
        details: `Nueva versión del Core publicada: v${version}.`
      });
      return { success: true };
    } catch (error) {
      console.error('Error publishing release:', error);
      throw error;
    }
  }
}));
