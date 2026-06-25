import React, { useState } from 'react';
import { useClientPortalStore } from '../../stores/clientPortalStore';
import { 
  Home, Cpu, DollarSign, Calendar, FileText, Activity, 
  AlertTriangle, Shield, Download, Check, RefreshCw, 
  ExternalLink, Layers, Award, Terminal, Heart, Info,
  TrendingUp, Clock, ShieldAlert, Sparkles, Receipt, ChevronRight
} from 'lucide-react';
import { exportCommissionReceiptPDF } from '../../services/pdfService';
import jsPDF from 'jspdf';

const PROJECT_STAGES = ['planning', 'development', 'testing', 'validation', 'production'];

const STAGE_LABELS = {
  planning: 'Planeación',
  development: 'Desarrollo',
  testing: 'Pruebas',
  validation: 'Validación',
  production: 'En Producción',
  paused: 'Pausado'
};

const STAGE_DESCRIPTIONS = {
  planning: 'Definición de requisitos, arquitectura inicial y diseño de flujos.',
  development: 'Codificación y ensamble del core de la aplicación y base de datos.',
  testing: 'Pruebas unitarias, simulación de carga y auditorías de seguridad.',
  validation: 'Despliegue controlado (UAT) y verificación final con el cliente.',
  production: 'Instancia productiva operando con monitoreo continuo en vivo.'
};

