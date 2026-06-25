import { create } from 'zustand';
import { db, auth } from '../services/firebase';
import { 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { calculateClientHealth } from '../utils/crmHelpers';

// MOCK DATA PARA PORTAL DE CLIENTES EN MODO SIMULADO
const MOCK_CLIENT_CONTROL = {
  id: 'smartfix',
  nombre: 'SmartFix',
  estado: 'Activo',
  contacto: { nombre: 'Sergio Herrera', telefono: '+5215551234', correo: 'sergio@smartfix.com' },
  comercial: { fechaInicio: '2026-06-01', modeloMonetizacion: 'percentage', setupValor: 1200000, mensualidadValor: 350000, comisionPorcentaje: 1.5 },
  tecnico: { projectId: 'smartfix', versionCore: '1.2.4', urlHosting: 'https://smartfix.prototipe.io' }
};

const MOCK_PROJECT = {
  clienteId: 'smartfix',
  status: 'development', // planning, development, testing, validation, production
  createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
};

const MOCK_PROVISIONING = {
  clientId: 'smartfix',
  status: 'pending',
  approved: false,
  createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
};

const MOCK_FOLLOWUPS = [
  { id: 'f1', clientId: 'smartfix', date: new Date(Date.now() - 4 * 86400000).toISOString(), type: 'llamada', description: 'Revisión técnica de paridad de base de datos. Todo en orden.', agent: 'Comercial Central', alerts: [] },
  { id: 'f2', clientId: 'smartfix', date: new Date(Date.now() - 1 * 86400000).toISOString(), type: 'whatsapp', description: 'Contacto comisionista mensual pendiente. Envío de reportes.', agent: 'Comercial Central', alerts: [] }
];

const MOCK_FAILURES = [
  { id: 'fail-1', clientId: 'smartfix', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), errorName: 'ReferenceError', errorMessage: 'x is not defined', resolved: false }
];

const MOCK_BILLING = [
  { id: 'bill-1', clientId: 'smartfix', date: '2026-06-15', totalVentas: 15000000, comisionValor: 225000, mensualidadValor: 350000, totalCobrado: 575000, status: 'paid', token: 'mock-token' },
  { id: 'bill-2', clientId: 'smartfix', date: '2026-07-15', totalVentas: 0, comisionValor: 0, mensualidadValor: 350000, totalCobrado: 350000, status: 'pending', token: 'mock-token' }
];

const MOCK_LOGS = [
  { id: 'log-1', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), userName: 'Sistema', action: 'CLIENT_CREATED', details: 'Cliente SmartFix creado en clientes_control' },
  { id: 'log-2', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), userName: 'Sistema', action: 'PROJECT_CREATED', details: 'Proyecto de implementación iniciado para smartfix' }
];

// Variables globales para los callbacks de desuscripción de Firestore
let unsubClient = null;
let unsubProject = null;
let unsubProv = null;
let unsubFollows = null;
let unsubFailures = null;
let unsubBilling = null;
let unsubLogs = null;
let sessionCheckTimer = null;

