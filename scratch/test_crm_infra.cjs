/**
 * Functional validation script for PROTOTIPE CRM Firestore infrastructure.
 * Uses Firestore REST API to test write/read/delete operations on central DB.
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

console.log('📡 Configurando REST de Firestore para Proyecto:', projectId);
const centralUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

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
    } else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return { doubleValue: item };
            return { stringValue: JSON.stringify(item) };
          })
        }
      };
    } else if (typeof v === 'object') {
      // Objeto simple
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

// Helper para parsear la respuesta REST de Firestore
function parseREST(doc) {
  if (!doc || !doc.fields) return null;
  const data = { id: doc.name.split('/').pop() };
  for (const [k, v] of Object.entries(doc.fields)) {
    if (v.stringValue !== undefined) data[k] = v.stringValue;
    else if (v.doubleValue !== undefined) data[k] = Number(v.doubleValue);
    else if (v.integerValue !== undefined) data[k] = Number(v.integerValue);
    else if (v.booleanValue !== undefined) data[k] = v.booleanValue;
    else if (v.arrayValue && v.arrayValue.values) {
      data[k] = v.arrayValue.values.map(val => val.stringValue || val.doubleValue || val.booleanValue);
    } else if (v.mapValue && v.mapValue.fields) {
      const mapData = {};
      for (const [subK, subV] of Object.entries(v.mapValue.fields)) {
        mapData[subK] = subV.stringValue || Number(subV.doubleValue || subV.integerValue || 0) || subV.booleanValue;
      }
      data[k] = mapData;
    }
  }
  return data;
}

// Proceso principal de pruebas
async function runTests() {
  const createdIds = {
    lead: null,
    meeting: null,
    diagnostic: null,
    proposal: null
  };

  try {
    console.log('\n--- 🧪 TEST 1: Crear Lead de Prueba ---');
    const mockLead = {
      name: 'Cliente Test Infra',
      company: 'SmartFix Test SRL',
      sector: 'retail_electronics',
      phone: '+5219988776655',
      email: 'test@smartfix.com',
      priority: 'B',
      status: 'lead_new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const resLead = await fetch(`${centralUrl}/leads?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatREST(mockLead))
    });

    if (!resLead.ok) throw new Error(`Fallo al crear Lead: status ${resLead.status} - ${await resLead.text()}`);
    const leadDoc = await resLead.json();
    createdIds.lead = leadDoc.name.split('/').pop();
    console.log('✅ Lead creado con ID:', createdIds.lead);

    console.log('\n--- 🧪 TEST 2: Consultar Lead Creado ---');
    const resGetLead = await fetch(`${centralUrl}/leads/${createdIds.lead}?key=${apiKey}`);
    if (!resGetLead.ok) throw new Error(`Fallo al leer Lead: status ${resGetLead.status}`);
    const getLeadData = parseREST(await resGetLead.json());
    console.log('✅ Lead leído exitosamente:', getLeadData.name, `(${getLeadData.company})`);

    console.log('\n--- 🧪 TEST 3: Crear Reunión vinculada ---');
    const mockMeeting = {
      leadId: createdIds.lead,
      date: new Date(Date.now() + 86400000).toISOString(), // mañana
      type: 'virtual',
      notes: 'Sesión de descubrimiento de preventa de CRM',
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    const resMeeting = await fetch(`${centralUrl}/meetings?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatREST(mockMeeting))
    });

    if (!resMeeting.ok) throw new Error(`Fallo al crear Meeting: status ${resMeeting.status}`);
    const meetingDoc = await resMeeting.json();
    createdIds.meeting = meetingDoc.name.split('/').pop();
    console.log('✅ Reunión creada con ID:', createdIds.meeting);

    console.log('\n--- 🧪 TEST 4: Crear Diagnóstico (Briefing) ---');
    const mockDiag = {
      leadId: createdIds.lead,
      problemsDetected: ['Falta de control de inventarios', 'Retraso en facturación'],
      complexityLevel: 'medium',
      valueProposals: ['Implementación Core POS', 'Módulo de caja diaria'],
      updatedAt: new Date().toISOString()
    };

    const resDiag = await fetch(`${centralUrl}/diagnostics?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatREST(mockDiag))
    });

    if (!resDiag.ok) throw new Error(`Fallo al crear Diagnóstico: status ${resDiag.status}`);
    const diagDoc = await resDiag.json();
    createdIds.diagnostic = diagDoc.name.split('/').pop();
    console.log('✅ Diagnóstico creado con ID:', createdIds.diagnostic);

    console.log('\n--- 🧪 TEST 5: Crear Propuesta comercial ---');
    const mockProposal = {
      leadId: createdIds.lead,
      title: 'Solución POS Integral SmartFix',
      setupValue: 1200,
      billingMode: 'percentage',
      comisionPercent: 1.8,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    const resProposal = await fetch(`${centralUrl}/proposals?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatREST(mockProposal))
    });

    if (!resProposal.ok) throw new Error(`Fallo al crear Propuesta: status ${resProposal.status}`);
    const proposalDoc = await resProposal.json();
    createdIds.proposal = proposalDoc.name.split('/').pop();
    console.log('✅ Propuesta creada con ID:', createdIds.proposal);

    console.log('\n--- 🧪 TEST 6: Actualizar Propuesta a Enviada ---');
    const updateProposalData = {
      ...mockProposal,
      status: 'sent'
    };
    const resUpdateProp = await fetch(`${centralUrl}/proposals/${createdIds.proposal}?key=${apiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatREST(updateProposalData))
    });
    if (!resUpdateProp.ok) throw new Error(`Fallo al actualizar propuesta: status ${resUpdateProp.status}`);
    console.log('✅ Propuesta actualizada a "sent" con éxito.');

  } catch (error) {
    console.error('❌ Error crítico durante las pruebas de CRM:', error.message);
  } finally {
    console.log('\n--- 🧹 LIMPIEZA: Eliminando documentos de prueba creados ---');
    
    if (createdIds.proposal) {
      const r = await fetch(`${centralUrl}/proposals/${createdIds.proposal}?key=${apiKey}`, { method: 'DELETE' });
      if (r.ok) console.log('🗑️ Propuesta eliminada.');
    }
    if (createdIds.diagnostic) {
      const r = await fetch(`${centralUrl}/diagnostics/${createdIds.diagnostic}?key=${apiKey}`, { method: 'DELETE' });
      if (r.ok) console.log('🗑️ Diagnóstico eliminado.');
    }
    if (createdIds.meeting) {
      const r = await fetch(`${centralUrl}/meetings/${createdIds.meeting}?key=${apiKey}`, { method: 'DELETE' });
      if (r.ok) console.log('🗑️ Reunión eliminada.');
    }
    if (createdIds.lead) {
      const r = await fetch(`${centralUrl}/leads/${createdIds.lead}?key=${apiKey}`, { method: 'DELETE' });
      if (r.ok) console.log('🗑️ Lead eliminado.');
    }
    console.log('✅ Limpieza completada.');
  }
}

runTests();
