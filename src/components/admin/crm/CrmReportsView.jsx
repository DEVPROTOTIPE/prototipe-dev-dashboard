import React, { useState, useMemo } from 'react';
import useCrm from '../../../hooks/useCrm';
import { useDevStore } from '../../../stores/devStore';
import { calculateClientHealth } from '../../../utils/crmHelpers';
import { 
  exportExecutiveReportPDF, 
  exportCommercialReportPDF, 
  exportFinancialReportPDF,
  exportClientsDirectoryPDF
} from '../../../services/pdfService';
import { exportToCSV, exportToXLSX } from '../../../services/exportService';
import { 
  FileText, Download, Check, RefreshCw, FileCode, AlertCircle 
} from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import useToast from '../../../hooks/useToast';

export default function CrmReportsView() {
  const { showToast } = useToast();
  const { leads, proposals, projects, followups, tasks, activityLogs } = useCrm(true);
  const { clientesSaas, failures, reports } = useDevStore();

  const [reportType, setReportType] = useState('executive'); // 'executive' | 'commercial' | 'financial' | 'clients'
  const [format, setFormat] = useState('pdf'); // 'pdf' | 'csv' | 'xlsx'
  const [loading, setLoading] = useState(false);

  // Computaciones requeridas para los reportes
  const compiledData = useMemo(() => {
    // 1. KPIs
    const totalLeads = leads.length;
    const leadsWon = leads.filter(l => l.status === 'won').length;
    const leadsLost = leads.filter(l => l.status === 'lost').length;
    const conversionRate = totalLeads > 0 ? ((leadsWon / totalLeads) * 100).toFixed(1) : '0.0';

    const pipelineValue = proposals
      .filter(p => p.status === 'draft' || p.status === 'sent' || p.status === 'negotiation')
      .reduce((sum, p) => sum + Number(p.setupValue || 0), 0);

    const activeClientsList = clientesSaas.filter(c => c.estado === 'Activo');
    const activeClients = activeClientsList.length;

    let clientsInRisk = 0;
    let clientsCritical = 0;
    const healthDist = { excellent: 0, good: 0, risk: 0, critical: 0 };

    activeClientsList.forEach(c => {
      const h = calculateClientHealth(c, failures, reports, followups);
      if (h.color === 'emerald') healthDist.excellent++;
      if (h.color === 'blue') healthDist.good++;
      if (h.color === 'amber') {
        healthDist.risk++;
        clientsInRisk++;
      }
      if (h.color === 'red') {
        healthDist.critical++;
        clientsCritical++;
      }
    });

    const activeProjects = projects.filter(p => p.status !== 'production' && p.status !== 'paused').length;

    const activeClientsBaseMonthly = activeClientsList.reduce((sum, c) => sum + Number(c.comercial?.mensualidadValor || 0), 0);
    const totalPaidCommissions = reports
      .filter(r => (r.estadoPago || 'pendiente').toLowerCase() === 'pagado')
      .reduce((sum, r) => sum + Number(r.comisionValor || 0), 0);
    const avgCommission = reports.length > 0 ? (totalPaidCommissions / reports.length) : 0;
    const mrrProyected = activeClientsBaseMonthly + avgCommission;

    const setupSold = proposals
      .filter(p => p.status === 'won')
      .reduce((sum, p) => sum + Number(p.setupValue || 0), 0);
    const annualProjected = (activeClientsBaseMonthly + avgCommission) * 12 + setupSold;

    // 2. Funnel counts
    const funnelStages = ['lead_new', 'contacted', 'meeting_scheduled', 'meeting_done', 'diagnostic_completed', 'proposal_sent', 'negotiation', 'won'];
    const funnel = {};
    funnelStages.forEach((stage, idx) => {
      const stageWeight = { lead_new: 1, contacted: 2, meeting_scheduled: 3, meeting_done: 4, diagnostic_completed: 5, proposal_sent: 6, negotiation: 7, won: 8 };
      funnel[stage] = leads.filter(l => (stageWeight[l.status] || 1) >= stageWeight[stage]).length;
      
      const prevStage = idx === 0 ? stage : funnelStages[idx - 1];
      const prevCount = leads.filter(l => (stageWeight[l.status] || 1) >= stageWeight[prevStage]).length;
      funnel[`rate_${stage}`] = prevCount > 0 ? ((funnel[stage] / prevCount) * 100).toFixed(0) : '0';
    });

    // 3. Activity counts
    const activity = {
      meetingsDone: activityLogs.filter(a => a.action === 'MEETING_CREATED' || a.action === 'MEETING_COMPLETED').length,
      diagnosticsCompleted: activityLogs.filter(a => a.action === 'DIAGNOSTIC_COMPLETED').length,
      proposalsSent: activityLogs.filter(a => a.action === 'PROPOSAL_SENT').length,
      proposalsWon: activityLogs.filter(a => a.action === 'PROPOSAL_WON').length,
      followupsDone: followups.length,
      overdueTasks: tasks.filter(t => t.status === 'pendiente' && t.date && t.date < new Date().toISOString().split('T')[0]).length
    };

    return {
      kpis: { totalLeads, leadsWon, leadsLost, conversionRate, pipelineValue, activeClients, clientsInRisk, clientsCritical, activeProjects, mrrProyected },
      funnel,
      health: healthDist,
      activity,
      revenue: { setupSold, setupCollected: setupSold, mrrEstimated: activeClientsBaseMonthly, commissionProjected: avgCommission, annualProjected }
    };
  }, [leads, proposals, projects, followups, tasks, activityLogs, clientesSaas, failures, reports]);

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        if (format === 'pdf') {
          // EXPORTACIÓN PDF
          if (reportType === 'executive') {
            exportExecutiveReportPDF(compiledData.kpis, compiledData.funnel, compiledData.health, compiledData.activity);
          } else if (reportType === 'commercial') {
            exportCommercialReportPDF(leads, proposals, compiledData.activity);
          } else if (reportType === 'financial') {
            exportFinancialReportPDF(compiledData.revenue, clientesSaas);
          } else if (reportType === 'clients') {
            exportClientsDirectoryPDF(clientesSaas);
          }
        } else {
          // EXPORTACIÓN CSV o XLSX
          let headers = [];
          let rows = [];
          let filename = '';

          if (reportType === 'commercial') {
            filename = 'Reporte_Comercial';
            headers = ['Nombre Contacto', 'Empresa/Negocio', 'Telefono', 'Correo', 'Canal Origen', 'Estado Funnel', 'Prioridad', 'Responsable', 'Fecha Creación'];
            rows = leads.map(l => [
              l.name || '',
              l.company || '',
              l.phone || '',
              l.email || '',
              l.channel || 'WhatsApp',
              l.status || '',
              l.priority || 'C',
              l.responsible || 'Sergio Herrera',
              l.createdAt ? new Date(l.createdAt).toLocaleDateString('es-CO') : ''
            ]);
          } else if (reportType === 'financial') {
            filename = 'Reporte_Financiero';
            headers = ['Cliente ID', 'Nombre Comercial', 'Estado SaaS', 'Modelo de Cobro', 'Setup Valor ($)', 'Mensualidad Fija ($)', 'Comisión / Factor'];
            rows = clientesSaas.map(c => {
              const com = c.comercial || {};
              return [
                c.id,
                c.nombre || '',
                c.estado || 'Activo',
                com.modeloMonetizacion || '',
                com.setupValor || 0,
                com.mensualidadValor || 0,
                com.comisionPorcentaje || 0
              ];
            });
          } else if (reportType === 'clients') {
            filename = 'Reporte_Clientes_Directorio';
            headers = ['Cliente ID', 'Nombre Comercial', 'Estado', 'Contacto Nombre', 'Contacto Telefono', 'Contacto Correo', 'ID Shard Técnico', 'Versión Core', 'Dominio Hosting'];
            rows = clientesSaas.map(c => [
              c.id,
              c.nombre || '',
              c.estado || '',
              c.contacto?.nombre || '',
              c.contacto?.telefono || '',
              c.contacto?.correo || '',
              c.tecnico?.projectId || '',
              c.tecnico?.versionCore || '1.0.0',
              c.tecnico?.urlHosting || ''
            ]);
          } else if (reportType === 'executive') {
            filename = 'Reporte_Ejecutivo_KPIs';
            headers = ['Métrica Ejecutiva', 'Valor Reportado', 'Categoría'];
            rows = [
              ['Leads Totales Generados', compiledData.kpis.totalLeads, 'Comercial'],
              ['Leads Ganados', compiledData.kpis.leadsWon, 'Comercial'],
              ['Leads Perdidos', compiledData.kpis.leadsLost, 'Comercial'],
              ['Tasa de Conversión Funnel', `${compiledData.kpis.conversionRate}%`, 'Comercial'],
              ['Pipeline de Ventas setup', compiledData.kpis.pipelineValue, 'Financiero'],
              ['MRR Proyectado General', compiledData.kpis.mrrProyected, 'Financiero'],
              ['Setup Total Vendido (Histórico)', compiledData.revenue.setupSold, 'Financiero'],
              ['Clientes Activos en Portafolio', compiledData.kpis.activeClients, 'Operaciones'],
              ['Proyectos Core en Implementación', compiledData.kpis.activeProjects, 'Operaciones'],
              ['Clientes en Salud Crítica (Rojo)', compiledData.kpis.clientsCritical, 'Operaciones']
            ];
          }

          if (format === 'csv') {
            exportToCSV(filename, headers, rows);
          } else if (format === 'xlsx') {
            exportToXLSX(filename, headers, rows);
          }
        }
        showToast('Reporte generado y descargado con éxito', { type: 'success' });
      } catch (err) {
        console.error(err);
        showToast('Fallo al exportar el reporte seleccionado', { type: 'error' });
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-4 tab-content-enter select-none max-w-xl mx-auto">
      
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-3xl shadow-lg space-y-6">
        
        {/* Encabezado */}
        <div className="border-b border-[var(--color-border)] pb-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase text-[var(--color-text)] tracking-wider">Centro de Exportación de Reportes</h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Exporta la analítica y contabilidad del CRM en formatos certificados.</p>
          </div>
        </div>

        {/* Parámetros de Selección */}
        <div className="space-y-4 text-xs">
          
          {/* Tipo de Reporte */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Tipo de Reporte</label>
            <CustomSelect 
              value={reportType}
              onChange={setReportType}
              options={[
                { id: 'executive', name: '📊 Reporte Ejecutivo Consolidado' },
                { id: 'commercial', name: '👥 Reporte Comercial y Pipeline (Leads)' },
                { id: 'financial', name: '💸 Reporte Financiero (Cobros y Comisiones)' },
                { id: 'clients', name: '🏢 Reporte de Clientes (Directorio y Shards)' }
              ]}
            />
          </div>

          {/* Formato de descarga */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Formato de Exportación</label>
            <CustomSelect 
              value={format}
              onChange={setFormat}
              options={[
                { id: 'pdf', name: '📄 PDF (Diseño A4 Certificado / Vectorial)' },
                { id: 'csv', name: '📝 CSV (Comma Separated Values / UTF-8)' },
                { id: 'xlsx', name: '📊 Excel (XML Spreadsheet / XLSX Nativo)' }
              ]}
            />
          </div>

        </div>

        {/* Advertencia / Nota Informativa */}
        <div className="p-3.5 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-2xl flex gap-2.5 items-start text-[11px] text-[var(--color-text-muted)]">
          <AlertCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[var(--color-text)] block">Formato de salida certificado</span>
            <p>Los reportes PDF aplican la paleta Slate/Indigo oficial del ecosistema, mientras que los archivos XLSX incorporan auto-formato de celdas comisionales para Excel.</p>
          </div>
        </div>

        {/* Botón Exportación */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer border-none flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Generando Documento...
            </>
          ) : (
            <>
              <Download size={14} />
              Generar y Descargar Reporte
            </>
          )}
        </button>

      </div>

    </div>
  );
}
