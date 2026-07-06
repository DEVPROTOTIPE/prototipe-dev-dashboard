import React, { useState, Component } from 'react';
import { AlertTriangle, AlertOctagon, RefreshCcw, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const CENTRAL_CONFIG = {
  apiKey: import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY || "",
  authDomain: import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID || ""
};

const getCentralDb = () => {
  if (!CENTRAL_CONFIG.apiKey || !CENTRAL_CONFIG.projectId) return null;
  const appName = "centralDevApp";
  try {
    let app;
    if (getApps().some(a => a.name === appName)) {
      app = getApp(appName);
    } else {
      app = initializeApp(CENTRAL_CONFIG, appName);
    }
    return getFirestore(app);
  } catch (err) {
    console.error("Error inicializando Firebase Central en Sandbox:", err);
    return null;
  }
};

// Real ErrorBoundary Component class (from the ecosystem library)
class ErrorBoundaryFallback extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary Sandbox] Capturado:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle = 'Fallo Crítico Detectado', fallbackDesc = 'Ocurrió un error en la aplicación. Hemos aislado el fallo para proteger tus datos.' } = this.props;

      return (
        <div className="w-full p-5 bg-[var(--color-surface)] border border-red-500/20 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-start justify-between text-left">
          <div className="flex-1 space-y-3 min-w-0">
            {/* Cabecera */}
            <div className="flex items-center gap-2 text-red-500">
              <AlertOctagon size={16} className="animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-wider">{fallbackTitle}</h3>
            </div>
            
            <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed max-w-md">
              {fallbackDesc} Si el problema persiste, intenta recargar el sitio o repórtalo a soporte técnico.
            </p>

            {/* Detalles Técnicos */}
            <div className="space-y-1.5">
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-indigo-500 transition-colors cursor-pointer outline-none"
              >
                {this.state.showDetails ? (
                  <>Ocultar Detalles <ChevronUp size={10} /></>
                ) : (
                  <>Ver Detalles Técnicos <ChevronDown size={10} /></>
                )}
              </button>

              {this.state.showDetails && (
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-3 overflow-x-auto max-h-[140px] overflow-y-auto">
                  <pre className="font-mono text-[9px] text-red-400 leading-normal whitespace-pre-wrap select-text">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 pt-1">
            <button
              onClick={this.handleReset}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[10px] font-black text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
            >
              <RefreshCcw size={11} />
              Reintentar
            </button>
            
            {this.props.onReport && (
              <button
                onClick={() => this.props.onReport(this.state.error, this.state.errorInfo)}
                className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/35 hover:scale-105 active:scale-95 text-[10px] font-black text-[var(--color-text)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send size={11} />
                Reportar Bug
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Buggy component that crashes on demand
function BuggyComponent({ shouldCrash }) {
  if (shouldCrash) {
    throw new Error("Simulated Crash: Fallo crítico de renderizado React 19");
  }
  return (
    <div className="p-4 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl text-center text-[10px] text-[var(--color-text-muted)] font-bold">
      Componente cargado de manera correcta. Listo para simular un crash.
    </div>
  );
}

export default function ErrorBoundaryFallbackSandbox() {
  const [shouldCrash, setShouldCrash] = useState(false);
  const [reportLog, setReportLog] = useState([]);

  const handleReport = async (error, errorInfo) => {
    const db = getCentralDb();
    const clientId = import.meta.env.VITE_DEVELOPER_CLIENT_ID || 'sandbox-error-boundary';
    
    setReportLog(prev => [
      `[${new Date().toLocaleTimeString()}] 📤 Enviando reporte de fallo a la base de datos central...`,
      ...prev
    ]);

    try {
      if (!db) {
        throw new Error("Base de datos central no disponible (variables de entorno no encontradas)");
      }
      
      const payload = {
        clientId,
        niche: 'Sandbox Error Boundary Fallback',
        timestamp: Date.now(),
        errorMsg: error?.message || error?.toString() || 'Error desconocido',
        stack: error?.stack || errorInfo?.componentStack || 'No stack trace available',
        deviceInfo: navigator.userAgent,
        resolved: false,
        version: '1.0.0-sandbox',
        path: window.location.pathname
      };
      
      const docRef = await addDoc(collection(db, 'app_failures'), payload);
      
      setReportLog(prev => [
        `[${new Date().toLocaleTimeString()}] ✅ Éxito: Reportado con ID ${docRef.id} a la colección 'app_failures'.`,
        ...prev.filter(l => !l.includes("Enviando reporte"))
      ]);
    } catch (err) {
      console.error("Error al reportar a la central:", err);
      setReportLog(prev => [
        `[${new Date().toLocaleTimeString()}] ❌ Error al enviar: ${err.message}`,
        ...prev.filter(l => !l.includes("Enviando reporte"))
      ]);
    }
  };

  return (
    <SandboxLayout
      title="ErrorBoundaryFallback"
      description="Capturador de excepciones críticas de React para prevenir pantalla en blanco y guiar la recuperación."
      controls={[]}
    >
      <div className="w-full space-y-4 text-[var(--color-text)]">
        
        {/* Mock Application Container wrapping the interactive ErrorBoundary */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 p-4">
          
          <ErrorBoundaryFallback
            onReset={() => setShouldCrash(false)}
            onReport={handleReport}
          >
            <div className="space-y-4">
              <BuggyComponent shouldCrash={shouldCrash} />
              
              <button
                onClick={() => setShouldCrash(true)}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                💥 Provocar Crash de Renderizado
              </button>
            </div>
          </ErrorBoundaryFallback>

        </div>

        {/* Telemetry Console simulation to show bug reports */}
        {reportLog.length > 0 && (
          <div className="space-y-1.5 text-left">
            <span className="text-[8px] font-black uppercase text-[var(--color-text-muted)] tracking-wider px-1">
              Registro del Servidor (Simulación)
            </span>
            <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl font-mono text-[9px] text-emerald-400 space-y-1 max-h-24 overflow-y-auto">
              {reportLog.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        )}

      </div>
    </SandboxLayout>
  );
}
