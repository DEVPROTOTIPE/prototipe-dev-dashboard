import React, { useState, useRef, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

export default function CajaDiariaPOSSandbox() {
  const { showAlert } = useAlertConfirm();
  const [userName, setUserName] = useState("Sergio Agudelo");
  const [currencySymbol, setCurrencySymbol] = useState("COP");

  // --- COPIA FIEL DEL COMPONENTE CAJADIARIAPOS AUTOCONTENIDO ---
  const [isOpen, setIsOpen] = useState(false);
  const [montoApertura, setMontoApertura] = useState("");
  const [transacciones, setTransacciones] = useState([]);
  const [fechaApertura, setFechaApertura] = useState(null);
  
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txTipo, setTxTipo] = useState("egreso"); 
  const [txMonto, setTxMonto] = useState("");
  const [txDesc, setTxDesc] = useState("");

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [montoFisico, setMontoFisico] = useState("");
  const [cierreCompletado, setCierreCompletado] = useState(false);
  const [reporteCierre, setReporteCierre] = useState(null);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const totalIngresosAdicionales = transacciones
    .filter(t => t.tipo === "ingreso")
    .reduce((sum, t) => sum + Number(t.monto), 0);

  const totalEgresosAdicionales = transacciones
    .filter(t => t.tipo === "egreso")
    .reduce((sum, t) => sum + Number(t.monto), 0);

  const saldoEsperado = Number(montoApertura || 0) + totalIngresosAdicionales - totalEgresosAdicionales;

  const formatCurrency = (val) => {
    return `${currencySymbol} ${Number(val).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
  };

  const handleOpenShift = (e) => {
    e.preventDefault();
    if (!montoApertura || Number(montoApertura) < 0) return;

    const newFecha = new Date().toISOString();
    setFechaApertura(newFecha);
    setIsOpen(true);
    setTransacciones([]);
    setCierreCompletado(false);
    setReporteCierre(null);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!txMonto || Number(txMonto) <= 0 || !txDesc.trim()) return;

    const newTx = {
      id: Date.now().toString(),
      tipo: txTipo,
      monto: Number(txMonto),
      descripcion: txDesc.trim(),
      hora: new Date().toISOString()
    };

    setTransacciones([...transacciones, newTx]);
    setIsTxModalOpen(false);
    setTxMonto("");
    setTxDesc("");
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    isDrawing.current = true;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (isCloseModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#a78bfa'; 
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isCloseModalOpen]);

  const handleConfirmCloseShift = (e) => {
    e.preventDefault();
    if (!montoFisico || Number(montoFisico) < 0) return;

    let firmaBase64 = "";
    if (canvasRef.current) {
      firmaBase64 = canvasRef.current.toDataURL('image/png');
    }

    const valorFisico = Number(montoFisico);
    const descuadreVal = valorFisico - saldoEsperado;

    const summary = {
      fechaApertura,
      fechaCierre: new Date().toISOString(),
      montoApertura: Number(montoApertura),
      ingresosAuxiliares: totalIngresosAdicionales,
      egresosAuxiliares: totalEgresosAdicionales,
      saldoEsperado,
      montoFisico: valorFisico,
      descuadre: descuadreVal,
      responsable: userName,
      firma: firmaBase64
    };

    setReporteCierre(summary);
    setCierreCompletado(true);
    setIsOpen(false);
    setIsCloseModalOpen(false);
  };

  const handleShareReport = () => {
    if (!reporteCierre) return;
    
    const statusText = reporteCierre.descuadre === 0 
      ? "✅ CAJA CUADRADA" 
      : reporteCierre.descuadre < 0 
        ? `⚠️ FALTANTE: ${formatCurrency(Math.abs(reporteCierre.descuadre))}` 
        : `⚠️ SOBRANTE: ${formatCurrency(reporteCierre.descuadre)}`;

    const text = `*CIERRE DE CAJA DIARIA*
----------------------------
👤 *Vendedor:* ${reporteCierre.responsable}
📅 *Apertura:* ${new Date(reporteCierre.fechaApertura).toLocaleString()}
📅 *Cierre:* ${new Date(reporteCierre.fechaCierre).toLocaleString()}
----------------------------
💰 *Base Inicial:* ${formatCurrency(reporteCierre.montoApertura)}
📥 *Ingresos Auxiliar:* ${formatCurrency(reporteCierre.ingresosAuxiliares)}
📤 *Egresos Auxiliar:* ${formatCurrency(reporteCierre.egresosAuxiliares)}
💵 *Dinero Esperado:* ${formatCurrency(reporteCierre.saldoEsperado)}
💵 *Dinero Físico:* ${formatCurrency(reporteCierre.montoFisico)}
----------------------------
📊 *Estado:* ${statusText}`;

    navigator.clipboard.writeText(text);
    showAlert({
      title: 'Reporte Copiado',
      message: 'Reporte de prueba copiado al portapapeles. ¡Listo para compartir!',
      variant: 'success'
    });
  };

  return (
    <SandboxLayout
      title="CajaDiariaPOS"
      description="Control diario del flujo de caja, arqueo conciliado e historial de transacciones con firma."
      controls={[
        { label: 'Responsable', type: 'text', value: userName, onChange: setUserName },
        { label: 'Moneda', type: 'select', value: currencySymbol, options: ['COP', 'USD', 'MXN', 'ARS'], onChange: setCurrencySymbol }
      ]}
    >
      <div className="w-full bg-[var(--color-bg)] rounded-xl py-6 px-2 min-h-[450px] flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto space-y-4">
          
          {/* A. ESTADO CERRADO */}
          {!isOpen && !cierreCompletado && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-lg max-w-sm mx-auto space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Caja Diaria Cerrada</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Ingresa la base inicial en efectivo.</p>
              </div>

              <form onSubmit={handleOpenShift} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Base de Efectivo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-[var(--color-text-muted)]">{currencySymbol}</span>
                    <input
                      type="number"
                      placeholder="0"
                      required
                      value={montoApertura}
                      onChange={(e) => setMontoApertura(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition-all rounded-xl text-white text-xs font-semibold"
                >
                  Iniciar Turno
                </button>
              </form>
            </div>
          )}

          {/* B. ESTADO ABIERTO */}
          {isOpen && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 inline-block">
                    Turno Activo
                  </span>
                  <h3 className="text-sm font-bold text-[var(--color-text)]">Turno de {userName}</h3>
                </div>
                <button
                  onClick={() => setIsCloseModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-98 transition-all rounded-xl text-white text-xs font-semibold"
                >
                  Cerrar Turno
                </button>
              </div>

              {/* Grid Metricas */}
              <div className="grid grid-cols-2 gap-3">
                {/* Card 1: Base Inicial */}
                <div className="flex items-center gap-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-3 min-w-0" title={formatCurrency(montoApertura)}>
                  <div className="w-9 h-9 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">Base Inicial</span>
                    <p className="text-xs font-black text-[var(--color-text)] truncate mt-0.5">{formatCurrency(montoApertura)}</p>
                  </div>
                </div>

                {/* Card 2: Esperado */}
                <div className="flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3 min-w-0" title={formatCurrency(saldoEsperado)}>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M12 7h.01M15 11h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Esperado</span>
                    <p className="text-xs font-black text-indigo-400 truncate mt-0.5">{formatCurrency(saldoEsperado)}</p>
                  </div>
                </div>

                {/* Card 3: Ingresos */}
                <div className="flex items-center gap-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-3 min-w-0" title={formatCurrency(totalIngresosAdicionales)}>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Ingresos (+)</span>
                    <p className="text-xs font-black text-emerald-400 truncate mt-0.5">+{formatCurrency(totalIngresosAdicionales)}</p>
                  </div>
                </div>

                {/* Card 4: Egresos */}
                <div className="flex items-center gap-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-3 min-w-0" title={formatCurrency(totalEgresosAdicionales)}>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Egresos (-)</span>
                    <p className="text-xs font-black text-rose-400 truncate mt-0.5">-{formatCurrency(totalEgresosAdicionales)}</p>
                  </div>
                </div>
              </div>

              {/* Movimientos */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">Movimientos de Turno</span>
                  <button
                    onClick={() => setIsTxModalOpen(true)}
                    className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-lg text-[10px] font-bold hover:bg-indigo-500/20 transition-all shrink-0"
                  >
                    + Agregar Movimiento
                  </button>
                </div>

                {transacciones.length === 0 ? (
                  <div className="border border-dashed border-[var(--color-border)] rounded-xl p-6 text-center text-xs text-[var(--color-text-muted)]">
                    Sin movimientos registrados.
                  </div>
                ) : (
                  <div className="border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)] max-h-40 overflow-y-auto">
                    {transacciones.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-2.5 bg-[var(--color-bg)] text-xs">
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-[var(--color-text)] truncate">{tx.descripcion}</p>
                          <p className="text-[9px] text-[var(--color-text-muted)]">
                            {new Date(tx.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`font-bold ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(tx.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* C. ESTADO FINAL COMPLETADO */}
          {cierreCompletado && reporteCierre && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xl max-w-md mx-auto space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto text-violet-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[var(--color-text)]">Cierre Procesado</h3>
              </div>

              <div className={`border rounded-xl p-3 text-center space-y-0.5 ${
                reporteCierre.descuadre === 0
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : reporteCierre.descuadre < 0
                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                    : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
              }`}>
                <span className="text-[9px] uppercase tracking-wider font-semibold">Estado de Arqueo</span>
                <p className="text-base font-black">
                  {reporteCierre.descuadre === 0
                    ? "CAJA CUADRADA"
                    : reporteCierre.descuadre < 0
                      ? `FALTANTE: ${formatCurrency(Math.abs(reporteCierre.descuadre))}`
                      : `SOBRANTE: ${formatCurrency(reporteCierre.descuadre)}`
                  }
                </p>
              </div>

              <div className="border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)] text-xs bg-[var(--color-bg)]">
                <div className="flex justify-between p-2">
                  <span>Base inicial</span>
                  <span className="font-semibold">{formatCurrency(reporteCierre.montoApertura)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span>Dinero esperado</span>
                  <span className="font-semibold">{formatCurrency(reporteCierre.saldoEsperado)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span>Efectivo contado</span>
                  <span className="font-semibold text-indigo-400">{formatCurrency(reporteCierre.montoFisico)}</span>
                </div>
              </div>

              {reporteCierre.firma && (
                <div className="text-center">
                  <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Firma Registrada</span>
                  <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] inline-block p-1">
                    <img src={reporteCierre.firma} alt="Firma Cierre" className="h-16 max-w-full" />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleShareReport}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all rounded-xl text-white text-xs font-semibold"
                >
                  Copiar WhatsApp
                </button>
                <button
                  onClick={() => {
                    setCierreCompletado(false);
                    setReporteCierre(null);
                    setMontoApertura("");
                  }}
                  className="px-4 py-2 bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-border)] rounded-xl text-xs font-semibold"
                >
                  Nueva Caja
                </button>
              </div>
            </div>
          )}

          {/* MODAL 1: REGISTRO MOVIMIENTO */}
          {isTxModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-xs p-5 shadow-2xl space-y-3">
                <h4 className="text-sm font-bold text-[var(--color-text)]">Registrar Movimiento</h4>
                
                <form onSubmit={handleAddTransaction} className="space-y-3">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTxTipo("egreso")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        txTipo === "egreso"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      Salida
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxTipo("ingreso")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        txTipo === "ingreso"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      Entrada
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Valor</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1.5 text-xs text-[var(--color-text-muted)]">{currencySymbol}</span>
                      <input
                        type="number"
                        placeholder="0"
                        required
                        value={txMonto}
                        onChange={(e) => setTxMonto(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Descripción</label>
                    <input
                      type="text"
                      placeholder="Concepto..."
                      required
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsTxModalOpen(false)}
                      className="flex-1 py-1.5 bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-semibold"
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: CIERRE Y FIRMA */}
          {isCloseModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-3">
                <h4 className="text-sm font-bold text-[var(--color-text)]">Procedimiento de Cierre</h4>

                <form onSubmit={handleConfirmCloseShift} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Efectivo Contado</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-[var(--color-text-muted)]">{currencySymbol}</span>
                      <input
                        type="number"
                        placeholder="0"
                        required
                        value={montoFisico}
                        onChange={(e) => setMontoFisico(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text)] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Firma del responsable</label>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[9px] font-bold text-rose-400 hover:underline"
                      >
                        Limpiar
                      </button>
                    </div>
                    
                    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)]">
                      <canvas
                        ref={canvasRef}
                        width={300}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-28 cursor-crosshair touch-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCloseModalOpen(false)}
                      className="flex-1 py-1.5 bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-semibold"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500"
                    >
                      Finalizar Turno
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </SandboxLayout>
  );
}