export const useClientPortalStore = create((set, get) => ({
  // Sesión y credenciales
  clientId: localStorage.getItem('client_portal_clientId') || null,
  token: localStorage.getItem('client_portal_token') || null,
  isAuthenticated: false,
  isSimulated: false,
  loading: false,
  error: null,

  // Datos del negocio del cliente
  clientData: null,
  project: null,
  provisioningOrder: null,
  followups: [],
  failures: [],
  billingReports: [],
  activityLogs: [],

  // Salud del Cliente (Calculada reactivamente)
  healthScore: 100,

  initializePortal: () => {
    const savedClientId = localStorage.getItem('client_portal_clientId');
    const savedToken = localStorage.getItem('client_portal_token');
    const savedSimulated = localStorage.getItem('client_portal_simulated') === 'true';

    if (savedClientId && savedToken) {
      set({ 
        clientId: savedClientId, 
        token: savedToken, 
        isSimulated: savedSimulated,
        isAuthenticated: true 
      });

      if (savedSimulated) {
        get().loadMockPortalData();
      } else {
        // Escuchar el estado de autenticación y suscribirse
        onAuthStateChanged(auth, (user) => {
          if (user) {
            get().subscribeClientData();
            get().startSessionMonitoring();
          } else {
            get().logout();
          }
        });
      }
    }
  },

  login: async (clientId, token, forceSimulated = false) => {
    set({ loading: true, error: null });

    const cleanClientId = clientId.trim().toLowerCase();
    const cleanToken = token.trim();

    if (forceSimulated || localStorage.getItem('db_simulated') === 'true') {
      // Validar mock
      if (cleanClientId === 'smartfix' && cleanToken === 'token-123') {
        localStorage.setItem('client_portal_clientId', cleanClientId);
        localStorage.setItem('client_portal_token', cleanToken);
        localStorage.setItem('client_portal_simulated', 'true');

        set({ 
          clientId: cleanClientId, 
          token: cleanToken, 
          isSimulated: true, 
          isAuthenticated: true, 
          loading: false 
        });
        get().loadMockPortalData();
        return true;
      } else {
        set({ error: 'Credenciales inválidas en modo simulado (Intente: smartfix / token-123)', loading: false });
        return false;
      }
    }

    try {
      // 1. Iniciar sesión anónima en Firebase Auth
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // 2. Intentar registrar la sesión en Firestore
      // Se resta 15 segundos para evitar denegación de clock skew en las reglas de seguridad
      const expirationTime = Date.now() + 2 * 60 * 60 * 1000 - 15000;

      const sessionRef = doc(db, 'client_sessions', uid);
      await setDoc(sessionRef, {
        clientId: cleanClientId,
        token: cleanToken,
        createdAt: serverTimestamp(),
        expiresAt: new Date(expirationTime),
        lastAccess: serverTimestamp()
      });

      // 3. Obtener el registro de clientes_control para comprobar existencia
      const clientRef = doc(db, 'clientes_control', cleanClientId);
      const clientSnap = await getDoc(clientRef);

      if (!clientSnap.exists()) {
        // Si no existe el cliente, limpiar la sesión
        await deleteDoc(sessionRef);
        await signOut(auth);
        throw new Error('El ID de cliente especificado no existe en el sistema.');
      }

      // Guardar credenciales locales
      localStorage.setItem('client_portal_clientId', cleanClientId);
      localStorage.setItem('client_portal_token', cleanToken);
      localStorage.setItem('client_portal_simulated', 'false');

      set({ 
        clientId: cleanClientId, 
        token: cleanToken, 
        isSimulated: false, 
        isAuthenticated: true, 
        loading: false 
      });

      get().subscribeClientData();
      get().startSessionMonitoring();
      return true;
    } catch (err) {
      console.error('Error during client portal login:', err);
      // Limpiar auth en caso de error
      await signOut(auth).catch(() => {});
      set({ 
        error: err.message || 'Error de autenticación. Verifique sus credenciales.', 
        loading: false 
      });
      return false;
    }
  },

  logout: async () => {
    get().unsubscribeClientData();
    get().stopSessionMonitoring();

    const isSimulated = get().isSimulated;
    if (!isSimulated && auth.currentUser) {
      const uid = auth.currentUser.uid;
      // Eliminar sesión de base de datos
      await deleteDoc(doc(db, 'client_sessions', uid)).catch(() => {});
      await signOut(auth).catch(() => {});
    }

    localStorage.removeItem('client_portal_clientId');
    localStorage.removeItem('client_portal_token');
    localStorage.removeItem('client_portal_simulated');

    set({
      clientId: null,
      token: null,
      isAuthenticated: false,
      isSimulated: false,
      clientData: null,
      project: null,
      provisioningOrder: null,
      followups: [],
      failures: [],
      billingReports: [],
      activityLogs: [],
      healthScore: 100,
      error: null
    });
  },

  // Suscripción reactiva en tiempo real filtrada
  subscribeClientData: () => {
    get().unsubscribeClientData();

    const clientId = get().clientId;
    if (!clientId) return;

    console.log(`🔥 [Portal Clientes] Iniciando listeners reactivos para: ${clientId}`);

    try {
      // 1. Listener sobre su cliente_control
      unsubClient = onSnapshot(doc(db, 'clientes_control', clientId), (snap) => {
        if (snap.exists()) {
          set({ clientData: { id: snap.id, ...snap.data() } });
          get().recalculateHealth();
        }
      }, (err) => console.warn('[Portal] Errores al escuchar clientes_control:', err.message));

      // 2. Listener sobre su proyecto
      const qProj = query(collection(db, 'projects'), where('clienteId', '==', clientId), limit(1));
      unsubProject = onSnapshot(qProj, (snap) => {
        if (!snap.empty) {
          set({ project: snap.docs[0].data() });
        }
      }, (err) => console.warn('[Portal] Errores al escuchar projects:', err.message));

      // 3. Listener sobre su orden de aprovisionamiento
      const qProv = query(collection(db, 'provisioning_orders'), where('clientId', '==', clientId), limit(1));
      unsubProv = onSnapshot(qProv, (snap) => {
        if (!snap.empty) {
          set({ provisioningOrder: snap.docs[0].data() });
        }
      }, (err) => console.warn('[Portal] Errores al escuchar provisioning_orders:', err.message));

      // 4. Listener sobre sus seguimientos
      const qFollows = query(collection(db, 'followups'), where('clientId', '==', clientId), orderBy('date', 'desc'));
      unsubFollows = onSnapshot(qFollows, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ followups: list });
        get().recalculateHealth();
      }, (err) => console.warn('[Portal] Errores al escuchar followups:', err.message));

      // 5. Listener sobre sus fallos activos
      const qFailures = query(collection(db, 'app_failures'), where('clientId', '==', clientId), orderBy('timestamp', 'desc'));
      unsubFailures = onSnapshot(qFailures, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ failures: list });
        get().recalculateHealth();
      }, (err) => console.warn('[Portal] Errores al escuchar app_failures:', err.message));

      // 6. Listener sobre su facturación
      const qBilling = query(collection(db, 'reportesBilling'), where('clientId', '==', clientId), orderBy('date', 'desc'));
      unsubBilling = onSnapshot(qBilling, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ billingReports: list });
        get().recalculateHealth();
      }, (err) => console.warn('[Portal] Errores al escuchar reportesBilling:', err.message));

      // 7. Listener sobre logs de actividad de auditoría
      const qLogs = query(collection(db, 'activity_logs'), where('entityId', '==', clientId), orderBy('timestamp', 'desc'), limit(50));
      unsubLogs = onSnapshot(qLogs, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        set({ activityLogs: list });
      }, (err) => console.warn('[Portal] Errores al escuchar activity_logs:', err.message));

    } catch (err) {
      console.error('Error setting up portal subscriptions:', err);
    }
  },

  unsubscribeClientData: () => {
    if (unsubClient) { unsubClient(); unsubClient = null; }
    if (unsubProject) { unsubProject(); unsubProject = null; }
    if (unsubProv) { unsubProv(); unsubProv = null; }
    if (unsubFollows) { unsubFollows(); unsubFollows = null; }
    if (unsubFailures) { unsubFailures(); unsubFailures = null; }
    if (unsubBilling) { unsubBilling(); unsubBilling = null; }
    if (unsubLogs) { unsubLogs(); unsubLogs = null; }
  },

  // Recalcular salud del cliente importando la lógica pura
  recalculateHealth: () => {
    const { clientData, failures, billingReports, followups } = get();
    if (!clientData) return;
    const score = calculateClientHealth(clientData, failures, billingReports, followups);
    set({ healthScore: score });
  },

  // Cargar mocks locales en Sandbox
  loadMockPortalData: () => {
    set({
      clientData: MOCK_CLIENT_CONTROL,
      project: MOCK_PROJECT,
      provisioningOrder: MOCK_PROVISIONING,
      followups: MOCK_FOLLOWUPS,
      failures: MOCK_FAILURES,
      billingReports: MOCK_BILLING,
      activityLogs: MOCK_LOGS,
      healthScore: 80
    });
    get().recalculateHealth();
  },

  // Monitoreo de expiración y ping de sesión
  startSessionMonitoring: () => {
    get().stopSessionMonitoring();
    
    // Validar cada 30 segundos
    sessionCheckTimer = setInterval(async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const sessionRef = doc(db, 'client_sessions', uid);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
          console.warn('[Portal] Sesión eliminada externamente.');
          get().logout();
          return;
        }

        const data = sessionSnap.data();
        const expiresAt = data.expiresAt?.toDate().getTime();

        if (expiresAt && Date.now() > expiresAt) {
          console.warn('[Portal] Sesión expirada automáticamente.');
          get().logout();
          return;
        }

        // Extender sesión (Ping de actividad) si faltan menos de 30 minutos para expirar
        const timeRemaining = expiresAt - Date.now();
        if (timeRemaining < 30 * 60 * 1000) {
          console.log('[Portal] Extendiendo sesión del cliente...');
          const nextExpiration = Date.now() + 2 * 60 * 60 * 1000 - 15000;
          await updateDoc(sessionRef, {
            expiresAt: new Date(nextExpiration),
            lastAccess: serverTimestamp()
          });
        }
      } catch (err) {
        console.error('[Portal] Error al validar sesión:', err.message);
      }
    }, 30000);
  },

  stopSessionMonitoring: () => {
    if (sessionCheckTimer) {
      clearInterval(sessionCheckTimer);
      sessionCheckTimer = null;
    }
  }
}));
