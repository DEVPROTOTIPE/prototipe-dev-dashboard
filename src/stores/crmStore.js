import { create } from 'zustand';
import { db } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  limit
} from 'firebase/firestore';
import { crmService, sanitizePayload } from '../services/crmService';

// Mock Data for Sandbox / Offline Mode
const MOCK_LEADS = [
  { id: 'lead-1', name: 'Sergio Herrera', company: 'SmartFix', sector: 'retail_electronics', phone: '+5215551234', email: 'sergio@smartfix.com', priority: 'A', status: 'lead_new', notes: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'lead-2', name: 'Laura Gómez', company: 'Boutique Bella', sector: 'retail_clothing', phone: '+5215555678', email: 'laura@boutiquebella.com', priority: 'B', status: 'meeting_scheduled', notes: [{ timestamp: new Date().toISOString(), author: 'Sistema', content: 'Reunión inicial registrada en agenda.' }], createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() }
];

const MOCK_MEETINGS = [
  { id: 'meet-1', leadId: 'lead-2', date: new Date(Date.now() + 86400000).toISOString(), type: 'virtual', notes: 'Reunión de descubrimiento inicial.', status: 'scheduled', createdAt: new Date().toISOString() }
];

const MOCK_DIAGNOSTICS = [];
const MOCK_PROPOSALS = [];
const MOCK_PROJECTS = [
  { id: 'proj-1', clienteId: 'smartfix', projectName: 'Implementación Core - SmartFix', status: 'development', deliveryDate: null, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'proj-2', clienteId: 'boutique-bella', projectName: 'Implementación Core - Boutique Bella', status: 'planning', deliveryDate: null, createdAt: new Date(Date.now() - 1 * 86400000).toISOString() }
];
const MOCK_FOLLOWUPS = [
  { id: 'foll-1', clientId: 'smartfix', date: new Date(Date.now() - 4 * 86400000).toISOString(), type: 'llamada', description: 'Revisión técnica de paridad de base de datos. Todo en orden.', agent: 'Comercial Central', nextActionDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], alerts: [] },
  { id: 'foll-2', clientId: 'boutique-bella', date: new Date(Date.now() - 1 * 86400000).toISOString(), type: 'whatsapp', description: 'Contacto comisionista mensual pendiente. Solicita prórroga.', agent: 'Comercial Central', nextActionDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], alerts: ['Pendiente Conciliación'] }
];
const MOCK_TASKS = [
  { id: 'task-1', leadId: 'lead-1', title: 'Llamar para calificar necesidades', type: 'task_call', date: new Date().toISOString().split('T')[0], priority: 'alta', status: 'pendiente', createdAt: new Date().toISOString() },
  { id: 'task-2', clientId: 'smartfix', title: 'Entregar capacitación de POS Express', type: 'task_meeting', date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], priority: 'alta', status: 'pendiente', createdAt: new Date().toISOString() },
  { id: 'task-3', clientId: 'boutique-bella', title: 'Revisar diferencias de reglas Firestore', type: 'task_docs', date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], priority: 'media', status: 'pendiente', createdAt: new Date().toISOString() }
];
const MOCK_SETTINGS = [
  { id: 'global', setupBase: 1000, commissionBase: 1.5, dianFacturaCosto: 150 }
];
const MOCK_ACTIVITY_LOGS = [
  { id: 'act-1', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), userId: 'admin-1', userName: 'admin@prototipe.io', action: 'LEAD_CREATED', entityType: 'lead', entityId: 'lead-1', details: 'Lead registrado para la empresa SmartFix' },
  { id: 'act-2', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), userId: 'admin-1', userName: 'admin@prototipe.io', action: 'LEAD_CREATED', entityType: 'lead', entityId: 'lead-2', details: 'Lead registrado para la empresa Boutique Bella' },
  { id: 'act-3', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), userId: 'admin-1', userName: 'admin@prototipe.io', action: 'MEETING_CREATED', entityType: 'meeting', entityId: 'meet-1', details: 'Reunión agendada para lead Boutique Bella' },
  { id: 'act-4', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), userId: 'admin-1', userName: 'admin@prototipe.io', action: 'DIAGNOSTIC_COMPLETED', entityType: 'diagnostic', entityId: 'diag-1', details: 'Diagnóstico completado para lead SmartFix' },
  { id: 'act-5', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), userId: 'admin-1', userName: 'admin@prototipe.io', action: 'PROPOSAL_SENT', entityType: 'proposal', entityId: 'prop-1', details: 'Propuesta comercial enviada a SmartFix' },
  { id: 'act-6', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), userId: 'admin-1', userName: 'admin@prototipe.io', action: 'PROPOSAL_WON', entityType: 'proposal', entityId: 'prop-1', details: 'Propuesta ganada por SmartFix' },
  { id: 'act-7', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), userId: 'admin-1', userName: 'admin@prototipe.io', action: 'CLIENT_CREATED', entityType: 'client', entityId: 'smartfix', details: 'Cliente SmartFix creado en clientes_control' },
  { id: 'act-8', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), userId: 'admin-1', userName: 'admin@prototipe.io', action: 'PROJECT_CREATED', entityType: 'project', entityId: 'proj-1', details: 'Proyecto de implementación para SmartFix creado' }
];

