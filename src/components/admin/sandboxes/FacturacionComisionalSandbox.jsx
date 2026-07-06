import React, { useState, useRef, useCallback } from 'react';
import { Receipt, X, ShoppingBag, Wallet, TrendingUp, BarChart3, Trash2, Save, Activity, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

function DeveloperBillingPanel({
  billingMetrics,
  isLoading = false,
  orders = [],
  config = {},
  onExportPDF = () => {},
  onClose = () => {}
}) {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const formatMoney = (value) => {
    return `$${Number(value || 0).toLocaleString('es-CO', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (!clientX || !clientY) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (!clientX || !clientY) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL('image/png');
    onExportPDF({ signatureDataUrl });
    setIsSignatureModalOpen(false);
  };

  const handleOpenSignature = () => {
    setIsSignatureModalOpen(true);
    setTimeout(() => {
      clearCanvas();
    }, 80);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-teal-500/5 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 -translate-y-8 translate-x-8" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Receipt size={24} className="text-emerald-500" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold text-slate-100 mb-1">Módulo de Facturación</p>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resumen financiero, tasas de comisiones de la plataforma y firma digital de conformidad para exportación de recibos.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-2xl p-4 animate-pulse">
              <div className="h-3 bg-slate-800 rounded-full w-16 mb-3" />
              <div className="h-7 bg-slate-800 rounded-full w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag size={14} className="text-blue-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Ventas del mes</p>
            </div>
            <p className="text-xl font-black text-slate-100">{formatMoney(billingMetrics?.totalMes)}</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet size={14} className="text-emerald-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Mi comisión del mes</p>
            </div>
            <p className="text-xl font-black text-emerald-500">{formatMoney(billingMetrics?.comisionMes)}</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp size={14} className="text-purple-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Pedidos completados</p>
            </div>
            <p className="text-xl font-black text-slate-100">{billingMetrics?.pedidosMes ?? 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">este mes</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart3 size={14} className="text-amber-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Comisión acumulada</p>
            </div>
            <p className="text-xl font-black text-slate-100">{formatMoney(billingMetrics?.comisionHistorica)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">histórico total</p>
          </div>
        </div>
      )}

      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]/50 overflow-hidden">
        <div className="px-5 py-4">
          <p className="text-sm font-bold text-slate-200 mb-1">Modelo de Facturación de Instancias</p>
          <p className="text-xs text-slate-400 mb-4">Configuración del esquema de monetización del cliente.</p>
          <div className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)]/50 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400">Método Activo:</span>
              <span className="font-bold text-emerald-500 uppercase">
                {billingMetrics?.billingMode === 'percentage' && 'Porcentaje por Venta'}
                {billingMetrics?.billingMode === 'fixed_per_service' && 'Valor Fijo por Servicio'}
                {billingMetrics?.billingMode === 'flat_monthly' && 'Pago Mensual Fijo'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-[var(--color-border)]/50 pt-2.5">
              <span className="font-semibold text-slate-400">Tarifa Pactada:</span>
              <span className="font-bold text-slate-200">
                {billingMetrics?.billingMode === 'percentage' && `${billingMetrics?.comisionPorcentaje}%`}
                {billingMetrics?.billingMode === 'fixed_per_service' && `${formatMoney(billingMetrics?.montoFijoServicio)} por pedido`}
                {billingMetrics?.billingMode === 'flat_monthly' && `${formatMoney(billingMetrics?.pagoMensualFijo)} al mes`}
              </span>
            </div>
            {billingMetrics?.enableDianBilling && (
              <div className="flex justify-between items-center text-xs border-t border-[var(--color-border)]/50 pt-2.5">
                <span className="font-semibold text-slate-400">Facturación DIAN:</span>
                <span className="font-bold text-amber-500">{formatMoney(billingMetrics?.costoPorFacturaDian)} por factura</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isLoading && billingMetrics && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]/50">
            <p className="text-sm font-bold text-slate-200">Resumen de comisiones</p>
            <p className="text-xs text-slate-400">Totales calculados sobre pedidos completados</p>
          </div>
          <div className="divide-y divide-slate-800/50">
            {[
              { label: 'Ventas del mes', value: formatMoney(billingMetrics.totalMes), sub: `${billingMetrics.pedidosMes} pedidos completados` },
              { label: 'Comisión del mes', value: formatMoney(billingMetrics.comisionMes), highlight: true },
              { label: 'Total ventas histórico', value: formatMoney(billingMetrics.totalHistorico), sub: 'Todos los tiempos' },
              { label: 'Comisión histórica acumulada', value: formatMoney(billingMetrics.comisionHistorica), highlight: true },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{row.label}</p>
                  {row.sub && <p className="text-[10px] text-slate-400 mt-0.5">{row.sub}</p>}
                </div>
                <p className={`text-sm font-black ${row.highlight ? 'text-emerald-500' : 'text-slate-200'}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]/50 p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-200 mb-1">Generar Recibo y Firma de Conformidad</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Genera el recibo de comisiones de la plataforma firmado digitalmente para su archivo legal.
            </p>
          </div>
          <button
            onClick={handleOpenSignature}
            className="w-full h-11 px-5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-sm border-none"
          >
            <Receipt size={16} />
            Firmar y Exportar Recibo del Mes
          </button>
        </div>
      )}

      {!isLoading && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]/50 p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-200 mb-1">Telemetría y Diagnóstico de Canal</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Envía un error simulado o fuerza la sincronización de telemetría para comprobar la conexión activa con la consola central.
            </p>
          </div>
          
          {message && (
            <div className={`p-4 rounded-xl flex items-start gap-3 text-left border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
              {message.type === 'error' ? <AlertTriangle size={18} className="shrink-0" /> : <CheckCircle size={18} className="shrink-0" />}
              <span className="text-xs font-bold leading-relaxed">{message.text}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={async () => {
                setLoading(true);
                setMessage(null);
                try {
                  await new Promise(resolve => setTimeout(resolve, 1200));
                  setMessage({
                    type: 'success',
                    text: '¡Reporte de error de prueba (Sandbox Mock) simulado con éxito! Evento registrado en la simulación.'
                  });
                } catch (err) {
                  setMessage({
                    type: 'error',
                    text: `Fallo al reportar: ${err.message}`
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full sm:w-auto px-6 min-h-11 py-2.5 bg-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm border-none text-center"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin shrink-0" />
              ) : (
                <AlertTriangle size={16} className="shrink-0" />
              )}
              <span className="text-center leading-tight">Enviar Error de Prueba</span>
            </button>

            <button
              onClick={async () => {
                setLoading(true);
                setMessage(null);
                try {
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  setMessage({
                    type: 'success',
                    text: '¡Telemetría de facturación (Billing Sandbox Mock) simulada con éxito!'
                  });
                } catch (err) {
                  setMessage({
                    type: 'error',
                    text: `Fallo al reportar telemetría: ${err.message}`
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full sm:w-auto px-6 min-h-11 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm border-none text-center"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin shrink-0" />
              ) : (
                <Activity size={16} className="shrink-0" />
              )}
              <span className="text-center leading-tight">Enviar Telemetría de Facturación</span>
            </button>
          </div>
        </div>
      )}

      {isSignatureModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSignatureModalOpen(false)}
          />
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-3xl p-6 shadow-2xl relative max-w-sm w-full space-y-4 z-10 text-slate-200">
            <div className="flex items-center justify-between border-b border-[var(--color-border)]/50 pb-3">
              <div>
                <h3 className="text-sm font-bold">Firma de Conformidad</h3>
                <p className="text-[10px] text-slate-400">Dibuja la firma táctil del cliente en el recuadro</p>
              </div>
              <button 
                onClick={() => setIsSignatureModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="relative border border-[var(--color-border)]/50 rounded-2xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={330}
                height={160}
                className="w-full h-[160px] block touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCanvas}
                className="flex-1 h-10 border border-[var(--color-border)]/50 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} /> Limpiar
              </button>
              <button
                onClick={handleExport}
                className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save size={14} /> Confirmar y Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacturacionComisionalSandbox() {
  const { showAlert } = useAlertConfirm();
  const [billingMode, setBillingMode] = useState('percentage');
  const [commissionPercent, setCommissionPercent] = useState('1.5');
  const [fixedFee, setFixedFee] = useState('500');
  const [flatFee, setFlatFee] = useState('50000');
  const [enableDian, setEnableDian] = useState(false);
  const [dianFee, setDianFee] = useState('150');
  
  const totalMes = 2500000;
  const pedidosMes = 45;
  
  let comisionMes = 0;
  if (billingMode === 'percentage') {
    comisionMes = (totalMes * Number(commissionPercent)) / 100;
  } else if (billingMode === 'fixed_per_service') {
    comisionMes = pedidosMes * Number(fixedFee);
  } else if (billingMode === 'flat_monthly') {
    comisionMes = Number(flatFee);
  }
  
  if (enableDian) {
    comisionMes += 20 * Number(dianFee);
  }
  
  const billingMetrics = {
    totalMes,
    comisionMes,
    pedidosMes,
    comisionHistorica: comisionMes * 3.4,
    totalHistorico: totalMes * 3.4,
    billingMode,
    comisionPorcentaje: Number(commissionPercent),
    montoFijoServicio: Number(fixedFee),
    pagoMensualFijo: Number(flatFee),
    enableDianBilling: enableDian,
    costoPorFacturaDian: Number(dianFee)
  };

  const handleExportPDF = async ({ signatureDataUrl }) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const primaryColor = [99, 102, 241];
      const darkColor = [15, 23, 42];

      doc.setFillColor(...darkColor);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("PROTOTIPE", 15, 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("MOTOR DE APLICACIONES A LA MEDIDA", 15, 26);

      doc.setFontSize(10);
      doc.text(`Nº RECIBO: REC-${Math.floor(100000 + Math.random() * 900000)}`, 140, 15);
      doc.text(`FECHA: ${new Date().toLocaleDateString('es-CO')}`, 140, 21);
      doc.text(`ENTORNO: PRODUCCIÓN`, 140, 27);

      doc.setTextColor(...darkColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("INFORMACIÓN DEL COMERCIO", 15, 52);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Cliente ID: smartfix-ventas`, 15, 60);
      doc.text(`Modelo Comercial: ${
        billingMode === 'percentage' ? 'Porcentaje de Comisión' :
        billingMode === 'fixed_per_service' ? 'Valor Fijo por Pedido' : 'Tarifa Plana Mensual'
      }`, 15, 66);
      doc.text(`Tarifa Pactada: ${
        billingMode === 'percentage' ? `${commissionPercent}%` :
        billingMode === 'fixed_per_service' ? `$${fixedFee} por pedido` : `$${flatFee} al mes`
      }`, 15, 72);

      doc.setFont("helvetica", "bold");
      doc.text("RESUMEN DE COMISIONES DEL PERÍODO", 15, 88);
      
      const summaryData = [
        ["Ventas Consolidadas del Mes:", `$${totalMes.toLocaleString()}`],
        ["Pedidos Completados:", `${pedidosMes} transacciones`],
        ["Comisión de Plataforma:", `$${comisionMes.toLocaleString()}`]
      ];

      let startY = 96;
      summaryData.forEach(([label, val]) => {
        doc.setFont("helvetica", "normal");
        doc.text(label, 15, startY);
        doc.setFont("helvetica", "bold");
        doc.text(val, 140, startY);
        startY += 8;
      });

      doc.setFont("helvetica", "bold");
      doc.text("HISTORIAL DE PEDIDOS AUDITADOS (MOCK)", 15, 132);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 138, 180, 8, 'F');
      doc.setTextColor(71, 85, 105);
      doc.text("ID PEDIDO", 20, 143);
      doc.text("FECHA", 60, 143);
      doc.text("MONTO VENTA", 110, 143);
      doc.text("COMISIÓN", 160, 143);

      const mockOrders = [
        { id: "ORD-0891", date: "06-06 10:15", amount: 150000, comm: billingMode === 'percentage' ? 150000 * Number(commissionPercent) / 100 : Number(fixedFee) },
        { id: "ORD-0892", date: "06-06 10:30", amount: 280000, comm: billingMode === 'percentage' ? 280000 * Number(commissionPercent) / 100 : Number(fixedFee) },
        { id: "ORD-0893", date: "06-06 10:45", amount: 95000,  comm: billingMode === 'percentage' ? 95000 * Number(commissionPercent) / 100 : Number(fixedFee) }
      ];

      let orderY = 152;
      mockOrders.forEach(o => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...darkColor);
        doc.text(o.id, 20, orderY);
        doc.text(o.date, 60, orderY);
        doc.text(`$${o.amount.toLocaleString()}`, 110, orderY);
        doc.text(`$${o.comm.toLocaleString()}`, 160, orderY);
        orderY += 8;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("FIRMA DE CONFORMIDAD DEL CLIENTE", 15, 190);
      
      doc.rect(15, 195, 80, 35);
      doc.addImage(signatureDataUrl, 'PNG', 20, 198, 70, 28);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Este recibo digital ha sido firmado y certificado electrónicamente.", 15, 245);
      doc.text("Verificación con Telemetry Token único del cliente.", 15, 250);

      doc.save(`Recibo_Comisiones_smartfix_${new Date().toISOString().slice(0, 7)}.pdf`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      showAlert({
        title: 'Error de Exportación',
        message: "Fallo al exportar PDF: " + err.message,
        variant: 'error'
      });
    }
  };

  return (
    <SandboxLayout
      title="Facturación Comisional"
      description="Panel de comisiones de plataforma con soporte multiesquema y captura de firma táctil para recibo."
      controls={[
        { label: 'Esquema', type: 'select', value: billingMode, options: ['percentage', 'fixed_per_service', 'flat_monthly'], onChange: setBillingMode },
        { label: 'Comisión %', type: 'text', value: commissionPercent, onChange: setCommissionPercent },
        { label: 'Fijo x Servicio', type: 'text', value: fixedFee, onChange: setFixedFee },
        { label: 'Pago Plano', type: 'text', value: flatFee, onChange: setFlatFee },
        { label: 'Cobro DIAN', type: 'toggle', value: enableDian, onChange: setEnableDian, labels: ['No', 'Sí'] },
      ]}
    >
      <div className="w-full bg-[var(--color-bg)]/40 p-2 rounded-2xl">
        <DeveloperBillingPanel 
          billingMetrics={billingMetrics}
          isLoading={false}
          orders={[]}
          config={{}}
          onExportPDF={handleExportPDF}
        />
      </div>
    </SandboxLayout>
  );
}
