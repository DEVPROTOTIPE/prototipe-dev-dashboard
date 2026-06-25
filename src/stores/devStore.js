import { create } from 'zustand';
import { db } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

export const useDevStore = create((set, get) => {
  // Almacenar referencias de desuscripción de Firestore
  let unsubDocs = null;
  let unsubClientes = null;
  let unsubTokens = null;
  let unsubFailures = null;

  return {
    // Datos de Firestore
    clientesSaas: [],
    reports: [],
    telemetryTokens: [],
    failures: [],

    // Log del Sistema
    logs: [],

    // Estados de Conexión y Carga
    isLoading: true,
    dbStatus: 'checking', // 'checking' | 'connected' | 'error-sandbox'
    isSimulated: false,
    theme: localStorage.getItem('theme') || 'dark',

    // Estados de UI Compartidos
    activeTab: 'dashboard',
    crmSubTab: 'lista', // 'lista' | 'paridad' | 'firebase-rules'
    selectedClient: null,
    terminalDrawer: { open: false, clientId: '', title: '', type: 'dev' }, // 'dev' | 'npm'
    
    // Checkboxes de Selección Lote
    globalSyncCheckedClients: {},
    globalDeployCheckedClients: {},
    globalTelemetryCheckedClients: {},

    // Setters simples de UI
    setActiveTab: (tab) => set({ activeTab: tab }),
    setCrmSubTab: (subTab) => set({ crmSubTab: subTab }),
    setSelectedClient: (client) => set({ selectedClient: client }),
    setTerminalDrawer: (drawerState) => set({ terminalDrawer: { ...get().terminalDrawer, ...drawerState } }),
    setGlobalSyncCheckedClients: (checked) => set({ globalSyncCheckedClients: checked }),
    setGlobalDeployCheckedClients: (checked) => set({ globalDeployCheckedClients: checked }),
    setGlobalTelemetryCheckedClients: (checked) => set({ globalTelemetryCheckedClients: checked }),
    
    toggleTheme: () => set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      if (nextTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
      return { theme: nextTheme };
    }),

    setIsSimulated: (simulated) => set({ isSimulated: simulated }),
    setDbStatus: (status) => set({ dbStatus: status }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setReports: (reports) => set({ reports }),
    setClientesSaas: (clientes) => set({ clientesSaas: clientes }),
    setTelemetryTokens: (tokens) => set({ telemetryTokens: tokens }),
    setFailures: (failures) => set({ failures }),

    // Agregar logs en tiempo real
    addLog: (message, type = 'info', client = null) => {
      const newLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        message,
        type,
        client
      };
      set((state) => ({ logs: [newLog, ...state.logs].slice(0, 150) }));
    },

    // Iniciar suscripciones Firestore
    subscribeTelemetry: () => {
      const { addLog } = get();
      
      // Limpiar suscripciones previas si existen
      get().unsubscribeTelemetry();

      set({ isLoading: true });
      addLog("Iniciando conexión con Consola Central...", "warning");

      const isGlobalSimulated = localStorage.getItem('db_simulated') === 'true';
      if (isGlobalSimulated) {
        get().loadMockTelemetryData();
        return;
      } else {
        set({ isSimulated: false });
      }

      try {
        // 1. Escuchar reportes de billing
        const qBilling = query(collection(db, 'reportesBilling'), orderBy('periodo', 'desc'));
        unsubDocs = onSnapshot(qBilling, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ reports: list, isLoading: false, dbStatus: 'connected', isSimulated: false });
          
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const docData = change.doc.data();
              addLog(`Reporte de facturación periódico [${docData.periodo}] registrado por valor de $${Number(docData.comisionValor || 0).toLocaleString()} (Ventas: $${Number(docData.totalVentas || 0).toLocaleString()}).`, "success", docData.clientId);
            }
          });
        }, (error) => {
          console.warn("Fallo al leer datos reales. Cargando sandbox local:", error);
          get().loadMockTelemetryData();
          addLog("Acceso denegado a Firestore. Cargando Sandbox local automático.", "error");
        });

        // 2. Escuchar configuraciones de clientes
        const qClientes = collection(db, 'clientes_control');
        unsubClientes = onSnapshot(qClientes, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ clientesSaas: list });
          addLog(`Sincronizadas ${list.length} configuraciones de clientes en tiempo real.`, "success");
        }, (error) => {
          console.warn("Fallo al escuchar clientes_control:", error);
        });

        // 3. Escuchar tokens de telemetría
        const qTokens = collection(db, 'tokens');
        unsubTokens = onSnapshot(qTokens, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ telemetryTokens: list });
        }, (error) => {
          console.warn("Fallo al escuchar tokens:", error);
        });

        // 4. Escuchar fallos y errores de telemetría
        const qFailures = query(collection(db, 'app_failures'), orderBy('timestamp', 'desc'));
        unsubFailures = onSnapshot(qFailures, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ failures: list });
          
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const docData = change.doc.data();
              addLog(`FALLO DETECTADO: "${docData.errorMsg || 'Error genérico'}" en ruta ${docData.environment?.url || 'N/A'}.`, "error", docData.clientId);
            }
          });
        }, (error) => {
          console.warn("Fallo al escuchar app_failures:", error);
        });

      } catch (err) {
        console.error("Error setting up Firestore listeners:", err);
        addLog(`Error al conectar con Firestore: ${err.message}`, "error");
        set({ isLoading: false, dbStatus: 'error-sandbox' });
      }
    },

    // Detener suscripciones Firestore
    unsubscribeTelemetry: () => {
      if (unsubDocs) { unsubDocs(); unsubDocs = null; }
      if (unsubClientes) { unsubClientes(); unsubClientes = null; }
      if (unsubTokens) { unsubTokens(); unsubTokens = null; }
      if (unsubFailures) { unsubFailures(); unsubFailures = null; }
    },

    // Cargar datos mock de telemetría para Sandbox
    loadMockTelemetryData: () => {
      const mockClients = [
        {
          id: 'smartfix',
          nombre: 'SmartFix',
          niche: 'retail_electronics',
          estado: 'Activo',
          contacto: { nombre: 'Sergio Herrera', telefono: '+5215551234', correo: 'sergio@smartfix.com' },
          comercial: { leadId: 'lead-1', proposalId: 'mock-prop-1', fechaInicio: '2026-06-01', modeloMonetizacion: 'percentage', setupValor: 1200000, mensualidadValor: 350000, comisionPorcentaje: 1.5 },
          tecnico: { projectId: 'smartfix', telemetryToken: 'token-smartfix', versionCore: '1.0.0', urlHosting: 'https://smartfix.prototipe.io' }
        },
        {
          id: 'boutique-bella',
          nombre: 'Boutique Bella',
          niche: 'retail_clothing',
          estado: 'Activo',
          contacto: { nombre: 'Laura Gómez', telefono: '+5215555678', correo: 'laura@boutiquebella.com' },
          comercial: { leadId: 'lead-2', proposalId: 'mock-prop-2', fechaInicio: '2026-06-10', modeloMonetizacion: 'fixed_monthly', setupValor: 1000000, mensualidadValor: 300000, comisionPorcentaje: 0 },
          tecnico: { projectId: 'boutique-bella', telemetryToken: 'token-boutique', versionCore: '1.0.1', urlHosting: 'https://boutiquebella.prototipe.io' }
        }
      ];

      const mockReports = [
        { id: 'rep-1', clientId: 'smartfix', periodo: '2026-05', totalVentas: 15400000, comisionPorcentaje: 1.5, comisionValor: 231000, estadoPago: 'pagado', updatedAt: new Date().toISOString() },
        { id: 'rep-2', clientId: 'smartfix', periodo: '2026-06', totalVentas: 18200000, comisionPorcentaje: 1.5, comisionValor: 273000, estadoPago: 'pendiente', updatedAt: new Date().toISOString() },
        { id: 'rep-3', clientId: 'boutique-bella', periodo: '2026-06', totalVentas: 0, comisionPorcentaje: 0, comisionValor: 0, estadoPago: 'pagado', updatedAt: new Date().toISOString() }
      ];

      const mockFailures = [
        { id: 'fail-1', clientId: 'smartfix', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), errorMsg: 'TypeError: Cannot read properties of undefined (reading "map")', resolved: false, severity: 'error', environment: { url: '/pos' } },
        { id: 'fail-2', clientId: 'smartfix', timestamp: new Date(Date.now() - 86400000).toISOString(), errorMsg: 'FirebaseError: Missing or insufficient permissions', resolved: true, severity: 'warning', environment: { url: '/admin' } }
      ];

      set({
        clientesSaas: mockClients,
        reports: mockReports,
        failures: mockFailures,
        isSimulated: true,
        dbStatus: 'error-sandbox',
        isLoading: false
      });
      get().addLog("🎮 Entorno Sandbox Telemetría inicializado con datos mock.", "warning");
    }
  };
});

if (typeof window !== 'undefined') {
  window.useDevStore = useDevStore;
}
