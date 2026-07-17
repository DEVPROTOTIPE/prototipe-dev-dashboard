import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { exportCommissionReceiptPDF } from '../../../services/pdfService';
import CustomSelect from '../../ui/CustomSelect';

export default function GeneracionPdfSandbox() {
  // Estados para simular el reporte de facturación comisional
  const [clientId, setClientId] = useState('ventas-smartfix');
  const [periodo, setPeriodo] = useState('2026-07');
  const [totalVentas, setTotalVentas] = useState(15000000);
  const [comisionPorcentaje, setComisionPorcentaje] = useState(3);
  const [estadoPago, setEstadoPago] = useState('pendiente');
  const [loading, setLoading] = useState(false);

  // Calcular valores simulados
  const comisionValor = Math.round(totalVentas * (comisionPorcentaje / 100));

  const handleExportPDF = () => {
    setLoading(true);
    try {
      const reportPayload = {
        clientId,
        periodo,
        totalVentas,
        comisionPorcentaje,
        comisionValor,
        estadoPago,
        updatedAt: { toDate: () => new Date() }
      };
      exportCommissionReceiptPDF(reportPayload);
    } catch (error) {
      console.error('Error exportando PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SandboxLayout
      title="Servicio de Generación PDF Dinámico (generacion_pdf)"
      description="Playground interactivo para simular el comportamiento del generador de PDF usando jsPDF y exportar un recibo comisional real en caliente."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">ID de Instancia Cliente</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Período de Facturación</label>
            <input
              type="text"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              placeholder="AAAA-MM"
              className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Ventas Totales ($ COP)</label>
            <input
              type="number"
              value={totalVentas}
              onChange={(e) => setTotalVentas(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Comisión (%)</label>
            <CustomSelect
              value={String(comisionPorcentaje)}
              onChange={(val) => setComisionPorcentaje(Number(val))}
              options={[
                { value: '1', label: '1% (Mínimo Ecosistema)' },
                { value: '2', label: '2%' },
                { value: '3', label: '3% (Estándar)' },
                { value: '4', label: '4%' },
                { value: '5', label: '5% (Límite Máximo)' }
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Estado del Pago</label>
            <CustomSelect
              value={estadoPago}
              onChange={(val) => setEstadoPago(val)}
              options={[
                { value: 'pendiente', label: 'PENDIENTE' },
                { value: 'pagado', label: 'PAGADO' }
              ]}
            />
          </div>
        </div>
      }
    >
      <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] min-h-[300px] flex flex-col justify-between" style={{ color: 'var(--color-text)' }}>
        <div className="space-y-6">
          {/* Cabecera de previsualización */}
          <div className="flex justify-between items-start border-b border-[var(--color-border)] pb-4">
            <div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Previsualización de Documento</span>
              <h3 className="text-sm font-bold text-[var(--color-text)] mt-1">Recibo de Licencia Operativa</h3>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Instancia: {clientId} | Periodo: {periodo}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider ${
              estadoPago === 'pagado'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {estadoPago.toUpperCase()}
            </span>
          </div>

          {/* Tabla de Conceptos */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs py-1 border-b border-[var(--color-border)]/50">
              <span className="text-[var(--color-text-muted)]">Ventas Totales Registradas</span>
              <span className="font-mono text-[var(--color-text)]">$ {totalVentas.toLocaleString()} COP</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-[var(--color-border)]/50">
              <span className="text-[var(--color-text-muted)]">Tasa Comisional Pactada</span>
              <span className="font-mono text-[var(--color-text)]">{comisionPorcentaje}%</span>
            </div>
            <div className="flex justify-between text-xs py-2 bg-[var(--color-surface-2)] px-3 rounded-lg">
              <span className="font-bold text-[var(--color-text)]">Total Comisión a Transferir</span>
              <span className="font-mono font-black text-indigo-400">$ {comisionValor.toLocaleString()} COP</span>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <button
          onClick={handleExportPDF}
          disabled={loading}
          className="mt-6 w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 border-none cursor-pointer active:scale-98 disabled:opacity-50"
        >
          {loading ? 'Generando PDF...' : 'Descargar Recibo en PDF Real'}
        </button>
      </div>
    </SandboxLayout>
  );
}
