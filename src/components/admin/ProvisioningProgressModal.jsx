import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Minimize2, 
  Cpu, 
  Code2, 
  Sparkles,
  Check,
  Flame,
  AlertTriangle,
  Download
} from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Copiando plantilla base', description: 'Copia de archivos y estructura de directorios del core' },
  { id: 2, label: 'Generando documentación', description: 'Creación de manuales técnicos y bitácoras del cliente' },
  { id: 3, label: 'Inyectando variables de marca', description: 'Configuración de la paleta cromática HSL y estilos base' },
  { id: 4, label: 'Configurando variables de entorno', description: 'Generación del archivo .env.local y credenciales' },
  { id: 5, label: 'Configurando nicho comercial', description: 'Indexación de la vertical de negocio en src/config/niche.json' },
  { id: 6, label: 'Configurando PWA', description: 'Creación y personalización del manifiesto de la aplicación móvil' },
  { id: 7, label: 'Inyectando SEO y Metatags', description: 'Optimización de títulos, keywords y descripción de búsqueda' },
  { id: 8, label: 'Generando logo y favicon', description: 'Creación automatizada de recursos visuales de marca' },
  { id: 9, label: 'Inyectando reglas de IA', description: 'Aprovisionamiento de la gobernanza de desarrollo' },
  { id: 10, label: 'Generando prompt de arranque', description: 'Preparación del motor cognitivo de antigravedad' },
  { id: 11, label: 'Instalando dependencias npm', description: 'Ejecución del gestor de paquetes para el runtime de React' },
  { id: 12, label: 'Inicializando repositorio Git', description: 'Creación del repositorio local y commit de pre-vuelo' },
  { id: 13, label: 'Registrando cliente en la nube', description: 'Persistencia de credenciales y configuración en Firestore central' },
  { id: 14, label: 'Inyectando componentes inteligentes', description: 'Inyección automática de componentes seleccionados del catálogo' }
];

