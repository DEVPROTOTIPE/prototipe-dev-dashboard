import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { ShieldCheck, Calendar, Clock, ChevronDown, ChevronUp, FileText, Check } from 'lucide-react';

// Recreación inline del componente
function TarjetaGarantiaContratos({
  contractData = {
    id: 'CTR-9082-2026',
    clientName: 'Almacenes Éxito S.A.',
    equipmentModel: 'Condensadora Carrier 24k BTU Inverter',
    startDate: '2025-06-01',
    endDate: '2026-06-01',
    compressorWarrantyYears: 5,
    compressorStartDate: '2025-06-01',
    visitsHistory: [
      { id: 'v1', date: '2025-09-12', technician: 'Ing. Carlos Ruiz', status: 'Firmado', type: 'Mantenimiento Preventivo' },
      { id: 'v2', date: '2025-12-15', technician: 'Ing. Juan Rojas', status: 'Firmado', type: 'Limpieza de serpentines' },
      { id: 'v3', date: '2026-03-10', technician: 'Ing. Carlos Ruiz', status: 'Firmado', type: 'Control de presión de gas' }
    ]
  }
}) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => {
    const start = new Date(contractData.startDate);
    const end = new Date(contractData.endDate);
    const today = new Date();

    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today - start) / (1000 * 60 * 60 * 24);
    
    let percent = (elapsedDays / totalDays) * 100;
    percent = Math.min(100, Math.max(0, percent));

    const remainingDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    const isExpired = remainingDays <= 0;
    const isCloseToExpire = !isExpired && remainingDays <= 45;

    const compressorEnd = new Date(contractData.compressorStartDate);
    compressorEnd.setFullYear(compressorEnd.getFullYear() + contractData.compressorWarrantyYears);
    const warrantyRemainingMonths = Math.ceil((compressorEnd - today) / (1000 * 60 * 60 * 24 * 30.4));
    const isCompressorWarrantyActive = warrantyRemainingMonths > 0;

    return {
      progressPercent: Math.round(percent),
      remainingDays: isExpired ? 0 : remainingDays,
      isExpired,
      isCloseToExpire,
      isCompressorWarrantyActive,
      compressorWarrantyMonths: Math.max(0, warrantyRemainingMonths)
    };
  }, [contractData]);

  const getStatusBadge = () => {
    if (stats.isExpired) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">
          Contrato Expirado
        </span>
      );
    }
    if (stats.isCloseToExpire) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
          Por Vencer (Pocos días)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20">
        Póliza Vigente
      </span>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[9px] font-mono text-[var(--color-text-muted)] block">ID Contrato: {contractData.id}</span>
          <h3 className="text-xs font-bold text-[var(--color-text)] mt-0.5">{contractData.equipmentModel}</h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between items-center text-[10px] text-[var(--color-text-muted)]">
          <span>Progreso del Contrato Anual</span>
          <span className="font-mono">{stats.progressPercent}% Transcurrido</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              stats.isExpired
                ? 'bg-red-500'
                : stats.isCloseToExpire
                  ? 'bg-amber-500'
                  : 'bg-[var(--color-primary)]'
            }`}
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-[var(--color-text-muted)]">
          <span>Inicio: {contractData.startDate}</span>
          <span>Expira: {contractData.endDate}</span>
        </div>
      </div>

      <div className="p-3 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-2.5 text-xs mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className={stats.isCompressorWarrantyActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
          <div>
            <span className="text-[10px] font-bold text-[var(--color-text)] block">
              Garantía Compresor de Fábrica
            </span>
            <span className="text-[9px] text-[var(--color-text-muted)] block">
              Cobertura total del componente motriz.
            </span>
          </div>
        </div>
        <div className="text-right">
          {stats.isCompressorWarrantyActive ? (
            <span className="font-mono text-[10px] font-extrabold text-[var(--color-primary)]">
              {stats.compressorWarrantyMonths} Meses Restantes
            </span>
          ) : (
            <span className="text-[10px] font-bold text-red-500">Expirada</span>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--color-primary)] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <FileText size={12} />
            Historial de Mantenimientos ({contractData.visitsHistory.length})
          </span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {expanded && (
          <div className="space-y-2 mt-3 animate-slideDown">
            {contractData.visitsHistory.map((visit) => (
              <div 
                key={visit.id} 
                className="p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 flex justify-between items-center text-[10px]"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[var(--color-text)] block">{visit.type}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)] block">{visit.technician}</span>
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] block flex items-center gap-1">
                    <Calendar size={10} /> {visit.date}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-green-500 font-bold bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-md">
                  <Check size={8} />
                  <span>{visit.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TarjetaGarantiaContratosSandbox() {
  return (
    <SandboxLayout
      title="Tarjeta de Garantías & Contratos HVAC"
      description="Visualizador premium de vigencia temporal de contratos de servicio con barra de progreso reactiva y acordeón desplegable."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <TarjetaGarantiaContratos />
      </div>
    </SandboxLayout>
  );
}
