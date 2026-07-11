/**
 * SaaSMetricsService.js
 * Servicio para desacoplar el cálculo y análisis de las métricas comerciales y de negocio SaaS.
 */

export class SaaSMetricsService {
  /**
   * Calcula el conjunto completo de KPIs comerciales a partir del estado de la plataforma.
   * @param {Array} clientesSaas - Listado de instancias cliente SaaS.
   * @param {Array} reports - Reportes consolidados de facturación.
   * @param {Array} allClientesControl - Todos los clientes, incluyendo archivados/baja.
   * @param {Object} globalSaaSConfig - Configuración SaaS global dinámica de Firestore.
   * @returns {Object} KPIs calculados.
   */
  static calculateMetrics(clientesSaas = [], reports = [], allClientesControl = [], globalSaaSConfig = {}) {
    // 1. MRR (Monthly Recurring Revenue)
    // Calcula el ingreso según el modelo: flat_monthly (mensualidad fija), percentage (comisión por ventas) o fixed_per_service (tarifa transaccional)
    const activeClients = clientesSaas.filter(c => (c.status === 'active' || !c.status) && !c.deactivated && !c.archived);
    
    let mrrFlat = 0;
    let mrrPercentage = 0;
    let mrrFixed = 0;

    activeClients.forEach(c => {
      const mode = c.billingMode || 'flat_monthly';
      const clientIdNorm = (c.id || '').toLowerCase();
      
      if (mode === 'flat_monthly') {
        mrrFlat += (Number(c.pagoMensualFijo) || 0);
      } else if (mode === 'percentage') {
        // Encontrar el reporte más reciente de este cliente para estimar su MRR comisional real
        const clientReports = reports.filter(r => (r.clientId || '').toLowerCase() === clientIdNorm);
        const lastReport = clientReports[clientReports.length - 1];
        if (lastReport) {
          mrrPercentage += ((Number(lastReport.comisionValor) || 0) - (Number(lastReport.comisionesDeducidas) || 0));
        } else {
          // Fallback estimado si no hay reportes: ventas mensuales estimadas ($2.000.000) * porcentaje (1% - 5%)
          const percentageVal = Number(c.comisionPorcentaje) || 5; 
          mrrPercentage += (2000000 * (percentageVal / 100));
        }
      } else if (mode === 'fixed_per_service') {
        const clientReports = reports.filter(r => (r.clientId || '').toLowerCase() === clientIdNorm);
        const lastReport = clientReports[clientReports.length - 1];
        if (lastReport) {
          mrrFixed += ((Number(lastReport.comisionValor) || 0) - (Number(lastReport.comisionesDeducidas) || 0));
        } else {
          // Fallback estimado si no hay reportes: 100 servicios mensuales * monto fijo ($500)
          const fixedVal = Number(c.montoFijoServicio) || 500;
          mrrFixed += (100 * fixedVal);
        }
      }
    });

    const mrr = mrrFlat + mrrPercentage + mrrFixed;

    // 2. ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // 3. Churn Rate
    // Clientes dados de baja u offboarded respecto al total histórico registrado
    const totalHistorical = allClientesControl.length;
    let churnRate = 0;
    if (totalHistorical > 0) {
      const lostClients = allClientesControl.filter(c => c.archived || c.status === 'offboarded').length;
      churnRate = Math.round((lostClients / totalHistorical) * 1000) / 10; // 1 decimal
    }

    // 4. Totales de recaudación de reportes comisionales
    let totalComision = 0;
    let totalCobrado = 0;
    
    // Filtrar reportes del período actual/filtrado
    reports.forEach(r => {
      totalComision += (Number(r.comisionValor) || 0) - (Number(r.comisionesDeducidas) || 0);
      const paymentStatus = (r.estadoPago || 'pendiente').toLowerCase();
      if (paymentStatus === 'pagado' || paymentStatus === 'confirmado') {
        totalCobrado += (Number(r.comisionValor) || 0) - (Number(r.comisionesDeducidas) || 0);
      }
    });

    const totalPendiente = Math.max(0, totalComision - totalCobrado);

    // 5. Adopción de Verticales
    const nicheDistribution = {};
    clientesSaas.forEach(c => {
      if (c.niche) {
        nicheDistribution[c.niche] = (nicheDistribution[c.niche] || 0) + 1;
      }
    });

    return {
      mrr,
      arr,
      churnRate,
      totalComision,
      totalCobrado,
      totalPendiente,
      nicheDistribution,
      activeClientsCount: activeClients.length,
      mrrBreakdown: {
        flat_monthly: mrrFlat,
        percentage: mrrPercentage,
        fixed_per_service: mrrFixed
      }
    };
  }

  /**
   * Genera proyecciones financieras simples para el plan de escalabilidad del negocio.
   * @param {Object} currentMetrics - KPIs actuales.
   * @param {number} projectedGrowthRate - Tasa de crecimiento proyectada (%).
   * @param {number} periods - Meses a proyectar.
   * @returns {Array} Proyecciones mes a mes.
   */
  static projectGrowth(currentMetrics, projectedGrowthRate = 5, periods = 12) {
    const projections = [];
    let cumulativeMrr = currentMetrics.mrr;
    
    for (let i = 1; i <= periods; i++) {
      cumulativeMrr = cumulativeMrr * (1 + projectedGrowthRate / 100);
      projections.push({
        month: i,
        mrr: Math.round(cumulativeMrr),
        arr: Math.round(cumulativeMrr * 12)
      });
    }

    return projections;
  }
}
export default SaaSMetricsService;