export default function ProvisioningProgressModal({ 
  isProvisioning, 
  logs = [], 
  stageLabel = '', 
  onClose,
  clientId = '',
  clientName = '',
  isRegistering = false,
  isCompleted = false,
  onOpenAccountsManager,
  isAuthActivationRequired = false,
  authProjectId = '',
  onResumeAuth
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('stages'); // 'stages' | 'console'
  const [isResumingAuth, setIsResumingAuth] = useState(false);
  const terminalEndRef = useRef(null);

  const handleDownloadLog = () => {
    if (!logs || logs.length === 0) return;
    const textContent = logs.map(line => {
      if (typeof line !== 'string') return '';
      return line.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, ''); // Limpiar códigos de escape ANSI
    }).join('\n');
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const cleanClientName = (clientName || clientId || 'cliente').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `log-aprovisionamiento-${cleanClientName}-${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Analizar logs para determinar el paso actual
  const getActiveStepIndex = () => {
    if (!Array.isArray(logs)) return 0;
    let lastIndex = 0;
    for (let i = 0; i < STAGES.length; i++) {
      const stage = STAGES[i];
      const match = logs.some(log => {
        if (typeof log !== 'string') return false;
        const text = log.toLowerCase();
        return text.includes(stage.label.toLowerCase()) || 
               (i === 0 && text.includes('plantilla base')) ||
               (i === 1 && text.includes('documentación estándar')) ||
               (i === 2 && text.includes('variables de marca')) ||
               (i === 3 && text.includes('variables de entorno')) ||
               (i === 4 && text.includes('nicho.json')) ||
               (i === 5 && text.includes('manifest pwa')) ||
               (i === 6 && text.includes('metatags seo')) ||
               (i === 7 && text.includes('logo y favicon')) ||
               (i === 8 && text.includes('gemini.md')) ||
               (i === 9 && text.includes('antigravity_bootstrap')) ||
               (i === 10 && text.includes('dependencias')) ||
               (i === 11 && text.includes('git local')) ||
               (i === 12 && (text.includes('registrando cliente') || text.includes('registro de cliente') || text.includes('nube central'))) ||
               (i === 13 && (text.includes('inyección de') || text.includes('auto-inject') || text.includes('inyectando componente') || text.includes('inyección en lote finalizada')));
      });
      if (match) {
        lastIndex = i;
      }
    }
    return lastIndex;
  };

  const activeIndex = getActiveStepIndex();
  
  // Determinar si ha finalizado con éxito o error
  const hasFinishedSuccess = isCompleted || (Array.isArray(logs) && logs.some(log => typeof log === 'string' && (log.includes('¡TODAS LAS PRUEBAS PASARON AL 100%!') || log.includes('Aprovisionamiento físico completado.') || log.includes('Inyección en lote finalizada con éxito.'))));
  
  const isError = Array.isArray(logs) && logs.some(log => {
    if (typeof log !== 'string') return false;
    const text = log.toLowerCase();
    
    // Ignorar específicamente parámetros de configuración, flags e inicializadores de loglevel comunes
    if (text.includes('--loglevel=error')) return false;
    
    // Ignorar advertencias/limitaciones de configuración en la nube (no impiden el build físico local)
    if (text.includes('configuration_not_found') || text.includes('billing_not_enabled') || text.includes('failed_precondition')) {
      return false;
    }
    
    // Si contiene marcas explícitas de fallo fatal del Bridge/CLI
    if (text.includes('❌') || text.includes('[cli api error]') || text.includes('[cli error]') || text.includes('failed to deploy') || text.includes('build failed')) {
      return true;
    }
    
    // Si contiene la palabra "error" de forma general pero no es un warning o mensaje ignorado
    const hasErrorWord = text.includes('error') && 
                         !text.includes('warning') && 
                         !text.includes('ignorar') && 
                         !text.includes('warn') &&
                         !text.includes('info') &&
                         !text.includes('debug') &&
                         !text.includes('configuration_not_found') &&
                         !text.includes('billing_not_enabled');
                         
    return hasErrorWord;
  });

  // Auto-scroll en consola al recibir logs
  useEffect(() => {
    if (activeTab === 'console' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // Maximizar automáticamente cuando finalice con éxito o error
  useEffect(() => {
    if (hasFinishedSuccess || isError) {
      setIsMinimized(false);
    }
  }, [hasFinishedSuccess, isError]);

  // Asegurar que el modal esté maximizado al iniciar un nuevo aprovisionamiento
  useEffect(() => {
    if (isProvisioning) {
      setIsMinimized(false);
    }
  }, [isProvisioning]);

  // Porcentaje de progreso de 0 a 100 (No forzar 100% en caso de error para evitar confusión en UX)
  const progressPercent = hasFinishedSuccess 
    ? 100 
    : Math.round(((activeIndex + 1) / STAGES.length) * 100);

  const developerLines = [
    'import { getFirestore } from "firebase/firestore";',
    'const app = initializeApp(firebaseConfig);',
    'const db = getFirestore(app);',
    'export const useAppConfigSync = () => { ... };',
    'npm run build --minify=true',
    'git commit -m "feat(branding): inject custom HSL theme"',
    'VITE_INITIAL_THEME=custom',
    'VITE_INITIAL_FONT=googleFont',
    'console.log("PROTOTIPE Engine is ready!");'
  ];
  
  const currentLineIdx = Math.floor((logs.length % developerLines.length));

  // Si no está aprovisionando, no mostrar nada (se evalúa justo antes de renderizar para cumplir las reglas de hooks)
  if (!isProvisioning) return null;

  return (
    <>
      {/* Estilos CSS Inline para animaciones estéticas avanzadas */}
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-glass-panel {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1);
        }
        .scrollbar-premium::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .scrollbar-premium::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-premium::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.25);
          border-radius: 99px;
        }
        .scrollbar-premium::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.45);
        }
        @keyframes typing-pulse {
          50% { border-color: transparent }
        }
        .typing-cursor {
          border-right: 2px solid rgba(99, 102, 241, 0.75);
          animation: typing-pulse 1s step-end infinite;
        }
        @keyframes pulse-glow-text {
          0%, 100% { text-shadow: 0 0 4px rgba(99, 102, 241, 0.2); }
          50% { text-shadow: 0 0 10px rgba(99, 102, 241, 0.6); }
        }
        .active-step-glow-text {
          animation: pulse-glow-text 2s infinite ease-in-out;
        }
      `}} />

      {/* 1. MODO MINIMIZADO (Widget flotante circular) */}
      {isMinimized && (
        <div 
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 z-[100] w-16 h-16 bg-slate-950/90 border border-indigo-500/40 hover:border-indigo-400 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(99,102,241,0.35)] backdrop-blur-xl hover:scale-105 transition-all select-none group active:scale-95"
        >
          {/* Círculo de progreso neón */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              stroke="rgba(99,102,241,0.1)" 
              strokeWidth="3" 
              fill="transparent" 
            />
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              stroke="url(#minimisedNeonGradient)" 
              strokeWidth="3.5" 
              fill="transparent" 
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="minimisedNeonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="flex flex-col items-center justify-center z-10">
            {isError ? (
              <XCircle className="w-5 h-5 text-rose-500 animate-pulse" />
            ) : hasFinishedSuccess ? (
              <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
            ) : (
              <>
                <Cpu className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-[9px] font-bold text-slate-300 mt-0.5 font-mono">{progressPercent}%</span>
              </>
            )}
          </div>
          
          {/* Tooltip flotante */}
          <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block bg-slate-950/95 border border-indigo-500/20 text-slate-200 text-[10px] px-3 py-1 rounded-xl whitespace-nowrap font-mono shadow-xl backdrop-blur-md">
            {hasFinishedSuccess ? 'Aprovisionamiento Listo' : isError ? 'Fallo detectado' : `Aprovisionando: ${progressPercent}%`}
          </div>
        </div>
      )}

      {/* 2. HUD COMPLETO (Modal flotante premium) */}
      {!isMinimized && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
          <div className="premium-glass-panel p-6 rounded-[2rem] max-w-2xl w-full h-[580px] flex flex-col justify-between relative overflow-hidden transition-all duration-300">
            
            {/* Brillos ambientales de fondo */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

            {/* Cabecera del Panel */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  {hasFinishedSuccess ? (
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  ) : isError ? (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-100 tracking-wide uppercase">
                      Motor de Aprovisionamiento
                    </h4>
                    {clientName && (
                      <span className="text-[9px] text-indigo-400 font-mono bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                        @{clientId}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    {hasFinishedSuccess ? 'Proceso completado con éxito.' : isError ? 'Ocurrió un error en el pre-flight.' : `Fase activa: ${stageLabel || 'Ejecutando tareas...'}`}
                  </p>
                </div>
              </div>

              {/* Botón Minimizar */}
              <button 
                onClick={() => setIsMinimized(true)}
                className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-inner"
                title="Minimizar a widget flotante"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Vistas / Pestañas */}
            <div className="flex bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800/40 my-4.5 z-10">
              <button
                onClick={() => setActiveTab('stages')}
                className={`flex-grow py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'stages' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-950/50 border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Paso a Paso
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`flex-grow py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'console' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-950/50 border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Consola de Código
              </button>
            </div>

            {/* Contenedor Principal (Hitos vs Consola) */}
            <div className="flex-1 min-h-0 overflow-hidden relative mb-4 z-10">
              
              {/* VISTA 1: PASO A PASO */}
              {activeTab === 'stages' && (
                <div className="h-full overflow-y-auto pr-2 relative scrollbar-premium">
                  
                  {/* Línea vertical de la línea de tiempo */}
                  <div className="absolute left-[13px] top-3.5 bottom-3.5 w-[1.5px] bg-slate-800/50" />
                  
                  {/* Línea vertical de progreso activa */}
                  <div 
                    className="absolute left-[13px] top-3.5 w-[1.5px] bg-gradient-to-b from-emerald-500 via-indigo-500 to-purple-500 transition-all duration-500" 
                    style={{ 
                      height: `${Math.max(0, Math.min(100, ((activeIndex) / (STAGES.length - 1)) * 95))}%`
                    }} 
                  />

                  <div className="space-y-4">
                    {STAGES.map((stage, idx) => {
                      const isStepCompleted = hasFinishedSuccess || idx < activeIndex;
                      const isStepActive = !hasFinishedSuccess && !isError && idx === activeIndex;
                      
                      return (
                        <div 
                          key={stage.id} 
                          className="relative pl-9 flex items-start justify-between gap-4 transition-all duration-300"
                        >
                          {/* Indicador de Estado Circular */}
                          <div className="absolute left-0 top-0.5 flex items-center justify-center">
                            {isStepActive && (
                              <span className="absolute inline-flex h-7 w-7 rounded-full bg-indigo-500/30 border border-indigo-400/40 animate-ping opacity-75" />
                            )}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-black border z-10 transition-all duration-300 ${
                              isStepCompleted 
                                ? 'border-emerald-500/45 text-emerald-400 bg-slate-950/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                : isStepActive 
                                  ? 'border-indigo-400 text-indigo-300 bg-slate-950/90 shadow-[0_0_12px_rgba(99,102,241,0.35)]' 
                                  : 'border-slate-800 text-slate-600 bg-slate-950/70'
                            }`}>
                              {isStepCompleted ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : isStepActive ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                              ) : (
                                String(stage.id).padStart(2, '0')
                              )}
                            </div>
                          </div>
                          
                          {/* Contenido textual del hito */}
                          <div className="min-w-0 flex-1 pl-1">
                            <h5 className={`text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                              isStepActive 
                                ? 'text-indigo-200 active-step-glow-text font-black' 
                                : isStepCompleted 
                                  ? 'text-slate-300' 
                                  : 'text-slate-550'
                            }`}>
                              {stage.label}
                            </h5>
                            <p className={`text-[9px] mt-0.5 transition-colors duration-300 leading-relaxed ${
                              isStepActive ? 'text-slate-300' : 'text-slate-550'
                            }`}>
                              {stage.description}
                            </p>
                          </div>

                          {/* Indicador de estado discreto a la derecha */}
                          <div className="flex-shrink-0 self-start mt-0.5">
                            {isStepCompleted ? (
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono shadow-[0_0_8px_rgba(16,185,129,0.08)]">
                                Completado
                              </span>
                            ) : isStepActive ? (
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.08)]">
                                Procesando
                              </span>
                            ) : (
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-950/30 border border-slate-900/40 text-slate-600 font-mono">
                                Espera
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VISTA 2: CONSOLA DE CÓDIGO */}
              {activeTab === 'console' && (
                <div className="h-full bg-slate-950/90 border border-[var(--color-border)]/50 p-4 font-mono text-[9px] rounded-xl overflow-y-auto space-y-2 select-text scrollbar-premium">
                  {logs.length === 0 ? (
                    <div className="text-slate-600 italic">Esperando logs de compilación del CLI...</div>
                  ) : (
                    logs.map((logLine, idx) => {
                      if (typeof logLine !== 'string') return null;
                      let lineClass = "text-slate-400";
                      if (logLine.includes("✅") || logLine.includes("éxito") || logLine.includes("exitoso") || logLine.includes("correctamente") || logLine.includes("PASS")) {
                        lineClass = "text-emerald-400 font-medium";
                      } else if (logLine.includes("❌") || logLine.includes("falló") || logLine.includes("Error") || logLine.includes("failed")) {
                        lineClass = "text-rose-400 font-bold";
                      } else if (logLine.includes("⚠️") || logLine.includes("Warning") || logLine.includes("advertencia")) {
                        lineClass = "text-amber-400";
                      } else if (logLine.startsWith("[Firebase") || logLine.startsWith("[CLI API]")) {
                        lineClass = "text-indigo-400 font-medium";
                      }
                      return (
                        <div key={idx} className={`${lineClass} break-all whitespace-pre-wrap leading-relaxed`}>
                          <span className="text-indigo-500/50 mr-2 select-none">&gt;</span>
                          {logLine}
                        </div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              )}
            </div>

            {/* SECCIÓN INFERIOR: BARRA DE PROGRESO Y ANIMACIÓN DE DESARROLLADOR */}
            <div className="border-t border-slate-800/40 pt-4 space-y-4.5 z-10">
              
              {/* Animación del Desarrollador (Caja de Texto code-typing) */}
              {!hasFinishedSuccess && !isError && (
                <div className="flex items-center gap-2 bg-slate-950/50 px-3.5 py-2 rounded-xl border border-slate-800/50 font-mono text-[9px] text-indigo-400 shadow-inner">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="typing-cursor pr-1">
                    {developerLines[currentLineIdx]}
                  </span>
                </div>
              )}

              {/* Tarjeta de Activación de Firebase Auth (Spark Plan Pausa) */}
              {isAuthActivationRequired && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4.5 space-y-4 shadow-[0_0_30px_rgba(99,102,241,0.15)] select-none">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                        Activación de Firebase Auth Requerida
                      </h4>
                      <p className="text-[10px] text-slate-300 leading-relaxed">
                        Google requiere la inicialización física del servicio de Autenticación para proyectos nuevos en el plan Spark (gratuito). Por favor, abre la consola del proyecto, presiona el botón <span className="font-bold text-indigo-300">"Comenzar"</span> (Get Started) y regresa para continuar.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <a
                      href={`https://console.firebase.google.com/project/${authProjectId}/authentication`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-center text-xs font-black tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      1. Ir a Consola Firebase
                    </a>
                    <button
                      onClick={async () => {
                        if (isResumingAuth) return;
                        setIsResumingAuth(true);
                        if (onResumeAuth) {
                          await onResumeAuth();
                        }
                        setIsResumingAuth(false);
                      }}
                      disabled={isResumingAuth}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      {isResumingAuth ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                      2. Ya lo he habilitado, continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Barra de progreso e información de porcentaje */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-wider">
                  <span className="text-slate-500 uppercase">Progreso Global</span>
                  <span className="text-indigo-300 font-black">{progressPercent}%</span>
                </div>
                
                {/* Canaleta de progreso */}
                <div className="h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Botón de Cierre / Continuar al finalizar / Descargar Logs */}
              {(hasFinishedSuccess || isError || !isRegistering) && (
                <div className="flex justify-between items-center gap-4 animate-fade-in pt-1">
                  <div>
                    {logs && logs.length > 0 && (
                      <button
                        onClick={handleDownloadLog}
                        className="px-4.5 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-inner"
                        title="Descargar registro completo en un archivo .txt"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar Registro (Log)
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2.5">
                    {hasFinishedSuccess && (
                      <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                        Completado / Ir a Onboarding
                      </button>
                    )}
                    {(isError || (!hasFinishedSuccess && !isRegistering)) && (
                      <div className="flex gap-2">
                        {isError && onOpenAccountsManager && (
                          <button
                            onClick={onOpenAccountsManager}
                            className="px-5 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                          >
                            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                            Gestionar Firebase
                          </button>
                        )}
                        <button
                          onClick={onClose}
                          className="px-6 py-2.5 bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-900/10 text-rose-300 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:scale-105 active:scale-95"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                          Cerrar y Revisar Logs
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
