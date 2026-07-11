// Configuración dinámica y personalizable de la plataforma SaaS de PROTOTIPE
export const SAAS_CONFIG = {
  // Costos operativos estimados
  infrastructureCostPerTenant: 15.00, // USD al mes por servidor de instancia o base de datos Firebase
  licensingFeesBase: 5.00,             // Costos de licencias base y APIs de terceros

  // Tasas comisionales por defecto
  defaultCommissionRate: 0.10,        // 10% de comisión sobre ventas comisionables
  trialPeriodDays: 14,                // Período de pruebas de nuevos clientes

  // Reglas operativas y límites
  alertThresholds: {
    maxLatencyMs: 1500,               // Latencia máxima para catalogar una instancia como "Lenta"
    criticalErrorCount: 5             // Cantidad de errores críticos acumulados para disparar alerta roja
  }
};

export default SAAS_CONFIG;