export const useCrmStore = create((set, get) => {
  // Referencias para desuscripciones reactivas
  let unsubLeads = null;
  let unsubMeetings = null;
  let unsubDiagnostics = null;
  let unsubProposals = null;
  let unsubProjects = null;
  let unsubFollowups = null;
  let unsubTasks = null;
  let unsubSettings = null;
  let unsubActivityLogs = null;
  let activeSubscriptions = 0;

  return {
    // Estado del CRM
    leads: [],
    meetings: [],
    diagnostics: [],
    proposals: [],
    projects: [],
    followups: [],
    tasks: [],
    settings: [],
    activityLogs: [],
    
    // Estados de control
    loading: false,
    isSimulated: false,
    error: null,

    // Iniciar suscripciones reactivas en tiempo real
    subscribeCrm: () => {
      activeSubscriptions++;

      // Si ya hay una suscripción activa, no duplicar listeners
      if (activeSubscriptions > 1) {
        console.log(`🔗 Reutilizando suscripción activa del CRM. Referencias: ${activeSubscriptions}`);
        return;
      }

      set({ loading: true, error: null });

      // Si el devStore global ya está simulado, forzar simulación en CRM
      const isGlobalSimulated = localStorage.getItem('db_simulated') === 'true';
      if (isGlobalSimulated) {
        get().loadMockCrmData();
        return;
      } else {
        set({ isSimulated: false });
      }

      try {
        console.log("🔥 Registrando nuevos listeners de Firestore para CRM...");
        // 1. Suscripción a Leads
        const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
        unsubLeads = onSnapshot(qLeads, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ leads: list, loading: false, isSimulated: false });
        }, (error) => {
          console.warn("Fallo al escuchar leads en Firestore. Cargando Sandbox CRM local:", error);
          get().loadMockCrmData();
        });

        // 2. Suscripción a Meetings
        const qMeetings = query(collection(db, 'meetings'), orderBy('date', 'asc'));
        unsubMeetings = onSnapshot(qMeetings, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ meetings: list });
        }, (error) => {
          console.warn("Fallo al escuchar meetings:", error.message);
        });

        // 3. Suscripción a Diagnostics
        const qDiagnostics = collection(db, 'diagnostics');
        unsubDiagnostics = onSnapshot(qDiagnostics, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ diagnostics: list });
        }, (error) => {
          console.warn("Fallo al escuchar diagnostics:", error.message);
        });

        // 4. Suscripción a Proposals
        const qProposals = query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
        unsubProposals = onSnapshot(qProposals, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ proposals: list });
        }, (error) => {
          console.warn("Fallo al escuchar proposals:", error.message);
        });

        // 5. Suscripción a Projects
        const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        unsubProjects = onSnapshot(qProjects, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ projects: list });
        }, (error) => {
          console.warn("Fallo al escuchar projects:", error.message);
        });

        // 6. Suscripción a Followups
        const qFollowups = query(collection(db, 'followups'), orderBy('date', 'desc'));
        unsubFollowups = onSnapshot(qFollowups, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ followups: list });
        }, (error) => {
          console.warn("Fallo al escuchar followups:", error.message);
        });

        // 7. Suscripción a Tasks
        const qTasks = query(collection(db, 'tasks'), orderBy('createdAt', 'asc'));
        unsubTasks = onSnapshot(qTasks, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ tasks: list });
        }, (error) => {
          console.warn("Fallo al escuchar tasks:", error.message);
        });

        // 8. Suscripción a Settings
        const qSettings = collection(db, 'settings');
        unsubSettings = onSnapshot(qSettings, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ settings: list });
        }, (error) => {
          console.warn("Fallo al escuchar settings:", error.message);
        });
        
        // 9. Suscripción a Activity Logs
        const qActivity = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(300));
        unsubActivityLogs = onSnapshot(qActivity, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          set({ activityLogs: list });
        }, (error) => {
          console.warn("Fallo al escuchar activity_logs:", error.message);
        });

      } catch (err) {
        console.error("Error setting up CRM listeners:", err);
        get().loadMockCrmData();
      }
    },

    // Cargar datos simulados en Sandbox
    loadMockCrmData: () => {
      set({
        leads: MOCK_LEADS,
        meetings: MOCK_MEETINGS,
        diagnostics: MOCK_DIAGNOSTICS,
        proposals: MOCK_PROPOSALS,
        projects: MOCK_PROJECTS,
        followups: MOCK_FOLLOWUPS,
        tasks: MOCK_TASKS,
        settings: MOCK_SETTINGS,
        activityLogs: MOCK_ACTIVITY_LOGS,
        isSimulated: true,
        loading: false
      });
      console.log("🎮 Entorno Sandbox CRM inicializado con datos mock.");
    },

    // Detener suscripciones reactivas
    unsubscribeCrm: () => {
      if (activeSubscriptions > 0) {
        activeSubscriptions--;
      }

      // Solo desuscribirse de Firestore si ya no quedan observadores activos
      if (activeSubscriptions > 0) {
        console.log(`🔗 Liberando una referencia del CRM. Referencias restantes: ${activeSubscriptions}`);
        return;
      }

      console.log("🛑 Deteniendo todos los listeners activos de Firestore para CRM...");
      if (unsubLeads) { unsubLeads(); unsubLeads = null; }
      if (unsubMeetings) { unsubMeetings(); unsubMeetings = null; }
      if (unsubDiagnostics) { unsubDiagnostics(); unsubDiagnostics = null; }
      if (unsubProposals) { unsubProposals(); unsubProposals = null; }
      if (unsubProjects) { unsubProjects(); unsubProjects = null; }
      if (unsubFollowups) { unsubFollowups(); unsubFollowups = null; }
      if (unsubTasks) { unsubTasks(); unsubTasks = null; }
      if (unsubSettings) { unsubSettings(); unsubSettings = null; }
      if (unsubActivityLogs) { unsubActivityLogs(); unsubActivityLogs = null; }
    },

    // ==========================================
    // ACTIONS MAPPING FROM SERVICE (WITH SANDBOX SUPPORT)
    // ==========================================
    
    addLead: async (leadData) => {
      const sanitizedData = sanitizePayload(leadData);
      if (get().isSimulated) {
        const newLead = {
          id: `mock-lead-${Date.now()}`,
          ...sanitizedData,
          status: sanitizedData.status || 'lead_new',
          priority: sanitizedData.priority || 'C',
          notes: sanitizedData.notes || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set(state => ({ leads: [newLead, ...state.leads] }));
        return newLead.id;
      }
      return await crmService.createLead(sanitizedData);
    },

    updateLead: async (leadId, leadData) => {
      const sanitizedData = sanitizePayload(leadData);
      if (get().isSimulated) {
        set(state => ({
          leads: state.leads.map(l => l.id === leadId ? { ...l, ...sanitizedData, updatedAt: new Date().toISOString() } : l)
        }));
        return;
      }
      await crmService.updateLead(leadId, sanitizedData);
    },

    archiveLead: async (leadId, lossReason, notes) => {
      const sanitizedLoss = sanitizePayload(lossReason);
      const sanitizedNotes = sanitizePayload(notes);
      if (get().isSimulated) {
        set(state => ({
          leads: state.leads.map(l => l.id === leadId ? { ...l, status: 'lost', lossReason: sanitizedLoss, updatedAt: new Date().toISOString() } : l)
        }));
        if (sanitizedNotes) {
          await get().addLeadNote(leadId, 'Sistema', `Lead archivado. Motivo: ${sanitizedLoss}. Detalle: ${sanitizedNotes}`);
        }
        return;
      }
      await crmService.archiveLead(leadId, sanitizedLoss, sanitizedNotes);
    },

    addLeadNote: async (leadId, author, content) => {
      const sanitizedAuthor = sanitizePayload(author);
      const sanitizedContent = sanitizePayload(content);
      if (get().isSimulated) {
        const newNote = {
          timestamp: new Date().toISOString(),
          author: sanitizedAuthor,
          content: sanitizedContent
        };
        set(state => ({
          leads: state.leads.map(l => l.id === leadId ? { ...l, notes: [newNote, ...(l.notes || [])], updatedAt: new Date().toISOString() } : l)
        }));
        return;
      }
      await crmService.addLeadNote(leadId, sanitizedAuthor, sanitizedContent);
    },

    deleteLead: async (leadId) => {
      if (get().isSimulated) {
        set(state => ({ leads: state.leads.filter(l => l.id !== leadId) }));
        return;
      }
      await crmService.deleteLead(leadId);
    },

    addMeeting: async (meetingData) => {
      const sanitizedData = sanitizePayload(meetingData);
      if (get().isSimulated) {
        const newMeeting = {
          id: `mock-meet-${Date.now()}`,
          ...sanitizedData,
          status: sanitizedData.status || 'scheduled',
          createdAt: new Date().toISOString()
        };
        set(state => ({ 
          meetings: [...state.meetings, newMeeting],
          leads: state.leads.map(l => l.id === sanitizedData.leadId ? { ...l, status: 'meeting_scheduled', updatedAt: new Date().toISOString() } : l)
        }));
        return newMeeting.id;
      }
      return await crmService.createMeeting(sanitizedData);
    },

    updateMeeting: async (meetingId, meetingData) => {
      const sanitizedData = sanitizePayload(meetingData);
      if (get().isSimulated) {
        set(state => ({
          meetings: state.meetings.map(m => m.id === meetingId ? { ...m, ...sanitizedData } : m)
        }));
        return;
      }
      await crmService.updateMeeting(meetingId, sanitizedData);
    },

    deleteMeeting: async (meetingId) => {
      if (get().isSimulated) {
        set(state => ({ meetings: state.meetings.filter(m => m.id !== meetingId) }));
        return;
      }
      await crmService.deleteMeeting(meetingId);
    },

    saveDiagnostic: async (diagnosticData) => {
      const sanitizedData = sanitizePayload(diagnosticData);
      if (get().isSimulated) {
        const newDiag = {
          id: `mock-diag-${Date.now()}`,
          ...sanitizedData,
          updatedAt: new Date().toISOString()
        };
        set(state => ({
          diagnostics: [...state.diagnostics, newDiag],
          leads: state.leads.map(l => l.id === sanitizedData.leadId ? { ...l, status: 'diagnostic_completed', updatedAt: new Date().toISOString() } : l)
        }));
        return newDiag.id;
      }
      return await crmService.saveDiagnostic(sanitizedData);
    },

    updateDiagnostic: async (diagnosticId, diagnosticData) => {
      const sanitizedData = sanitizePayload(diagnosticData);
      if (get().isSimulated) {
        set(state => ({
          diagnostics: state.diagnostics.map(d => d.id === diagnosticId ? { ...d, ...sanitizedData } : d)
        }));
        return;
      }
      await crmService.updateDiagnostic(diagnosticId, sanitizedData);
    },

    deleteDiagnostic: async (diagnosticId) => {
      if (get().isSimulated) {
        set(state => ({ diagnostics: state.diagnostics.filter(d => d.id !== diagnosticId) }));
        return;
      }
      await crmService.deleteDiagnostic(diagnosticId);
    },

    addProposal: async (proposalData) => {
      const sanitizedData = sanitizePayload(proposalData);
      if (get().isSimulated) {
        const newProposal = {
          id: `mock-prop-${Date.now()}`,
          ...sanitizedData,
          status: sanitizedData.status || 'draft',
          createdAt: new Date().toISOString()
        };
        set(state => ({ proposals: [newProposal, ...state.proposals] }));
        return newProposal.id;
      }
      return await crmService.createProposal(sanitizedData);
    },

    updateProposal: async (proposalId, proposalData, user) => {
      const sanitizedData = sanitizePayload(proposalData);
      if (get().isSimulated) {
        set(state => {
          let updatedLeads = state.leads;
          if (sanitizedData.status && sanitizedData.leadId) {
            if (sanitizedData.status === 'sent') {
              updatedLeads = state.leads.map(l => l.id === sanitizedData.leadId ? { ...l, status: 'proposal_sent', updatedAt: new Date().toISOString() } : l);
            } else if (sanitizedData.status === 'negotiation') {
              updatedLeads = state.leads.map(l => l.id === sanitizedData.leadId ? { ...l, status: 'negotiation', updatedAt: new Date().toISOString() } : l);
            } else if (sanitizedData.status === 'lost') {
              updatedLeads = state.leads.map(l => {
                if (l.id === sanitizedData.leadId) {
                  const newNote = {
                    timestamp: new Date().toISOString(),
                    author: user?.email || 'Sistema',
                    content: `Propuesta PERDIDA. Motivo: ${sanitizedData.lossReason || 'No especificado'}`
                  };
                  return {
                    ...l,
                    status: 'lost',
                    lossReason: sanitizedData.lossReason || 'No especificado',
                    notes: [newNote, ...(l.notes || [])],
                    updatedAt: new Date().toISOString()
                  };
                }
                return l;
              });
            }
          }
          return {
            proposals: state.proposals.map(p => p.id === proposalId ? { ...p, ...sanitizedData } : p),
            leads: updatedLeads
          };
        });
        return;
      }
      await crmService.updateProposal(proposalId, sanitizedData, user);
    },

    deleteProposal: async (proposalId) => {
      if (get().isSimulated) {
        set(state => ({ proposals: state.proposals.filter(p => p.id !== proposalId) }));
        return;
      }
      await crmService.deleteProposal(proposalId);
    },

    addProject: async (projectData) => {
      const sanitizedData = sanitizePayload(projectData);
      if (get().isSimulated) {
        const newProj = {
          id: `mock-proj-${Date.now()}`,
          ...sanitizedData,
          status: sanitizedData.status || 'planning',
          createdAt: new Date().toISOString()
        };
        set(state => ({ projects: [newProj, ...state.projects] }));
        return newProj.id;
      }
      return await crmService.createProject(sanitizedData);
    },

    updateProject: async (projectId, projectData) => {
      const sanitizedData = sanitizePayload(projectData);
      if (get().isSimulated) {
        set(state => ({
          projects: state.projects.map(p => p.id === projectId ? { ...p, ...sanitizedData } : p)
        }));
        return;
      }
      await crmService.updateProject(projectId, sanitizedData);
    },

    deleteProject: async (projectId) => {
      if (get().isSimulated) {
        set(state => ({ projects: state.projects.filter(p => p.id !== projectId) }));
        return;
      }
      await crmService.deleteProject(projectId);
    },

    addFollowup: async (followupData) => {
      const sanitizedData = sanitizePayload(followupData);
      if (get().isSimulated) {
        const newFollow = {
          id: `mock-follow-${Date.now()}`,
          ...sanitizedData,
          createdAt: new Date().toISOString()
        };
        set(state => ({ followups: [newFollow, ...state.followups] }));
        return newFollow.id;
      }
      return await crmService.createFollowup(sanitizedData);
    },

    updateFollowup: async (followupId, followupData) => {
      const sanitizedData = sanitizePayload(followupData);
      if (get().isSimulated) {
        set(state => ({
          followups: state.followups.map(f => f.id === followupId ? { ...f, ...sanitizedData } : f)
        }));
        return;
      }
      await crmService.updateFollowup(followupId, sanitizedData);
    },

    deleteFollowup: async (followupId) => {
      if (get().isSimulated) {
        set(state => ({ followups: state.followups.filter(f => f.id !== followupId) }));
        return;
      }
      await crmService.deleteFollowup(followupId);
    },

    addTask: async (taskData) => {
      const sanitizedData = sanitizePayload(taskData);
      if (get().isSimulated) {
        const newT = {
          id: `mock-task-${Date.now()}`,
          ...sanitizedData,
          status: sanitizedData.status || 'pending',
          createdAt: new Date().toISOString()
        };
        set(state => ({ tasks: [...state.tasks, newT] }));
        return newT.id;
      }
      return await crmService.createTask(sanitizedData);
    },

    updateTask: async (taskId, taskData) => {
      const sanitizedData = sanitizePayload(taskData);
      if (get().isSimulated) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...sanitizedData } : t)
        }));
        return;
      }
      await crmService.updateTask(taskId, sanitizedData);
    },

    deleteTask: async (taskId) => {
      if (get().isSimulated) {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
        return;
      }
      await crmService.deleteTask(taskId);
    },

    convertLeadToClient: async (leadId, proposalId, onboardingData, user) => {
      const sanitizedOnboarding = sanitizePayload(onboardingData);
      if (get().isSimulated) {
        const companyName = sanitizedOnboarding.nombre || 'cliente';
        let slug = companyName
          .toLowerCase()
          .trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
          .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
          .replace(/[\s_]+/g, '-') // Reemplazar espacios y guiones bajos por un solo guión
          .replace(/-+/g, '-') // Reemplazar guiones múltiples por uno solo
          .replace(/^-+|-+$/g, ''); // Quitar guiones al inicio/final

        if (!slug) slug = 'cliente';

        let clientIdSlug = slug;
        let counter = 2;
        let exists = true;
        while (exists) {
          const duplicate = get().projects.some(p => p.clienteId === clientIdSlug);
          if (duplicate) {
            clientIdSlug = `${slug}-${counter}`;
            counter++;
          } else {
            exists = false;
          }
        }

        const mockProjectId = `mock-proj-${Date.now()}`;
        const mockProvOrderId = `mock-prov-${Date.now()}`;
        set(state => {
          const updatedLeads = state.leads.map(l => l.id === leadId ? { ...l, status: 'won', updatedAt: new Date().toISOString() } : l);
          const updatedProposals = state.proposals.map(p => p.id === proposalId ? { ...p, status: 'won' } : p);
          
          const newProject = {
            id: mockProjectId,
            clienteId: clientIdSlug,
            projectName: `Implementación Core - ${companyName}`,
            status: 'planning',
            deliveryDate: null,
            createdAt: new Date().toISOString()
          };

          return {
            leads: updatedLeads,
            proposals: updatedProposals,
            projects: [newProject, ...state.projects]
          };
        });
        console.log("🎮 Conversión transaccional simulada completada para:", clientIdSlug);
        return { clientId: clientIdSlug, projectId: mockProjectId, provisioningOrderId: mockProvOrderId };
      }
      return await crmService.convertLeadToClient(leadId, proposalId, sanitizedOnboarding, user);
    }
  };
});

if (typeof window !== 'undefined') {
  window.useCrmStore = useCrmStore;
}