export default function ClientPortalDashboard() {
  const { 
    clientData, 
    project, 
    provisioningOrder, 
    followups, 
    failures, 
    billingReports, 
    activityLogs, 
    healthScore,
    isSimulated
  } = useClientPortalStore();

  const [activeTab, setActiveTab] = useState('inicio');

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-[var(--color-primary)]" size={32} />
        <p className="text-sm font-medium text-[var(--color-text-muted)]">Cargando credenciales de acceso seguro...</p>
      </div>
    );
  }

  // Helper para formato de moneda
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  // Determinar color de salud
  const getHealthColor = (score) => {
    if (score >= 85) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Excelente' };
    if (score >= 70) return { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', label: 'Bueno' };
    if (score >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Riesgo' };
    return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Crítico' };
  };

  const healthStyle = getHealthColor(healthScore);

  // Generar contrato PDF en caliente
  const handleDownloadContract = () => {
    const doc = new jsPDF();
    
    // Encabezado premium
    doc.setFillColor(99, 102, 241); // Indigo-500
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRATO DE PRESTACIÓN DE SERVICIOS', 15, 25);
    
    doc.setTextColor(31, 41, 55); // Slate-800
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let y = 55;
    doc.setFont('helvetica', 'bold');
    doc.text(`CONTRATO N°: PROT-${clientData.id.toUpperCase()}-2026`, 15, y); y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`FECHA DE INICIO: ${clientData.comercial?.fechaInicio || 'No definida'}`, 15, y); y += 6;
    doc.text(`CONTRATANTE: ${clientData.nombre}`, 15, y); y += 6;
    doc.text(`CONTRATISTA: PROTOTIPE S.A.S.`, 15, y); y += 12;
    
    doc.setFont('helvetica', 'bold');
    doc.text('CLÁUSULA PRIMERA - OBJETO DEL CONTRATO:', 15, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('PROTOTIPE S.A.S. se compromete a realizar la configuración, despliegue y mantenimiento continuo', 15, y); y += 5;
    doc.text('del Core de Software PROTOTIPE en un entorno SaaS seguro para el uso exclusivo del Contratante.', 15, y); y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('CLÁUSULA SÉGUNDA - CONDICIONES COMERCIALES:', 15, y); y += 6;
    doc.setFont('helvetica', 'normal');
    
    const billingText = clientData.comercial?.modeloMonetizacion === 'percentage' 
      ? `Cobro porcentual del ${clientData.comercial?.comisionPorcentaje}% sobre ventas totales` 
      : clientData.comercial?.modeloMonetizacion === 'fixed_per_service' 
        ? `Cobro fijo de $${(clientData.comercial?.setupValor || 0).toLocaleString()} por servicio prestado`
        : `Mensualidad fija de soporte de $${(clientData.comercial?.mensualidadValor || 0).toLocaleString()}`;

    doc.text(`- Modelo Comercial Pactado: ${billingText}.`, 15, y); y += 5;
    doc.text(`- Inversión de Setup Inicial: ${formatCurrency(clientData.comercial?.setupValor)}.`, 15, y); y += 5;
    doc.text(`- Cuota de Mensualidad Soporte: ${formatCurrency(clientData.comercial?.mensualidadValor)}.`, 15, y); y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('CLÁUSULA TERCERA - ACUERDOS DE SEGURIDAD Y DATOS:', 15, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('1. El contratante mantendrá la confidencialidad de las credenciales de acceso del portal.', 15, y); y += 5;
    doc.text('2. Las telemetrías y reportes se transmitirán bajo cifrado HTTPS directamente a Firestore.', 15, y); y += 5;
    doc.text('3. Las reglas de seguridad de la base de datos central de PROTOTIPE garantizan el aislamiento.', 15, y); y += 25;

    // Firmas
    doc.line(15, y, 95, y); doc.line(115, y, 195, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Por PROTOTIPE S.A.S.', 15, y); doc.text(`Por ${clientData.nombre}`, 115, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('Representante Legal Autorizado', 15, y); doc.text('Representante Legal Autorizado', 115, y);
    
    doc.save(`Contrato_SaaS_PROTOTIPE_${clientData.id}.pdf`);
  };

  // Stepper Activo Index
  const isPaused = project?.status === 'paused';
  const activeIndex = PROJECT_STAGES.indexOf(project?.status || 'planning');

  return (
    <div className="space-y-6">
      {/* ===== TABS NAVIGATION ===== */}
      <div className="flex gap-1.5 p-1 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)]/40 rounded-2xl overflow-x-auto scrollbar-none sticky top-14 z-40 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('inicio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 border-none ${
            activeTab === 'inicio' 
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/40'
          }`}
        >
          <Home size={14} />
          Inicio
        </button>
        <button
          onClick={() => setActiveTab('implementacion')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 border-none ${
            activeTab === 'implementacion' 
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/40'
          }`}
        >
          <Layers size={14} />
          Implementación
        </button>
        <button
          onClick={() => setActiveTab('telemetria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 border-none ${
            activeTab === 'telemetria' 
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/40'
          }`}
        >
          <Cpu size={14} />
          Telemetría
        </button>
        <button
          onClick={() => setActiveTab('facturacion')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 border-none ${
            activeTab === 'facturacion' 
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/40'
          }`}
        >
          <DollarSign size={14} />
          Facturación
        </button>
        <button
          onClick={() => setActiveTab('seguimientos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 border-none ${
            activeTab === 'seguimientos' 
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/40'
          }`}
        >
          <Calendar size={14} />
          Seguimientos
        </button>
        <button
          onClick={() => setActiveTab('documentos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 border-none ${
            activeTab === 'documentos' 
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/40'
          }`}
        >
          <FileText size={14} />
          Documentos
        </button>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="space-y-6">
        
        {/* ========================================== */}
        {/* TAB 1: INICIO (HOME)                       */}
        {/* ========================================== */}
        {activeTab === 'inicio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card Bienvenida y Salud */}
            <div className="lg:col-span-2 bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-violet-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-black uppercase tracking-wider">Cliente Conectado</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight">¡Bienvenido al Portal, {clientData.nombre}!</h1>
                <p className="text-xs text-[var(--color-text-muted)] max-w-lg">
                  Aquí tienes acceso completo a las telemetrías técnicas de tu aplicación SaaS, facturas comisionales, estado del proyecto de implementación y descarga de contratos oficiales.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-[var(--color-border)]/40 pt-4 mt-6 text-left">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold block">Contacto Principal</span>
                  <span className="text-xs font-extrabold text-[var(--color-text)] mt-0.5 block">{clientData.contacto?.nombre || 'No asignado'}</span>
                </div>
                <div className="h-6 w-px bg-[var(--color-border)]/40 hidden sm:block" />
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold block">Correo de contacto</span>
                  <span className="text-xs font-extrabold text-[var(--color-text)] mt-0.5 block font-mono">{clientData.contacto?.correo || 'No asignado'}</span>
                </div>
                <div className="h-6 w-px bg-[var(--color-border)]/40 hidden sm:block" />
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold block">Hosting de Instancia</span>
                  {clientData.tecnico?.urlHosting ? (
                    <a 
                      href={clientData.tecnico.urlHosting} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-extrabold text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {clientData.tecnico.urlHosting.replace(/^https?:\/\//, '')}
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-xs italic text-[var(--color-text-muted)] mt-0.5 block">Pendiente asignación</span>
                  )}
                </div>
              </div>
            </div>

            {/* Score Radial / Tarjeta de Salud */}
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl flex flex-col justify-between items-center text-center relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-extrabold tracking-wider">Estado Operativo</span>
                <h3 className="text-sm font-black">Salud de la Cuenta</h3>
              </div>

              <div className="relative my-4 flex items-center justify-center">
                {/* Circulo de progreso */}
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="var(--color-border)" strokeWidth="6" fill="transparent" className="opacity-30" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - healthScore / 100)}
                    className={`${healthStyle.text} transition-all duration-1000`} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black tracking-tight">{healthScore}%</span>
                  <Heart size={14} className={`${healthStyle.text} mt-0.5 fill-current`} />
                </div>
              </div>

              <div className={`w-full py-1.5 px-3 border rounded-xl text-[10px] font-extrabold uppercase tracking-wide ${healthStyle.bg} ${healthStyle.text} ${healthStyle.border}`}>
                Estado Cuenta: {healthStyle.label}
              </div>
            </div>

            {/* Mini Stepper de Implementación (Widget) */}
            <div className="lg:col-span-3 bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-[var(--color-text-muted)] tracking-wider">Estado de Implementación</h4>
                <button 
                  onClick={() => setActiveTab('implementacion')}
                  className="text-[10px] font-bold text-violet-400 hover:text-violet-300 bg-none border-none cursor-pointer flex items-center gap-1"
                >
                  Detalle del Proyecto <ChevronRight size={12} />
                </button>
              </div>

              {project ? (
                <div className="relative pt-2 pb-1">
                  {/* Línea de fondo */}
                  <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-slate-800 rounded-full -z-0" />
                  
                  {/* Línea de progreso activa */}
                  {!isPaused && activeIndex >= 0 && (
                    <div 
                      className="absolute top-[18px] left-[5%] h-0.5 bg-indigo-500 transition-all duration-500 -z-0" 
                      style={{ width: `${(activeIndex / (PROJECT_STAGES.length - 1)) * 90}%` }}
                    />
                  )}

                  {/* Burbujas del Stepper */}
                  <div className="relative z-10 flex justify-between">
                    {PROJECT_STAGES.map((stage, idx) => {
                      const isCompleted = idx < activeIndex;
                      const isActive = idx === activeIndex && !isPaused;
                      
                      let dotBg = 'bg-slate-900 border-slate-700 text-slate-500';
                      if (isCompleted) {
                        dotBg = 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]';
                      } else if (isActive) {
                        dotBg = 'bg-indigo-500 border-indigo-400 text-white ring-4 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)]';
                      } else if (isPaused && idx === activeIndex) {
                        dotBg = 'bg-red-600 border-red-500 text-white ring-4 ring-red-500/20';
                      }

                      return (
                        <div key={stage} className="flex flex-col items-center gap-1.5 w-[18%] text-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${dotBg}`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[8.5px] font-bold block ${
                            isActive ? 'text-indigo-400 font-extrabold' : 
                            isPaused && idx === activeIndex ? 'text-red-400 font-extrabold' :
                            isCompleted ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
                          }`}>
                            {STAGE_LABELS[stage]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)]/40 rounded-2xl flex items-center gap-3">
                  <Info size={16} className="text-slate-400" />
                  <p className="text-xs text-[var(--color-text-muted)]">No se encontró un proyecto de implementación activo configurado.</p>
                </div>
              )}
            </div>

            {/* Actividades Recientes */}
            <div className="lg:col-span-3 bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <h4 className="text-xs font-black uppercase text-[var(--color-text-muted)] tracking-wider">Bitácora de Auditoría Reciente</h4>
              {activityLogs.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 text-xs text-left">
                  {activityLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                        <Terminal size={12} />
                      </div>
                      <div className="flex-grow space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--color-text)]">{log.action}</span>
                          <span className="text-[9px] text-[var(--color-text-muted)]">
                            {log.timestamp ? (log.timestamp.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString()) : 'N/A'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic">No se han registrado actividades de auditoría para esta cuenta.</p>
              )}
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: IMPLEMENTACIÓN                      */}
        {/* ========================================== */}
        {activeTab === 'implementacion' && (
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black">Estado del Proyecto de Integración</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Monitorea el avance de la implementación del Core PROTOTIPE en tu infraestructura.</p>
            </div>

            {project ? (
              <div className="space-y-6">
                {/* Stepper visual duplicado pero interactivo */}
                <div className="relative pt-2 pb-1">
                  <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-slate-800 rounded-full -z-0" />
                  
                  {!isPaused && activeIndex >= 0 && (
                    <div 
                      className="absolute top-[18px] left-[5%] h-0.5 bg-indigo-500 transition-all duration-500 -z-0" 
                      style={{ width: `${(activeIndex / (PROJECT_STAGES.length - 1)) * 90}%` }}
                    />
                  )}

                  <div className="relative z-10 flex justify-between">
                    {PROJECT_STAGES.map((stage, idx) => {
                      const isCompleted = idx < activeIndex;
                      const isActive = idx === activeIndex && !isPaused;
                      
                      let dotBg = 'bg-slate-900 border-slate-700 text-slate-500';
                      if (isCompleted) {
                        dotBg = 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]';
                      } else if (isActive) {
                        dotBg = 'bg-indigo-500 border-indigo-400 text-white ring-4 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)]';
                      } else if (isPaused && idx === activeIndex) {
                        dotBg = 'bg-red-600 border-red-500 text-white ring-4 ring-red-500/20';
                      }

                      return (
                        <div key={stage} className="flex flex-col items-center gap-1.5 w-[18%] text-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${dotBg}`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] font-bold block ${
                            isActive ? 'text-indigo-400 font-extrabold' : 
                            isPaused && idx === activeIndex ? 'text-red-400 font-extrabold' :
                            isCompleted ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
                          }`}>
                            {STAGE_LABELS[stage]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explicación de la etapa actual */}
                <div className="p-5 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-2 text-left">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Layers size={16} />
                    <span className="text-xs font-black uppercase tracking-wider">Etapa Activa: {STAGE_LABELS[project.status]}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text)]">
                    {STAGE_DESCRIPTIONS[project.status] || 'La etapa actual se encuentra en curso de verificación técnica.'}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                    Proyecto iniciado el {project.createdAt ? (project.createdAt.toDate ? project.createdAt.toDate().toLocaleDateString() : new Date(project.createdAt).toLocaleDateString()) : 'N/A'}.
                  </p>
                </div>

                {/* Orden de Aprovisionamiento Vinculada */}
                {provisioningOrder && (
                  <div className="p-5 border border-dashed border-[var(--color-border)] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                        <Terminal size={14} className="text-cyan-400" />
                        Orden de Aprovisionamiento Relacionada
                      </h4>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        Estado de compilación y aprovisionamiento del servidor del core de tu instancia.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                        provisioningOrder.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                      }`}>
                        Aprovisionamiento: {provisioningOrder.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                        provisioningOrder.approved 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/25'
                      }`}>
                        Aprobado: {provisioningOrder.approved ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-3xl space-y-2">
                <Info className="text-slate-500 mx-auto" size={28} />
                <h3 className="text-sm font-bold">Sin proyecto asignado</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Tu cuenta se encuentra en modo activo pero no tiene un proyecto de integración mapeado.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: TELEMETRÍA                          */}
        {/* ========================================== */}
        {activeTab === 'telemetria' && (
          <div className="space-y-6">
            
            {/* Indicadores Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-5 rounded-2xl backdrop-blur-md text-left">
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Último Ping Conexión</span>
                <span className="text-xl font-black block mt-1 text-[var(--color-text)]">20 ms</span>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-1">Latencia promedio a base de datos central.</p>
              </div>
              <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-5 rounded-2xl backdrop-blur-md text-left">
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Sincronización Delta</span>
                <span className="text-xl font-black block mt-1 text-emerald-400">Activo</span>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-1">Carga delta y logs automáticos habilitados.</p>
              </div>
              <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-5 rounded-2xl backdrop-blur-md text-left">
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Errores Reportados</span>
                <span className={`text-xl font-black block mt-1 ${failures.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {failures.length} fallos
                </span>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-1">Logs acumulados en el entorno cliente.</p>
              </div>
            </div>

            {/* Listado de Errores */}
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-black uppercase text-[var(--color-text-muted)] tracking-wider text-left">Historial de Fallos Registrados</h3>
              
              {failures.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]/45 text-[var(--color-text-muted)]">
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Error</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Detalle</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Fecha</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px] text-right">Estatus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failures.map((fail) => (
                        <tr key={fail.id} className="border-b border-[var(--color-border)]/20 hover:bg-[var(--color-surface-2)]/10">
                          <td className="py-3 font-bold font-mono text-[11px] text-[var(--color-text)]">{fail.errorName || 'Error'}</td>
                          <td className="py-3 text-[var(--color-text-muted)] max-w-xs truncate">{fail.errorMessage || fail.errorMsg || 'No detail'}</td>
                          <td className="py-3 text-[var(--color-text-muted)]">
                            {fail.timestamp ? (fail.timestamp.toDate ? fail.timestamp.toDate().toLocaleString() : new Date(fail.timestamp).toLocaleString()) : 'N/A'}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                              fail.resolved 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : 'bg-red-500/10 text-red-400 border-red-500/25'
                            }`}>
                              {fail.resolved ? 'Resuelto' : 'Activo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center border border-[var(--color-border)]/45 rounded-2xl flex items-center justify-center gap-3">
                  <Check className="text-emerald-400" size={16} />
                  <p className="text-xs text-[var(--color-text-muted)]">Excelente. Tu instancia SaaS reporta cero errores técnicos acumulados.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: FACTURACIÓN                         */}
        {/* ========================================== */}
        {activeTab === 'facturacion' && (
          <div className="space-y-6">
            
            {/* Resumen del Contrato Comercial */}
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase text-[var(--color-text-muted)] tracking-wider">Esquema Tarifario de Soporte</h3>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 border border-indigo-500/20 rounded-md font-bold uppercase">
                  Pactado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold block">Inversión Setup Inicial</span>
                  <span className="text-xl font-black block text-[var(--color-text)]">
                    {formatCurrency(clientData.comercial?.setupValor)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold block">Cuota Mensual Fija</span>
                  <span className="text-xl font-black block text-[var(--color-text)]">
                    {formatCurrency(clientData.comercial?.mensualidadValor)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold block">Porcentaje de Comisión</span>
                  <span className="text-xl font-black block text-indigo-400">
                    {clientData.comercial?.modeloMonetizacion === 'percentage' 
                      ? `${clientData.comercial?.comisionPorcentaje || 0}%` 
                      : 'N/A (Fijo)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Listado de Facturación */}
            <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-black uppercase text-[var(--color-text-muted)] tracking-wider text-left">Facturas y Reportes Mensuales</h3>
              
              {billingReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]/45 text-[var(--color-text-muted)]">
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Periodo / Fecha</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Ventas Totales</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Comisión</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Mensualidad</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Total Cobrado</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px]">Estado</th>
                        <th className="py-2.5 font-extrabold uppercase text-[10px] text-right">Recibo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingReports.map((report) => (
                        <tr key={report.id} className="border-b border-[var(--color-border)]/20 hover:bg-[var(--color-surface-2)]/10">
                          <td className="py-3 font-bold text-[var(--color-text)]">
                            {report.periodo || report.date || 'N/A'}
                          </td>
                          <td className="py-3 text-[var(--color-text-muted)]">
                            {formatCurrency(report.totalVentas)}
                          </td>
                          <td className="py-3 text-[var(--color-text-muted)]">
                            {formatCurrency(report.comisionValor)}
                          </td>
                          <td className="py-3 text-[var(--color-text-muted)]">
                            {formatCurrency(report.mensualidadValor)}
                          </td>
                          <td className="py-3 font-bold text-[var(--color-text)]">
                            {formatCurrency(report.totalCobrado)}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                              report.status === 'paid' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            }`}>
                              {report.status === 'paid' ? 'Pagado' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                exportCommissionReceiptPDF(report);
                              }}
                              className="p-1 text-violet-400 hover:text-violet-300 bg-none border border-transparent cursor-pointer hover:bg-violet-500/10 rounded"
                              title="Descargar Recibo PDF"
                            >
                              <Download size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic">No se han registrado reportes comisionales o facturas mensuales.</p>
              )}
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: SEGUIMIENTOS                        */}
        {/* ========================================== */}
        {activeTab === 'seguimientos' && (
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl space-y-6">
            <div className="space-y-1 text-left">
              <h2 className="text-xl font-black">Historial de Interacciones y Acuerdos</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Cronología de contactos comerciales y revisiones de soporte con PROTOTIPE.</p>
            </div>

            {followups.length > 0 ? (
              <div className="relative border-l border-[var(--color-border)]/45 pl-6 ml-3 space-y-6 text-left">
                {followups.map((follow) => (
                  <div key={follow.id} className="relative">
                    {/* Indicador en línea de tiempo */}
                    <span className="absolute -left-[30px] top-1.5 flex h-2 w-2 rounded-full bg-violet-500 ring-4 ring-violet-500/20" />
                    
                    <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold flex items-center gap-1 text-[var(--color-text)]">
                          {follow.type === 'llamada' && '📞 Llamada'}
                          {follow.type === 'whatsapp' && '💬 WhatsApp'}
                          {follow.type === 'correo' && '✉️ Correo'}
                          {follow.type === 'visita' && '🤝 Reunión Presencial'}
                          {follow.type === 'nota' && '📝 Nota Informativa'}
                          <span className="text-[var(--color-text-muted)] font-normal">por {follow.agent}</span>
                        </span>
                        <span className="text-[var(--color-text-muted)]">
                          {follow.date ? new Date(follow.date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text)] leading-relaxed">
                        {follow.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] italic">No se han registrado seguimientos oficiales o actas de interacción.</p>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 6: DOCUMENTOS                          */}
        {/* ========================================== */}
        {activeTab === 'documentos' && (
          <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-6 rounded-3xl backdrop-blur-xl space-y-6">
            <div className="space-y-1 text-left">
              <h2 className="text-xl font-black">Repositorio de Documentos Oficiales</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Descarga en formato PDF tus contratos comerciales y actas oficiales.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              
              {/* Contrato de Prestación de Servicios */}
              <div className="p-5 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl flex flex-col justify-between items-start gap-4 min-h-[140px]">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold flex items-center gap-2">
                    <FileText size={16} className="text-violet-400" />
                    Contrato de Prestación de Servicios
                  </h4>
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                    Contrato oficial que estipula el esquema comercial, condiciones de soporte, y cláusulas de confidencialidad de datos.
                  </p>
                </div>
                <button
                  onClick={handleDownloadContract}
                  className="px-3.5 py-1.5 bg-violet-650 hover:bg-violet-600 text-white rounded-xl text-[10px] font-black cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 border-none mt-2"
                >
                  <Download size={12} />
                  Descargar Contrato PDF
                </button>
              </div>

              {/* Ficha General de Cuenta */}
              <div className="p-5 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl flex flex-col justify-between items-start gap-4 min-h-[140px]">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold flex items-center gap-2">
                    <Award size={16} className="text-cyan-400" />
                    Ficha Técnica de Cuenta
                  </h4>
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                    Certificado de parametrización del core tecnológico SaaS PROTOTIPE vinculado a tu hosting y dominio actual.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const doc = new jsPDF();
                    doc.setFillColor(6, 182, 212); // Cyan-500
                    doc.rect(0, 0, 210, 35, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(18);
                    doc.setFont('helvetica', 'bold');
                    doc.text('CERTIFICADO TÉCNICO DE INSTANCIA SaaS', 15, 22);

                    doc.setTextColor(31, 41, 55);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    let y = 50;
                    doc.text(`CLIENTE ID: ${clientData.id}`, 15, y); y += 8;
                    doc.text(`EMPRESA: ${clientData.nombre}`, 15, y); y += 8;
                    doc.text(`VERSIÓN DEL CORE VINCULADO: v${clientData.tecnico?.versionCore || '1.0.0'}`, 15, y); y += 8;
                    doc.text(`DOMINIO HOSTING: ${clientData.tecnico?.urlHosting || 'N/A'}`, 15, y); y += 8;
                    doc.text(`PROYECTO ID: ${clientData.tecnico?.projectId || 'N/A'}`, 15, y); y += 15;

                    doc.text('Este documento certifica que la instancia del software se encuentra activa', 15, y); y += 5;
                    doc.text('y conectada a la base de datos central de telemetrías PROTOTIPE.', 15, y); y += 20;

                    doc.text('Emitido por el Departamento de Ingeniería PROTOTIPE.', 15, y);
                    doc.save(`Certificado_Tecnico_${clientData.id}.pdf`);
                  }}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-black cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 border-none mt-2"
                >
                  <Download size={12} />
                  Descargar Ficha Técnica
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
