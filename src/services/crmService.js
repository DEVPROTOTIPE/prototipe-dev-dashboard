import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';

// Helper para sanitizar y normalizar strings recursivamente (evita XSS e inyecciones básicas)
export function sanitizePayload(data) {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/<[^>]*>/g, '') // Remover cualquier tag HTML
      .normalize('NFC');
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item));
  }
  if (typeof data === 'object') {
    // Si es un objeto de tipo Timestamp de Firebase, no procesar
    if (data.constructor && data.constructor.name === 'Timestamp') {
      return data;
    }
    // Si es un objeto de tipo Date, no procesar
    if (data instanceof Date) {
      return data;
    }
    const sanitized = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizePayload(data[key]);
      }
    }
    return sanitized;
  }
  return data;
}

export const crmService = {
  // Helper de slugify para generar clientIds únicos y evitar conflictos
  generateUniqueClientId: async (companyName) => {
    let slug = (companyName || 'cliente')
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
      .replace(/[\s_]+/g, '-') // Reemplazar espacios y guiones bajos por un solo guión
      .replace(/-+/g, '-') // Reemplazar guiones múltiples por uno solo
      .replace(/^-+|-+$/g, ''); // Quitar guiones al inicio/final

    if (!slug) slug = 'cliente';

    let uniqueSlug = slug;
    let counter = 2;
    let exists = true;

    while (exists) {
      const docRef = doc(db, 'clientes_control', uniqueSlug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      } else {
        exists = false;
      }
    }
    return uniqueSlug;
  },

  // Helper para registrar actividades de auditoría transaccionales en batch
  logActivityInBatch: (batch, { userId, userName, action, entityType, entityId, details }) => {
    const logRef = doc(collection(db, 'activity_logs'));
    batch.set(logRef, {
      timestamp: serverTimestamp(),
      userId: userId || 'system',
      userName: userName || 'Sistema',
      action,
      entityType,
      entityId,
      details: details || ''
    });
  },

  // Helper para registrar actividad de auditoría individual asíncrona
  logActivity: async ({ userId, userName, action, entityType, entityId, details }) => {
    try {
      await addDoc(collection(db, 'activity_logs'), {
        timestamp: serverTimestamp(),
        userId: userId || 'system',
        userName: userName || 'Sistema',
        action,
        entityType,
        entityId,
        details: details || ''
      });
    } catch (err) {
      console.error('[crmService] Error al guardar logActivity:', err);
    }
  },

  // ==========================================
  // LEADS OPERATIONS
  // ==========================================
  
  createLead: async (leadData, user) => {
    try {
      const docRef = await addDoc(collection(db, 'leads'), {
        ...leadData,
        status: leadData.status || 'lead_new',
        priority: leadData.priority || 'C',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: leadData.notes || []
      });

      // Registrar log de auditoría
      await addDoc(collection(db, 'activity_logs'), {
        timestamp: serverTimestamp(),
        userId: user?.uid || 'system',
        userName: user?.email || 'Sistema',
        action: 'LEAD_CREATED',
        entityType: 'lead',
        entityId: docRef.id,
        details: `Lead creado para la empresa ${leadData.company || leadData.name}`
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating lead in crmService:', error);
      throw error;
    }
  },

  updateLead: async (leadId, leadData) => {
    try {
      const docRef = doc(db, 'leads', leadId);
      await updateDoc(docRef, {
        ...leadData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating lead in crmService:', error);
      throw error;
    }
  },

  archiveLead: async (leadId, lossReason, notes, user) => {
    try {
      const docRef = doc(db, 'leads', leadId);
      await updateDoc(docRef, {
        status: 'lost',
        lossReason,
        updatedAt: serverTimestamp()
      });
      if (notes) {
        await crmService.addLeadNote(leadId, user?.email || 'Sistema', `Lead archivado. Motivo: ${lossReason}. Detalle: ${notes}`);
      }
    } catch (error) {
      console.error('Error archiving lead in crmService:', error);
      throw error;
    }
  },

  addLeadNote: async (leadId, author, content) => {
    try {
      const docRef = doc(db, 'leads', leadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentNotes = docSnap.data().notes || [];
        const newNote = {
          timestamp: new Date().toISOString(),
          author,
          content
        };
        await updateDoc(docRef, {
          notes: [newNote, ...currentNotes],
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error adding lead note in crmService:', error);
      throw error;
    }
  },

  deleteLead: async (leadId) => {
    try {
      await deleteDoc(doc(db, 'leads', leadId));
    } catch (error) {
      console.error('Error deleting lead in crmService:', error);
      throw error;
    }
  },

  // ==========================================
  // MEETINGS OPERATIONS
  // ==========================================

  createMeeting: async (meetingData, user) => {
    const batch = writeBatch(db);
    try {
      const meetingRef = doc(collection(db, 'meetings'));
      batch.set(meetingRef, {
        ...meetingData,
        status: meetingData.status || 'scheduled',
        createdAt: serverTimestamp()
      });

      if (meetingData.leadId) {
        const leadRef = doc(db, 'leads', meetingData.leadId);
        batch.update(leadRef, {
          status: 'meeting_scheduled',
          updatedAt: serverTimestamp()
        });
      }

      // Log de auditoría
      crmService.logActivityInBatch(batch, {
        userId: user?.uid,
        userName: user?.email,
        action: 'MEETING_CREATED',
        entityType: 'meeting',
        entityId: meetingRef.id,
        details: `Reunión agendada para el lead ID: ${meetingData.leadId}`
      });

      await batch.commit();
      return meetingRef.id;
    } catch (error) {
      console.error('Error creating meeting in crmService:', error);
      throw error;
    }
  },

  updateMeeting: async (meetingId, meetingData) => {
    try {
      const docRef = doc(db, 'meetings', meetingId);
      await updateDoc(docRef, {
        ...meetingData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating meeting in crmService:', error);
      throw error;
    }
  },

  deleteMeeting: async (meetingId) => {
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
    } catch (error) {
      console.error('Error deleting meeting in crmService:', error);
      throw error;
    }
  },

  // ==========================================
  // DIAGNOSTICS OPERATIONS
  // ==========================================

  saveDiagnostic: async (diagnosticData, user) => {
    const batch = writeBatch(db);
    try {
      const diagRef = doc(collection(db, 'diagnostics'));
      batch.set(diagRef, {
        ...diagnosticData,
        updatedAt: serverTimestamp()
      });

      if (diagnosticData.leadId) {
        const leadRef = doc(db, 'leads', diagnosticData.leadId);
        batch.update(leadRef, {
          status: 'diagnostic_completed',
          updatedAt: serverTimestamp()
        });
      }

      // Log de auditoría
      crmService.logActivityInBatch(batch, {
        userId: user?.uid,
        userName: user?.email,
        action: 'DIAGNOSTIC_COMPLETED',
        entityType: 'diagnostic',
        entityId: diagRef.id,
        details: `Diagnóstico completado para el lead ID: ${diagnosticData.leadId}`
      });

      await batch.commit();
      return diagRef.id;
    } catch (error) {
      console.error('Error saving diagnostic in crmService:', error);
      throw error;
    }
  },

  updateDiagnostic: async (diagnosticId, diagnosticData) => {
    try {
      const docRef = doc(db, 'diagnostics', diagnosticId);
      await updateDoc(docRef, {
        ...diagnosticData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating diagnostic in crmService:', error);
      throw error;
    }
  },

  deleteDiagnostic: async (diagnosticId) => {
    try {
      await deleteDoc(doc(db, 'diagnostics', diagnosticId));
    } catch (error) {
      console.error('Error deleting diagnostic in crmService:', error);
      throw error;
    }
  },

  // ==========================================
  // PROPOSALS OPERATIONS
  // ==========================================

  createProposal: async (proposalData) => {
    try {
      const docRef = await addDoc(collection(db, 'proposals'), {
        ...proposalData,
        status: proposalData.status || 'draft',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating proposal in crmService:', error);
      throw error;
    }
  },

  updateProposal: async (proposalId, proposalData, user) => {
    const batch = writeBatch(db);
    try {
      const docRef = doc(db, 'proposals', proposalId);
      batch.update(docRef, {
        ...proposalData,
        updatedAt: serverTimestamp()
      });

      // Triggers reactivos al estado de la propuesta
      if (proposalData.status && proposalData.leadId) {
        const leadRef = doc(db, 'leads', proposalData.leadId);
        
        if (proposalData.status === 'sent') {
          batch.update(leadRef, {
            status: 'proposal_sent',
            updatedAt: serverTimestamp()
          });

          // Log de auditoría
          crmService.logActivityInBatch(batch, {
            userId: user?.uid,
            userName: user?.email,
            action: 'PROPOSAL_SENT',
            entityType: 'proposal',
            entityId: proposalId,
            details: `Propuesta enviada para el lead ID: ${proposalData.leadId}`
          });
        } 
        else if (proposalData.status === 'negotiation') {
          batch.update(leadRef, {
            status: 'negotiation',
            updatedAt: serverTimestamp()
          });
        } 
        else if (proposalData.status === 'lost') {
          batch.update(leadRef, {
            status: 'lost',
            lossReason: proposalData.lossReason || 'No especificado',
            updatedAt: serverTimestamp()
          });

          // Registrar nota con motivo de pérdida
          const leadSnap = await getDoc(leadRef);
          if (leadSnap.exists()) {
            const currentNotes = leadSnap.data().notes || [];
            const newNote = {
              timestamp: new Date().toISOString(),
              author: user?.email || 'Sistema',
              content: `Propuesta PERDIDA. Motivo: ${proposalData.lossReason || 'No especificado'}`
            };
            batch.update(leadRef, {
              notes: [newNote, ...currentNotes]
            });
          }
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating proposal in crmService:', error);
      throw error;
    }
  },

  deleteProposal: async (proposalId) => {
    try {
      await deleteDoc(doc(db, 'proposals', proposalId));
    } catch (error) {
      console.error('Error deleting proposal in crmService:', error);
      throw error;
    }
  },

  // ==========================================
  // PROJECTS OPERATIONS
  // ==========================================

  createProject: async (projectData) => {
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        status: projectData.status || 'planning',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating project in crmService:', error);
      throw error;
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        ...projectData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating project in crmService:', error);
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      console.error('Error deleting project in crmService:', error);
      throw error;
    }
  },

  // ==========================================
  // FOLLOWUPS OPERATIONS
  // ==========================================

  createFollowup: async (followupData) => {
    try {
      const docRef = await addDoc(collection(db, 'followups'), {
        ...followupData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating followup in crmService:', error);
      throw error;
    }
  },

  updateFollowup: async (followupId, followupData) => {
    try {
      const docRef = doc(db, 'followups', followupId);
      await updateDoc(docRef, {
        ...followupData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating followup in crmService:', error);
      throw error;
    }
  },

  deleteFollowup: async (followupId) => {
    try {
      await deleteDoc(doc(db, 'followups', followupId));
    } catch (error) {
      console.error('Error deleting followup in crmService:', error);
      throw error;
    }
  },

  // ==========================================
  // TASKS OPERATIONS
  // ==========================================

  createTask: async (taskData) => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        status: taskData.status || 'pending',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating task in crmService:', error);
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const docRef = doc(db, 'tasks', taskId);
      await updateDoc(docRef, {
        ...taskData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating task in crmService:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task in crmService:', error);
      throw error;
    }
  },

  // ==========================================
  // TRANSACTIONAL CONVERSION (LEAD -> CLIENT -> PROJECT)
  // ==========================================

  convertLeadToClient: async (leadId, proposalId, onboardingData, user) => {
    const batch = writeBatch(db);
    try {
      // 1. Generar automáticamente el unique clientIdSlug a partir del nombre de la empresa
      const companyName = onboardingData.nombre || 'cliente';
      const clientIdSlug = await crmService.generateUniqueClientId(companyName);

      // 2. Obtener referencias
      const leadRef = doc(db, 'leads', leadId);
      const proposalRef = doc(db, 'proposals', proposalId);
      const clientControlRef = doc(db, 'clientes_control', clientIdSlug);
      const projectRef = doc(collection(db, 'projects'));
      const provisioningRef = doc(collection(db, 'provisioning_orders'));

      // 3. Cambiar estado de lead a 'won' y actualizar propuesta a 'won'
      batch.update(leadRef, {
        status: 'won',
        updatedAt: serverTimestamp()
      });
      batch.update(proposalRef, {
        status: 'won',
        updatedAt: serverTimestamp()
      });

      // 4. Crear registro en clientes_control
      const clientPortalToken = onboardingData.telemetryToken || `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const clientData = {
        id: clientIdSlug,
        nombre: companyName,
        estado: 'Activo',
        contacto: {
          nombre: onboardingData.contactoNombre || '',
          telefono: onboardingData.contactoTelefono || '',
          correo: onboardingData.contactoCorreo || ''
        },
        comercial: {
          leadId: leadId,
          proposalId: proposalId,
          fechaInicio: new Date().toISOString().split('T')[0],
          modeloMonetizacion: onboardingData.modeloMonetizacion || 'percentage',
          setupValor: Number(onboardingData.setupValor || 0),
          mensualidadValor: Number(onboardingData.mensualidadValor || 0),
          comisionPorcentaje: Number(onboardingData.comisionPorcentaje || 0)
        },
        tecnico: {
          projectId: clientIdSlug,
          versionCore: onboardingData.versionCore || '1.0.0',
          urlHosting: onboardingData.urlHosting || ''
        }
      };
      batch.set(clientControlRef, clientData, { merge: true });

      // 5. Crear orden de proyecto en Planeación
      const projectData = {
        clienteId: clientIdSlug,
        leadId: leadId,
        proposalId: proposalId,
        status: 'planning',
        createdAt: serverTimestamp()
      };
      batch.set(projectRef, projectData);

      // 6. Crear orden de aprovisionamiento en provisioning_orders
      const provisioningData = {
        clientId: clientIdSlug,
        leadId: leadId,
        proposalId: proposalId,
        status: 'pending',
        approved: false,
        createdAt: serverTimestamp()
      };
      batch.set(provisioningRef, provisioningData);

      // 6b. Crear credenciales del portal en client_credentials
      const credentialsRef = doc(db, 'client_credentials', clientIdSlug);
      const credentialsData = {
        token: clientPortalToken,
        createdAt: serverTimestamp(),
        active: true
      };
      batch.set(credentialsRef, credentialsData);

      // 7. Registrar logs de auditoría en activity_logs
      crmService.logActivityInBatch(batch, {
        userId: user?.uid,
        userName: user?.email,
        action: 'PROPOSAL_WON',
        entityType: 'proposal',
        entityId: proposalId,
        details: `Propuesta ganada y aprobada para ${companyName}`
      });

      crmService.logActivityInBatch(batch, {
        userId: user?.uid,
        userName: user?.email,
        action: 'CLIENT_CREATED',
        entityType: 'client',
        entityId: clientIdSlug,
        details: `Cliente creado automáticamente en clientes_control: ${clientIdSlug}`
      });

      crmService.logActivityInBatch(batch, {
        userId: user?.uid,
        userName: user?.email,
        action: 'PROJECT_CREATED',
        entityType: 'project',
        entityId: projectRef.id,
        details: `Proyecto de implementación en Planeación iniciado para ${clientIdSlug}`
      });

      // Confirmar batch
      await batch.commit();
      return { clientId: clientIdSlug, projectId: projectRef.id, provisioningOrderId: provisioningRef.id };
    } catch (error) {
      console.error('Error during convertLeadToClient transaction:', error);
      throw error;
    }
  }
};
