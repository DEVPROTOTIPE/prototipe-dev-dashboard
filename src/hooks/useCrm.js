import { useEffect } from 'react';
import { useCrmStore } from '../stores/crmStore';

export default function useCrm(autoSubscribe = false) {
  const store = useCrmStore();

  // Suscribirse automáticamente si está configurado
  useEffect(() => {
    if (autoSubscribe) {
      store.subscribeCrm();
      return () => {
        store.unsubscribeCrm();
      };
    }
  }, [autoSubscribe]);

  // Selectores y Helpers Relacionales
  const getLeadById = (leadId) => {
    return store.leads.find(l => l.id === leadId) || null;
  };

  const getMeetingsByLeadId = (leadId) => {
    return store.meetings.filter(m => m.leadId === leadId);
  };

  const getDiagnosticsByLeadId = (leadId) => {
    return store.diagnostics.find(d => d.leadId === leadId) || null;
  };

  const getProposalsByLeadId = (leadId) => {
    return store.proposals.filter(p => p.leadId === leadId);
  };

  const getProjectsByClientId = (clientId) => {
    return store.projects.filter(p => p.clientId === clientId);
  };

  const getFollowupsByClientId = (clientId) => {
    return store.followups.filter(f => f.clientId === clientId);
  };

  const getTasksByLeadId = (leadId) => {
    return store.tasks.filter(t => t.leadId === leadId);
  };

  const getTasksByClientId = (clientId) => {
    return store.tasks.filter(t => t.clientId === clientId);
  };

  // Cálculo de KPIs rápidos localmente
  const getKpis = () => {
    const totalLeads = store.leads.length;
    const leadsWon = store.leads.filter(l => l.status === 'won').length;
    const leadsLost = store.leads.filter(l => l.status === 'lost').length;
    
    // Tasa de conversión
    const conversionRate = totalLeads > 0 
      ? ((leadsWon / totalLeads) * 100).toFixed(1) 
      : '0.0';

    // Pipeline: suma de setupValue de propuestas activas (draft o sent)
    const pipelineValue = store.proposals
      .filter(p => p.status === 'draft' || p.status === 'sent')
      .reduce((sum, p) => sum + Number(p.setupValue || 0), 0);

    // Conteo de reuniones pendientes
    const now = new Date();
    const pendingMeetings = store.meetings
      .filter(m => m.status === 'scheduled' && new Date(m.date?.seconds * 1000 || m.date) >= now)
      .length;

    return {
      totalLeads,
      leadsWon,
      leadsLost,
      conversionRate,
      pipelineValue,
      pendingMeetings
    };
  };

  return {
    ...store,
    getLeadById,
    getMeetingsByLeadId,
    getDiagnosticsByLeadId,
    getProposalsByLeadId,
    getProjectsByClientId,
    getFollowupsByClientId,
    getTasksByLeadId,
    getTasksByClientId,
    getKpis
  };
}
