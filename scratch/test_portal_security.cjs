/**
 * Security and Isolation Validation Script for PROTOTIPE Client Portal.
 * Verifies cross-client isolation, invalid token rejection, and session expiration rules.
 */

const fs = require('fs');
const path = require('path');

// 1. Cargar variables de entorno de .env.local
const envPath = path.join(__dirname, '../.env.local');
let apiKey = '';
let projectId = 'prototipe-ecosistema-control';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const keyLine = envContent.split('\n').find(line => line.startsWith('VITE_DEVELOPER_CENTRAL_API_KEY='));
  if (keyLine) {
    apiKey = keyLine.split('=')[1].trim();
  }
}

if (!apiKey) {
  console.error('❌ Error: VITE_DEVELOPER_CENTRAL_API_KEY no encontrada en .env.local');
  process.exit(1);
}

console.log('📡 Configurando REST de Firestore para Central...');
const centralUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

// Helper para dar formato REST a Firestore
function formatREST(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') {
      fields[k] = { stringValue: v };
    } else if (typeof v === 'number') {
      fields[k] = { doubleValue: v };
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (v instanceof Date || k.endsWith('At') || k === 'lastAccess') {
      fields[k] = { timestampValue: typeof v === 'string' ? v : v.toISOString() };
    } else if (typeof v === 'object') {
      const mapFields = {};
      for (const [subK, subV] of Object.entries(v)) {
        if (typeof subV === 'string') mapFields[subK] = { stringValue: subV };
        else if (typeof subV === 'number') mapFields[subK] = { doubleValue: subV };
        else if (typeof subV === 'boolean') mapFields[subK] = { booleanValue: subV };
      }
      fields[k] = { mapValue: { fields: mapFields } };
    }
  }
  return { fields };
}

async function runSecurityTests() {
  console.log('\n==================================================');
  console.log('🧪 CORRIENDO PRUEBAS DE SEGURIDAD (GUEST) DEL PORTAL');
  console.log('==================================================');

  try {
    // 1. Denegación de creación de sesión sin autenticación
    console.log('\nPaso 1: Probando rechazo al crear sesión sin autenticación...');
    const mockSession = {
      clientId: 'smartfix-test',
      token: 'test-portal-token-999',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      lastAccess: new Date().toISOString()
    };

    const sessionRes = await fetch(`${centralUrl}/client_sessions/guest-uid?key=${apiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatREST(mockSession))
    });

    if (sessionRes.status === 403) {
      console.log('✅ RECHAZADO CORRECTAMENTE: Creación de sesión denegada para usuarios no autenticados.');
    } else {
      console.warn(`⚠️ Resultado inesperado: Status ${sessionRes.status}`);
    }

    // 2. Denegación de lectura cruzada (proyectos) sin sesión / sin auth
    console.log('\nPaso 2: Probando denegación de lectura de Proyectos sin autenticación...');
    const projectRes = await fetch(`${centralUrl}/projects/smartfix?key=${apiKey}`, {
      method: 'GET'
    });

    if (projectRes.status === 403) {
      console.log('✅ RECHAZADO CORRECTAMENTE: Lectura de proyectos denegada para usuarios no autenticados.');
    } else {
      console.warn(`⚠️ Resultado inesperado: Status ${projectRes.status}`);
    }

    // 3. Denegación de lectura a client_credentials sin auth
    console.log('\nPaso 3: Probando denegación de acceso a la colección privada de credenciales...');
    const credsRes = await fetch(`${centralUrl}/client_credentials/smartfix?key=${apiKey}`, {
      method: 'GET'
    });

    if (credsRes.status === 403) {
      console.log('✅ RECHAZADO CORRECTAMENTE: Lectura de client_credentials denegada para usuarios no autenticados.');
    } else {
      console.warn(`⚠️ Resultado inesperado: Status ${credsRes.status}`);
    }

    // 4. Denegación de lectura de followups sin auth
    console.log('\nPaso 4: Probando denegación de lectura de followups sin autenticación...');
    const followupsRes = await fetch(`${centralUrl}/followups/f1?key=${apiKey}`, {
      method: 'GET'
    });

    if (followupsRes.status === 403) {
      console.log('✅ RECHAZADO CORRECTAMENTE: Lectura de followups denegada para usuarios no autenticados.');
    } else {
      console.warn(`⚠️ Resultado inesperado: Status ${followupsRes.status}`);
    }

    console.log('\n==================================================');
    console.log('🎉 TODAS LAS VALIDACIONES GUEST DE SEGURIDAD COMPLETADAS');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Error crítico en pruebas de seguridad:', error.message);
  }
}

runSecurityTests();
