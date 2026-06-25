import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Check, Loader2, AlertCircle, Circle, Server, Database, 
  Cpu, Sliders, ShieldCheck, Play, ArrowRight 
} from 'lucide-react';

const PIPELINE_STEPS = [
  { key: 'order_approved', label: 'Orden Aprobada', icon: Play },
  { key: 'environment_created', label: 'Infraestructura Creada', icon: Server },
  { key: 'database_seeded', label: 'Base Sembrada', icon: Database },
  { key: 'modules_installed', label: 'Módulos Instalados', icon: Cpu },
  { key: 'configuration_applied', label: 'Configuración Aplicada', icon: Sliders },
  { key: 'testing_completed', label: 'QA Automático', icon: ShieldCheck },
  { key: 'production_ready', label: 'Producción Lista', icon: Check }
];

export default function ProvisioningStepper({ orderId, orderStatus }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'provisioning_logs'),
      where('orderId', '==', orderId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(list);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching provisioning logs:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [orderId]);

  // Determinar el estado de cada paso del pipeline
  const getStepStatus = (stepKey, idx) => {
    // Buscar si existe un log completado o fallido para este paso
    const stepLog = logs.find(l => l.step === stepKey);
    
    if (stepLog) {
      return stepLog.status; // 'completed' | 'failed'
    }

    // Si la orden general falló y este es el paso que sigue al último completado, marcar como fallido
    if (orderStatus === 'failed') {
      const lastCompletedIdx = PIPELINE_STEPS.reduce((acc, step, curIdx) => {
        const found = logs.some(l => l.step === step.key && l.status === 'completed');
        return found ? curIdx : acc;
      }, -1);

      if (idx === lastCompletedIdx + 1) {
        return 'failed';
      }
    }

    // Si la orden general fue cancelada y no está completado, es cancelado
    if (orderStatus === 'cancelled') {
      return 'cancelled';
    }

    // Si la orden está en curso y este paso no tiene log, pero el anterior sí, está 'in_progress'
    if (orderStatus === 'deploying' || orderStatus === 'seeding' || orderStatus === 'testing') {
      const lastCompletedIdx = PIPELINE_STEPS.reduce((acc, step, curIdx) => {
        const found = logs.some(l => l.step === step.key && l.status === 'completed');
        return found ? curIdx : acc;
      }, -1);

      if (idx === lastCompletedIdx + 1) {
        return 'in_progress';
      }
    }

    // Por defecto, pendiente
    return 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 space-x-2 text-slate-400">
        <Loader2 className="animate-spin text-indigo-400" size={18} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[10px]">Cargando logs del pipeline...</span>
      </div>
    );
  }

  // Encontrar el paso activo actual
  const activeStepIdx = PIPELINE_STEPS.findIndex((s, i) => getStepStatus(s.key, i) === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Visualización del Pipeline */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-slate-950/40 border border-slate-800/60 rounded-2xl overflow-x-auto scrollbar-none">
        
        {PIPELINE_STEPS.map((step, idx) => {
          const status = getStepStatus(step.key, idx);
          const StepIcon = step.icon;

          let iconBg = 'bg-slate-900 border-slate-800 text-slate-600';
          let lineBg = 'bg-slate-850';
          let textColor = 'text-slate-500';

          if (status === 'completed') {
            iconBg = 'bg-indigo-950/80 border-indigo-500/30 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]';
            lineBg = 'bg-indigo-600/50';
            textColor = 'text-slate-300';
          } else if (status === 'in_progress') {
            iconBg = 'bg-cyan-950/80 border-cyan-500/55 text-cyan-400 ring-4 ring-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse';
            lineBg = 'bg-cyan-500/30';
            textColor = 'text-cyan-400 font-extrabold';
          } else if (status === 'failed') {
            iconBg = 'bg-red-950/80 border-red-500/55 text-red-400 ring-4 ring-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
            textColor = 'text-red-400 font-bold';
          } else if (status === 'cancelled') {
            iconBg = 'bg-slate-900 border-slate-800 text-slate-600';
            textColor = 'text-slate-500 line-through';
          }

          return (
            <div key={step.key} className="flex flex-row md:flex-col items-center gap-3 w-full md:w-[13%] text-left md:text-center relative">
              {/* Línea conectora */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`hidden md:block absolute top-5 left-[60%] right-[-40%] h-0.5 -z-0 ${
                  logs.some(l => l.step === PIPELINE_STEPS[idx + 1].key) ? 'bg-indigo-600/50' : 'bg-slate-850'
                }`} />
              )}

              {/* Círculo con Icono */}
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 z-10 shrink-0 ${iconBg}`}>
                {status === 'completed' ? (
                  <Check size={16} />
                ) : status === 'in_progress' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : status === 'failed' ? (
                  <AlertCircle size={16} />
                ) : (
                  <StepIcon size={16} />
                )}
              </div>

              {/* Título de etapa */}
              <div className="space-y-0.5">
                <span className={`text-[10px] font-black uppercase tracking-wider block ${textColor}`}>
                  {step.label}
                </span>
                {status === 'in_progress' && (
                  <span className="text-[9px] text-cyan-400 font-medium block animate-pulse">Procesando...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal de Logs Detallados */}
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logs de Ejecución del Pipeline</h4>
          <span className="text-[9px] text-slate-500 font-mono">ID de Proceso: {orderId}</span>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-300 h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">Esperando aprobación comercial para inicializar aprovisionamiento...</p>
          ) : (
            logs.map((log) => {
              const dateStr = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : new Date().toLocaleTimeString();
              let color = 'text-slate-400';
              if (log.status === 'completed') color = 'text-indigo-400';
              if (log.status === 'failed') color = 'text-red-400 font-bold';
              if (log.status === 'cancelled') color = 'text-amber-500';

              return (
                <div key={log.id} className="flex gap-2.5 items-start">
                  <span className="text-slate-600 select-none">[{dateStr}]</span>
                  <span className={`uppercase font-bold tracking-wider w-28 shrink-0 ${color}`}>
                    [{log.step}]
                  </span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
