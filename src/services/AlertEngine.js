import SAAS_CONFIG from '../config/saas_config';

export class AlertEngine {
  /**
   * Genera el listado consolidado de alertas del sistema analizando el estado de las instancias,
   * latencias, errores y metadatos de facturación.
   * 
   * @param {Object[]} clients Listado de clientes desde Firestore (clientesSaas)
   * @param {Object[]} pings Listado de latencias y pings HTTP de las instancias
   * @param {Object[]} errors Listado de incidentes y logs de telemetría reportados
   * @returns {Object[]} Lista de alertas generadas
   */
  static generateAlerts(clients = [], pings = [], errors = []) {
    const alerts = [];

    // 1. Analizar estado administrativo y de aprovisionamiento de clientes
    for (const client of clients) {
      if (client.status === 'suspended') {
        alerts.push({
          id: `alert_suspended_${client.id}`,
          type: 'danger',
          category: 'billing',
          title: `Instancia Suspendida: ${client.id}`,
          message: `El cliente está bloqueado por falta de pago o acción administrativa. Motivo: ${client.deactivationReason || 'No especificado'}.`,
          timestamp: new Date().toISOString()
        });
      } else if (client.status === 'pending_update') {
        alerts.push({
          id: `alert_update_${client.id}`,
          type: 'warning',
          category: 'devops',
          title: `Actualización Pendiente: ${client.id}`,
          message: `La instancia requiere inyección de parches acumulados del core de referencia o features actualizadas.`,
          timestamp: new Date().toISOString()
        });
      } else if (client.status === 'pending_provisioning') {
        alerts.push({
          id: `alert_provisioning_${client.id}`,
          type: 'warning',
          category: 'devops',
          title: `Aprovisionamiento Incompleto: ${client.id}`,
          message: `El tenant está registrado en Firestore pero carece de un manifiesto prototipe.lock.json físico en el disco.`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. Analizar latencia y respuesta de pings HTTP de las instancias
    for (const ping of pings) {
      if (ping.status === 'error') {
        alerts.push({
          id: `alert_down_${ping.clientId}`,
          type: 'danger',
          category: 'network',
          title: `Instancia Inalcanzable: ${ping.clientId}`,
          message: `El servidor local o host de la instancia no respondió al ping HTTP periódico.`,
          timestamp: new Date().toISOString()
        });
      } else if (ping.latency > SAAS_CONFIG.alertThresholds.maxLatencyMs) {
        alerts.push({
          id: `alert_slow_${ping.clientId}`,
          type: 'warning',
          category: 'network',
          title: `Latencia Elevada: ${ping.clientId}`,
          message: `La respuesta HTTP del manifest es lenta (${ping.latency}ms). Umbral superado: ${SAAS_CONFIG.alertThresholds.maxLatencyMs}ms.`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 3. Analizar volumen de errores críticos en telemetría de clientes
    const criticalErrorCountByClient = {};
    for (const err of errors) {
      if (err.severity === 'critical') {
        criticalErrorCountByClient[err.clientId] = (criticalErrorCountByClient[err.clientId] || 0) + 1;
      }
    }

    for (const [clientId, count] of Object.entries(criticalErrorCountByClient)) {
      if (count >= SAAS_CONFIG.alertThresholds.criticalErrorCount) {
        alerts.push({
          id: `alert_errors_${clientId}`,
          type: 'danger',
          category: 'telemetry',
          title: `Excepciones Críticas en ${clientId}`,
          message: `Se detectaron ${count} errores críticos reportados en tiempo de ejecución. Por favor revise el log de consola.`,
          timestamp: new Date().toISOString()
        });
      }
    }

    return alerts;
  }
}

export default AlertEngine;
