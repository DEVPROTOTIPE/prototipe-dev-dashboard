import { describe, test, beforeAll, beforeEach, afterAll } from 'vitest';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'test-dashboard-rules';

let testEnv;

beforeAll(async () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: rulesContent,
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

describe('CORE-357 — Control de Acceso por Rol de Operador', () => {

  describe('Caso 1: Usuarios No Autenticados (Anónimos)', () => {
    test('Un usuario anónimo NO debe poder leer ni escribir en la colección tokens', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('tokens').doc('token-1').get());
      await assertFails(db.collection('tokens').doc('token-1').set({ active: true }));
    });

    test('Un usuario anónimo NO debe poder listar ni escribir en clientes_control', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('clientes_control').get());
      await assertFails(db.collection('clientes_control').doc('client-1').set({ active: true }));
    });

    test('Un usuario anónimo SÍ debe poder obtener (get) un cliente_control específico', async () => {
      // clientes_control permite "get: if true" para que la app cliente lea su tasa
      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(db.collection('clientes_control').doc('client-1').get());
    });
  });

  describe('Caso 2: Usuarios Autenticados sin Registro de Operador (o Inactivos)', () => {
    const USER_ID = 'auth-user-no-operator';

    test('Un usuario autenticado sin doc en operators/ NO debe poder acceder a colecciones sensibles', async () => {
      const db = testEnv.authenticatedContext(USER_ID).firestore();

      await assertFails(db.collection('tokens').doc('token-1').get());
      await assertFails(db.collection('clientes_control').get()); // list
      await assertFails(db.collection('whatsappTemplates').doc('tmpl-1').get());
      await assertFails(db.collection('configuracion_sistema').doc('config').get());
      await assertFails(db.collection('briefings').doc('brief-1').get());
      await assertFails(db.collection('cotizaciones').doc('quote-1').get());
      await assertFails(db.collection('dashboard_config').doc('dash-1').get());
      await assertFails(db.collection('health_checks').doc('chk-1').get());
    });

    test('Un usuario autenticado con doc inactivo (activo = false) en operators/ NO debe poder acceder', async () => {
      const INACTIVE_OPERATOR = 'inactive-operator-uid';
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await ctx.firestore().collection('operators').doc(INACTIVE_OPERATOR).set({
          activo: false
        });
      });

      const db = testEnv.authenticatedContext(INACTIVE_OPERATOR).firestore();
      await assertFails(db.collection('tokens').doc('token-1').get());
      await assertFails(db.collection('clientes_control').get());
    });
  });

  describe('Caso 3: Operadores Autenticados y Activos', () => {
    const ACTIVE_OPERATOR = 'active-operator-uid';

    beforeEach(async () => {
      // Sembrar el operador activo antes de cada prueba
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await ctx.firestore().collection('operators').doc(ACTIVE_OPERATOR).set({
          activo: true
        });
      });
    });

    test('Un operador activo SÍ debe poder leer y escribir en tokens', async () => {
      const db = testEnv.authenticatedContext(ACTIVE_OPERATOR).firestore();
      await assertSucceeds(db.collection('tokens').doc('token-1').set({ active: true, clientId: 'client-1' }));
      await assertSucceeds(db.collection('tokens').doc('token-1').get());
    });

    test('Un operador activo SÍ debe poder listar y escribir en clientes_control', async () => {
      const db = testEnv.authenticatedContext(ACTIVE_OPERATOR).firestore();
      await assertSucceeds(db.collection('clientes_control').doc('client-1').set({ commission: 5 }));
      await assertSucceeds(db.collection('clientes_control').get()); // list
    });

    test('Un operador activo SÍ debe poder acceder a otras colecciones del Dashboard', async () => {
      const db = testEnv.authenticatedContext(ACTIVE_OPERATOR).firestore();
      
      await assertSucceeds(db.collection('whatsappTemplates').doc('tmpl-1').set({ body: 'hola' }));
      await assertSucceeds(db.collection('whatsappTemplates').doc('tmpl-1').get());

      await assertSucceeds(db.collection('configuracion_sistema').doc('sys').set({ alertEmail: 'ops@prototipe.dev' }));
      await assertSucceeds(db.collection('configuracion_sistema').doc('sys').get());

      await assertSucceeds(db.collection('briefings').doc('brief-1').set({ clientName: 'Moni App' }));
      await assertSucceeds(db.collection('briefings').doc('brief-1').get());

      await assertSucceeds(db.collection('cotizaciones').doc('quote-1').set({ amount: 1500 }));
      await assertSucceeds(db.collection('cotizaciones').doc('quote-1').get());

      await assertSucceeds(db.collection('dashboard_config').doc('config').set({ theme: 'dark' }));
      await assertSucceeds(db.collection('dashboard_config').doc('config').get());

      await assertSucceeds(db.collection('health_checks').doc('chk-1').set({ status: 'ok' }));
      await assertSucceeds(db.collection('health_checks').doc('chk-1').get());
    });
  });

  describe('Caso 4: Restricciones de Modificación (Públicas vs Operador)', () => {
    test('Cualquier usuario (público) solo puede actualizar lastPingResponse en clientes_control', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      // Sembrar datos iniciales
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await ctx.firestore().collection('clientes_control').doc('client-1').set({
          commission: 5,
          lastPingResponse: 'idle'
        });
      });

      // Intentar actualizar solo lastPingResponse (debe permitirse)
      await assertSucceeds(
        db.collection('clientes_control').doc('client-1').update({
          lastPingResponse: 'active'
        })
      );

      // Intentar actualizar commission públicamente (debe fallar)
      await assertFails(
        db.collection('clientes_control').doc('client-1').update({
          commission: 10
        })
      );
    });
  });
});
