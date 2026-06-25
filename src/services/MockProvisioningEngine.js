import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { crmService } from './crmService';

const SLEEP = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STEPS = [
  { key: 'order_approved', label: 'Orden Aprobada', desc: 'Verificación de credenciales y aprobación manual comercial.' },
  { key: 'environment_created', label: 'Infraestructura Creada', desc: 'Bootstrapping del servidor virtual y asignación del subdominio.' },
  { key: 'database_seeded', label: 'Base de Datos Sembrada', desc: 'Creación de esquemas iniciales y poblamiento de catálogos base.' },
  { key: 'modules_installed', label: 'Módulos Instalados', desc: 'Instalación de paquetes NPM y dependencias del Core.' },
  { key: 'configuration_applied', label: 'Configuración Aplicada', desc: 'Inyección de variables de entorno y personalización HSL.' },
  { key: 'testing_started', label: 'Control de Calidad Automático', desc: 'Lanzamiento de pruebas unitarias y de integración.' },
  { key: 'testing_completed', label: 'Pruebas Finalizadas', desc: 'Compilación final y verificación de conectividad.' },
  { key: 'production_ready', label: 'Producción Lista', desc: 'Instancia activa y mapeada correctamente en el ecosistema.' }
];

// Almacén de pings activos para cancelación
const activeJobs = new Map();

