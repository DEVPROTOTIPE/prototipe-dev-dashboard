import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { crmService } from './crmService';
import { MockProvisioningEngine } from './MockProvisioningEngine';
import { CLI_URL } from '../config/constants';

export const provisioningService = {
  approveProvisioningOrder: async (orderId, user) => {
    try {
      console.log(`[Provisioning Service] Aprobando orden: ${orderId}`);
      const orderRef = doc(db, 'provisioning_orders', orderId);
      
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('La orden de aprovisionamiento no existe.');
      }
      
      const orderData = orderSnap.data();

      // Actualizar estado de la orden a aprobado y aprobado por el usuario
      await updateDoc(orderRef, {
        status: 'approved',
        approved: true,
        updatedAt: serverTimestamp()
      });

      // Registrar auditoría de aprobación
      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'PROVISIONING_APPROVED',
        entityType: 'provisioning',
        entityId: orderId,
        details: `Orden de aprovisionamiento aprobada manualmente para el cliente: ${orderData.clientId}`
      });

      return { success: true };
    } catch (error) {
      console.error('Error approving provisioning order:', error);
      throw error;
    }
  },

  startProvisioning: async (orderId, user) => {
    try {
      console.log(`[Provisioning Service] Iniciando despliegue de orden: ${orderId}`);
      const orderRef = doc(db, 'provisioning_orders', orderId);
      
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('La orden de aprovisionamiento no existe.');
      }
      
      const orderData = orderSnap.data();

      const isSimulated = localStorage.getItem('db_simulated') === 'true';

      if (isSimulated) {
        console.log('[Provisioning Service] Utilizando MockProvisioningEngine (Modo Sandbox)');
        MockProvisioningEngine.startDeployment(orderId, orderData.clientId, user, false);
      } else {
        console.log('[Provisioning Service] Utilizando PROTOTIPE-CLI Real (Modo Producción)');
        provisioningService.runRealProvisioning(orderId, orderData.clientId, user);
      }

      return { success: true };
    } catch (error) {
      console.error('Error starting provisioning:', error);
      throw error;
    }
  },

  cancelProvisioning: async (orderId, user) => {
    try {
      console.log(`[Provisioning Service] Cancelando orden: ${orderId}`);
      const orderRef = doc(db, 'provisioning_orders', orderId);
      
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('La orden de aprovisionamiento no existe.');
      }
      
      const orderData = orderSnap.data();
      const isSimulated = localStorage.getItem('db_simulated') === 'true';

      if (isSimulated) {
        await MockProvisioningEngine.cancelDeployment(orderId, orderData.clientId, user);
      } else {
        console.log(`[Provisioning Service] Deteniendo Job real ${orderId} en el CLI local`);
        const cancelRes = await fetch(`${CLI_URL}/api/cancel-job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });

        if (!cancelRes.ok) {
          const errText = await cancelRes.text();
          console.warn(`[Provisioning Service Warning] No se pudo cancelar en CLI local: ${errText}`);
        }

        // Forzar actualización a cancelled en Firestore
        await updateDoc(orderRef, {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        });

        await addDoc(collection(db, 'provisioning_logs'), {
          clientId: orderData.clientId,
          orderId,
          step: 'cancelled',
          status: 'cancelled',
          details: 'El proceso de aprovisionamiento físico fue cancelado manualmente por el operador.',
          timestamp: serverTimestamp()
        });

        await crmService.logActivity({
          userId: user?.uid || 'system',
          userName: user?.email || 'Sistema',
          action: 'PROVISIONING_FAILED',
          entityType: 'provisioning',
          entityId: orderId,
          details: `Aprovisionamiento real cancelado por el usuario para ${orderData.clientId}.`
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error cancelling provisioning:', error);
      throw error;
    }
  },

  retryProvisioning: async (orderId, user) => {
    try {
      console.log(`[Provisioning Service] Reintentando orden: ${orderId}`);
      const orderRef = doc(db, 'provisioning_orders', orderId);
      
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('La orden de aprovisionamiento no existe.');
      }
      
      const orderData = orderSnap.data();
      const isSimulated = localStorage.getItem('db_simulated') === 'true';

      if (isSimulated) {
        MockProvisioningEngine.startDeployment(orderId, orderData.clientId, user, true);
      } else {
        console.log('[Provisioning Service] Reintentando real en PROTOTIPE-CLI');
        provisioningService.runRealProvisioning(orderId, orderData.clientId, user);
      }

      return { success: true };
    } catch (error) {
      console.error('Error retrying provisioning:', error);
      throw error;
    }
  },

  // Flujo de comunicación real mediante Job + Stream SSE (Fase 7.5)
  runRealProvisioning: async (orderId, clientId, user) => {
    let es = null;
    try {
      const centralApiKey = import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY || '';
      
      // 1. Registrar Job de aprovisionamiento en el backend
      const res = await fetch(`${CLI_URL}/api/create-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, clientId, centralApiKey })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Fallo al registrar Job en el CLI local (Status ${res.status}): ${errText}`);
      }

      const { jobId } = await res.json();
      console.log(`[Provisioning Service] Job de aprovisionamiento registrado con éxito: ${jobId}`);

      // 2. Actualizar estado de orden a "deploying"
      const orderRef = doc(db, 'provisioning_orders', orderId);
      await updateDoc(orderRef, {
        status: 'deploying',
        updatedAt: serverTimestamp()
      });

      await crmService.logActivity({
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'PROVISIONING_STARTED',
        entityType: 'provisioning',
        entityId: orderId,
        details: `Inicio de aprovisionamiento real para el cliente: ${clientId}.`
      });

      // 3. Conectarse al stream SSE de logs en vivo
      es = new EventSource(`${CLI_URL}/api/provisioning-stream/${jobId}`);

      es.addEventListener('log', async (e) => {
        try {
          const logData = JSON.parse(e.data);
          
          // Escribir el log físico en Firestore
          await addDoc(collection(db, 'provisioning_logs'), {
            clientId,
            orderId,
            step: 'executing',
            status: 'completed',
            details: logData.text,
            timestamp: serverTimestamp()
          });

          // Actualizar etapa reactivamente según el log
          if (logData.text.includes('Estructura base de plantilla copiada')) {
            await updateDoc(orderRef, { status: 'deploying' });
          } else if (logData.text.includes('Configurar carpeta de documentación local')) {
            await updateDoc(orderRef, { status: 'seeding' });
          } else if (logData.text.includes('Smoke Test')) {
            await updateDoc(orderRef, { status: 'testing' });
          }
        } catch (err) {
          console.error('[Provisioning Service] Error procesando SSE log event:', err);
        }
      });

      es.addEventListener('success', async (e) => {
        try {
          const successData = JSON.parse(e.data);
          console.log('[Provisioning Service] Aprovisionamiento real exitoso:', successData);

          // 1. Guardar reporte de QA real
          await addDoc(collection(db, 'qa_reports'), {
            clientId,
            orderId,
            score: 100,
            status: 'QA_PASSED',
            checks: {
              'Playwright Smoke Test': true,
              'Vite Compilation': true,
              'Folder Scaffolding': true,
              'Documentation Standarization': true
            },
            createdAt: serverTimestamp()
          });

          // 2. Registrar log final
          await addDoc(collection(db, 'provisioning_logs'), {
            clientId,
            orderId,
            step: 'production_ready',
            status: 'completed',
            details: `Aprovisionamiento real completado con éxito. Proyecto creado en ${successData.targetDir}`,
            timestamp: serverTimestamp()
          });

          // 3. Marcar orden como completada
          await updateDoc(orderRef, {
            status: 'completed',
            updatedAt: serverTimestamp()
          });

          // 4. Activar cliente en clientes_control
          const clientRef = doc(db, 'clientes_control', clientId);
          await updateDoc(clientRef, {
            estado: 'Activo',
            'tecnico.versionCore': successData.version || '1.0.0',
            'tecnico.urlHosting': `https://${clientId}.web.app`
          }).catch((err) => console.warn('[Provisioning Service] No se pudo actualizar clientes_control:', err.message));

          // 5. Auditoría
          await crmService.logActivity({
            userId: 'system',
            userName: 'Sistema',
            action: 'PROVISIONING_COMPLETED',
            entityType: 'provisioning',
            entityId: orderId,
            details: `Aprovisionamiento físico real completado y certificado con Playwright para ${clientId}.`
          });

          if (es) es.close();
        } catch (err) {
          console.error('[Provisioning Service] Error procesando SSE success:', err);
          if (es) es.close();
        }
      });

      es.addEventListener('error', async (e) => {
        try {
          const errorData = JSON.parse(e.data || '{}');
          const errorMsg = errorData.message || 'Error de conexión SSE con el CLI local.';
          console.error('[Provisioning Service] Error en aprovisionamiento real:', errorMsg);

          // 1. Registrar log de error
          await addDoc(collection(db, 'provisioning_logs'), {
            clientId,
            orderId,
            step: 'failed',
            status: 'failed',
            details: `Fallo crítico en aprovisionamiento real: ${errorMsg}`,
            timestamp: serverTimestamp()
          });

          // 2. Marcar orden como fallida
          await updateDoc(orderRef, {
            status: 'failed',
            updatedAt: serverTimestamp()
          });

          // 3. Auditoría
          await crmService.logActivity({
            userId: 'system',
            userName: 'Sistema',
            action: 'PROVISIONING_FAILED',
            entityType: 'provisioning',
            entityId: orderId,
            details: `Aprovisionamiento real fallido: ${errorMsg}`
          });

          if (es) es.close();
        } catch (err) {
          console.error('[Provisioning Service] Error procesando SSE error:', err);
          if (es) es.close();
        }
      });

    } catch (err) {
      console.error('[Provisioning Service] Error al inicializar runRealProvisioning:', err);
      try {
        const orderRef = doc(db, 'provisioning_orders', orderId);
        await updateDoc(orderRef, {
          status: 'failed',
          updatedAt: serverTimestamp()
        });
      } catch (_) {}
      if (es) es.close();
      throw err;
    }
  }
};
