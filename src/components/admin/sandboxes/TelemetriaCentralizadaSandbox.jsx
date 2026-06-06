import React, { useState } from 'react';
import { Loader, Zap } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function TelemetriaCentralizadaSandbox() {
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), type: 'info', msg: 'Telemetry Service Inicializado (Entorno Sandbox)' }
  ]);
  const [clientId, setClientId] = useState('smartfix-ventas');
  const [salesAmount, setSalesAmount] = useState('150000');
  const [billingMode, setBillingMode] = useState('percentage');
  const [commissionPercent, setCommissionPercent] = useState('1.5');
  const [isSending, setIsSending] = useState(false);

  const addLog = (type, msg) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type, msg }]);
  };

  const handleSendTelemetry = async () => {
    setIsSending(true);
    addLog('info', `Disparando envío de telemetría para cliente: "${clientId}"...`);
    await new Promise(r => setTimeout(r, 800));
    
    const sales = Number(salesAmount);
    let value = 0;
    if (billingMode === 'percentage') {
      value = (sales * Number(commissionPercent)) / 100;
    }
    
    const payload = {
      clientId,
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        screenResolution: `${window.innerWidth}x${window.innerHeight}`
      },
      billing: {
        salesAmount: sales,
        commissionValue: value,
        billingMode
      }
    };

    addLog('success', `Datos de facturación calculados: Comisión = $${value.toLocaleString()}`);
    addLog('info', `Enviando payload JSON al servidor central...`);
    await new Promise(r => setTimeout(r, 500));
    addLog('success', `Telemetría enviada con éxito. Documento guardado. ID: telemetry_mock_${Math.random().toString(36).substring(7)}`);
    setIsSending(false);
  };

  return (
    <SandboxLayout
      title="Telemetría Centralizada"
      description="Simula el servicio centralizado de telemetría y envío asíncrono de reportes de facturación de marca blanca."
      controls={[
        { label: 'Cliente ID', type: 'text', value: clientId, onChange: setClientId },
        { label: 'Monto Venta', type: 'text', value: salesAmount, onChange: setSalesAmount },
        { label: 'Esquema', type: 'select', value: billingMode, options: ['percentage', 'fixed_per_service', 'flat_monthly'], onChange: setBillingMode },
        { label: 'Comisión %', type: 'text', value: commissionPercent, onChange: setCommissionPercent },
      ]}
    >
      <div className="w-full space-y-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">telemetry_terminal.log</span>
          </div>
          
          {/* Terminal Logs */}
          <div className="p-4 h-48 overflow-y-auto space-y-2 font-mono text-[10px] leading-relaxed scrollbar-thin">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className={
                  log.type === 'success' ? 'text-emerald-400 font-semibold' :
                  log.type === 'error' ? 'text-red-400 font-semibold' :
                  log.type === 'info' ? 'text-cyan-400' : 'text-slate-300'
                }>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSendTelemetry}
          disabled={isSending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
        >
          {isSending ? (
            <>
              <Loader size={13} className="animate-spin" />
              Enviando Telemetría...
            </>
          ) : (
            <>
              <Zap size={13} />
              Enviar Reporte de Telemetría (Simulación)
            </>
          )}
        </button>
      </div>
    </SandboxLayout>
  );
}