export const MockProvisioningEngine = {
  startDeployment: async (orderId, clientId, user, isRetry = false) => {
    // Cancelar cualquier job previo para evitar colisiones
    if (activeJobs.has(orderId)) {
      activeJobs.get(orderId).isCancelled = true;
    }

    const job = { isCancelled: false };
    activeJobs.set(orderId, job);

    console.log(`🚀 [Mock Engine] Iniciando despliegue de ${orderId} para cliente: ${clientId}`);

    try {
      // 1. Cambiar estado de la orden a 'deploying'
      const orderRef = doc(db, 'provisioning_orders', orderId);
      await updateDoc(orderRef, {
        status: 'deploying',
        updatedAt: serverTimestamp()
      });

      // Registrar auditoría inicial
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'PROVISIONING_STARTED',
        entityType: 'provisioning',
        entityId: orderId,
        details: `Inicio de aprovisionamiento simulado para ${clientId}.`
      });

      // Ejecutar cada paso con retrasos e informes
      for (let i = 0; i < STEPS.length; i++) {
        if (job.isCancelled) {
          console.log(`🛑 [Mock Engine] Job ${orderId} cancelado por el usuario.`);
          return;
        }

        const step = STEPS[i];
        
        // Simular cambio de estado intermedio de la orden para reflejar el progreso
        if (step.key === 'database_seeded') {
          await updateDoc(orderRef, { status: 'seeding' });
        } else if (step.key === 'testing_started') {
          await updateDoc(orderRef, { status: 'testing' });
        }

        // Simular retraso aleatorio (1.5s a 3.5s)
        const delay = 1500 + Math.random() * 2000;
        await SLEEP(delay);

        if (job.isCancelled) return;

        // Simular una tasa de falla aleatoria (15%) en los pasos intermedios (ej. database_seeded o modules_installed)
        // Pero no fallar si es un reintento (retry) para asegurar que el usuario pueda completar el flujo
        const shouldFail = !isRetry && Math.random() < 0.15 && (step.key === 'database_seeded' || step.key === 'modules_installed');
        
        if (shouldFail) {
          // Escribir log de fallo
          await addDoc(collection(db, 'provisioning_logs'), {
            clientId,
            orderId,
            step: step.key,
            status: 'failed',
            details: `Fallo crítico simulado en: ${step.label}. Error de compilación o conexión de base de datos.`,
            timestamp: serverTimestamp()
          });

          // Actualizar orden a failed
          await updateDoc(orderRef, {
            status: 'failed',
            updatedAt: serverTimestamp()
          });

          // Log de auditoría
          await crmService.logActivity({
            userId: 'system',
            userName: 'Sistema',
            action: 'PROVISIONING_FAILED',
            entityType: 'provisioning',
            entityId: orderId,
            details: `Aprovisionamiento fallido en etapa: ${step.label} para cliente ${clientId}.`
          });

          activeJobs.delete(orderId);
          return;
        }

        // Escribir log exitoso del paso
        await addDoc(collection(db, 'provisioning_logs'), {
          clientId,
          orderId,
          step: step.key,
          status: 'completed',
          details: `Paso completado: ${step.label} - ${step.desc}`,
          timestamp: serverTimestamp()
        });

        // Al finalizar las pruebas (step: testing_completed), generar el reporte de QA
        if (step.key === 'testing_completed') {
          console.log(`🧪 [Mock Engine] Generando reporte de QA para: ${clientId}`);
          const score = 90 + Math.floor(Math.random() * 11); // Score entre 90 y 100
          
          await addDoc(collection(db, 'qa_reports'), {
            clientId,
            orderId,
            score,
            status: score >= 95 ? 'QA_PASSED' : 'QA_PASSED', // En mock siempre pasa, pero con score variable
            checks: {
              'Firestore Connectivity': true,
              'Auth Validation': true,
              'Routing Validation': true,
              'Build Validation': true,
              'Configuration Validation': score > 92
            },
            createdAt: serverTimestamp()
          });

          // Log de auditoría QA
          await crmService.logActivity({
            userId: 'system',
            userName: 'Sistema',
            action: 'QA_PASSED',
            entityType: 'provisioning',
            entityId: orderId,
            details: `QA automático aprobado para ${clientId} con puntaje de ${score}/100.`
          });
        }
      }

      // 4. Completar aprovisionamiento
      if (job.isCancelled) return;

      await updateDoc(orderRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      // Actualizar el estado del cliente en clientes_control a 'Activo' (en caso de que estuviera pendiente)
      const clientRef = doc(db, 'clientes_control', clientId);
      await updateDoc(clientRef, {
        estado: 'Activo',
        'tecnico.versionCore': '1.0.0', // Versión del Core instalada
        'tecnico.urlHosting': `https://${clientId}.prototipe.io` // URL asignada
      }).catch((e) => console.warn('[Mock Engine] No se pudo actualizar clientes_control:', e.message));

      // Actualizar el proyecto de implementación a 'development' (fase de desarrollo activa)
      // Buscamos el proyecto asociado al cliente
      // (En mock simplemente intentamos actualizar si conocemos el projectId o lo dejamos para la UI)

      // Registrar auditoría final
      await crmService.logActivity({
        userId: 'system',
        userName: 'Sistema',
        action: 'PROVISIONING_COMPLETED',
        entityType: 'provisioning',
        entityId: orderId,
        details: `Instancia de cliente ${clientId} aprovisionada y configurada exitosamente.`
      });

      console.log(`🎉 [Mock Engine] Despliegue de ${orderId} finalizado correctamente.`);
      activeJobs.delete(orderId);

    } catch (err) {
      console.error(`❌ [Mock Engine] Error en despliegue de ${orderId}:`, err);
      // Poner la orden en failed
      try {
        const orderRef = doc(db, 'provisioning_orders', orderId);
        await updateDoc(orderRef, {
          status: 'failed',
          updatedAt: serverTimestamp()
        });
      } catch (e) {}
      activeJobs.delete(orderId);
    }
  },

  cancelDeployment: async (orderId, clientId, user) => {
    if (activeJobs.has(orderId)) {
      activeJobs.get(orderId).isCancelled = true;
      activeJobs.delete(orderId);
    }

    console.log(`🛑 [Mock Engine] Cancelando orden de aprovisionamiento: ${orderId}`);

    try {
      const orderRef = doc(db, 'provisioning_orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      // Registrar log en provisioning_logs
      await addDoc(collection(db, 'provisioning_logs'), {
        clientId,
        orderId,
        step: 'cancelled',
        status: 'cancelled',
        details: 'El proceso de aprovisionamiento fue cancelado manualmente por el operador.',
        timestamp: serverTimestamp()
      });

      // Registrar auditoría
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'PROVISIONING_FAILED', // O un evento custom si existiera, usaremos PROVISIONING_FAILED por catálogo
        entityType: 'provisioning',
        entityId: orderId,
        details: `Aprovisionamiento cancelado manualmente por el usuario para ${clientId}.`
      });
    } catch (err) {
      console.error('Error al cancelar en Mock Engine:', err);
    }
  }
};
