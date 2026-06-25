/**
 * Constant values and catalogs for the PROTOTIPE CRM Module.
 */

// 1. Pipeline States (Estados del Pipeline)
export const LEAD_STATUS = {
  LEAD_NEW: 'lead_new',
  LEAD_CONTACTED: 'lead_contacted',
  MEETING_SCHEDULED: 'meeting_scheduled',
  MEETING_DONE: 'meeting_done',
  DIAGNOSTIC_PENDING: 'diagnostic_pending',
  DIAGNOSTIC_COMPLETED: 'diagnostic_completed',
  PROPOSAL_DRAFT: 'proposal_draft',
  PROPOSAL_SENT: 'proposal_sent',
  NEGOTIATION: 'negotiation',
  WON: 'won', // Converted to client/project
  LOST: 'lost', // Lost opportunities
  CLIENT_ACTIVE: 'client_active',
  CLIENT_INACTIVE: 'client_inactive'
};

export const LEAD_STATUS_LABELS = {
  [LEAD_STATUS.LEAD_NEW]: 'Nuevo Lead',
  [LEAD_STATUS.LEAD_CONTACTED]: 'Contactado',
  [LEAD_STATUS.MEETING_SCHEDULED]: 'Reunión Programada',
  [LEAD_STATUS.MEETING_DONE]: 'Reunión Realizada',
  [LEAD_STATUS.DIAGNOSTIC_PENDING]: 'Diagnóstico Pendiente',
  [LEAD_STATUS.DIAGNOSTIC_COMPLETED]: 'Diagnóstico Completado',
  [LEAD_STATUS.PROPOSAL_DRAFT]: 'Propuesta en Preparación',
  [LEAD_STATUS.PROPOSAL_SENT]: 'Propuesta Enviada',
  [LEAD_STATUS.NEGOTIATION]: 'Negociación',
  [LEAD_STATUS.WON]: 'Ganado',
  [LEAD_STATUS.LOST]: 'Perdido',
  [LEAD_STATUS.CLIENT_ACTIVE]: 'Cliente Activo',
  [LEAD_STATUS.CLIENT_INACTIVE]: 'Cliente Inactivo'
};

// Colors for status badges (Tailwind classes)
export const LEAD_STATUS_COLORS = {
  [LEAD_STATUS.LEAD_NEW]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [LEAD_STATUS.LEAD_CONTACTED]: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  [LEAD_STATUS.MEETING_SCHEDULED]: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  [LEAD_STATUS.MEETING_DONE]: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  [LEAD_STATUS.DIAGNOSTIC_PENDING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  [LEAD_STATUS.DIAGNOSTIC_COMPLETED]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  [LEAD_STATUS.PROPOSAL_DRAFT]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  [LEAD_STATUS.PROPOSAL_SENT]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  [LEAD_STATUS.NEGOTIATION]: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  [LEAD_STATUS.WON]: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  [LEAD_STATUS.LOST]: 'bg-red-500/10 text-red-400 border-red-500/20',
  [LEAD_STATUS.CLIENT_ACTIVE]: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  [LEAD_STATUS.CLIENT_INACTIVE]: 'bg-red-500/10 text-red-400 border-red-500/20'
};

// 2. Loss Reasons (Motivos de Pérdida)
export const LOSS_REASONS = {
  LOST_PRICE: 'lost_price',
  LOST_NO_BUDGET: 'lost_no_budget',
  LOST_NO_RESPONSE: 'lost_no_response',
  LOST_COMPETITOR: 'lost_competitor',
  LOST_PROJECT_CANCELLED: 'lost_project_cancelled',
  LOST_UNFIT_PROFILE: 'lost_unfit_profile',
  LOST_OTHERS: 'lost_others'
};

export const LOSS_REASONS_LABELS = {
  [LOSS_REASONS.LOST_PRICE]: 'Precio (Muy alto/Falta de ROI)',
  [LOSS_REASONS.LOST_NO_BUDGET]: 'Sin Presupuesto (Liquidez actual)',
  [LOSS_REASONS.LOST_NO_RESPONSE]: 'No Respondió (Cadencia agotada)',
  [LOSS_REASONS.LOST_COMPETITOR]: 'Competencia (Prefirió otra opción)',
  [LOSS_REASONS.LOST_PROJECT_CANCELLED]: 'Proyecto Cancelado (Suspensión interna)',
  [LOSS_REASONS.LOST_UNFIT_PROFILE]: 'No era Cliente Ideal (Incompatibilidad)',
  [LOSS_REASONS.LOST_OTHERS]: 'Otros motivos (Ver notas)'
};

// 3. Priorities (Prioridades del Lead)
export const PRIORITIES = {
  A: 'A', // Critical / High Value / Immediate
  B: 'B', // Medium / High Value / Medium term
  C: 'C', // Standard / Medium Value
  D: 'D'  // Low / Under evaluation
};

export const PRIORITIES_LABELS = {
  [PRIORITIES.A]: 'Prioridad A (Crítico / Alto Valor)',
  [PRIORITIES.B]: 'Prioridad B (Medio / Importante)',
  [PRIORITIES.C]: 'Prioridad C (Estándar)',
  [PRIORITIES.D]: 'Prioridad D (Baja / Evaluativo)'
};

export const PRIORITIES_COLORS = {
  [PRIORITIES.A]: 'bg-red-500/10 text-red-400 border-red-500/25',
  [PRIORITIES.B]: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
  [PRIORITIES.C]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25',
  [PRIORITIES.D]: 'bg-slate-500/10 text-slate-400 border-slate-500/25'
};

// 4. Task Types (Tipos de Tareas)
export const TASK_TYPES = {
  TASK_CALL: 'task_call',
  TASK_FOLLOWUP: 'task_followup',
  TASK_MEETING: 'task_meeting',
  TASK_DOCS: 'task_docs',
  TASK_PAYMENT: 'task_payment',
  TASK_REMINDER: 'task_reminder'
};

export const TASK_TYPES_LABELS = {
  [TASK_TYPES.TASK_CALL]: 'Llamada de Seguimiento',
  [TASK_TYPES.TASK_FOLLOWUP]: 'Mensaje de Seguimiento',
  [TASK_TYPES.TASK_MEETING]: 'Reunión Comercial',
  [TASK_TYPES.TASK_DOCS]: 'Solicitud de Documentación',
  [TASK_TYPES.TASK_PAYMENT]: 'Solicitud de Pago / Conciliación',
  [TASK_TYPES.TASK_REMINDER]: 'Recordatorio Interno'
};

// 5. Task Status (Estados de Tareas)
export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Pendiente',
  [TASK_STATUS.COMPLETED]: 'Completada'
};

// 6. Billing Modes (Modelos Comerciales de Monetización)
export const BILLING_MODES = {
  SETUP_ONLY: 'setup_only',
  PERCENTAGE: 'percentage',
  FIXED_PER_SERVICE: 'fixed_per_service',
  MONTHLY: 'monthly',
  MIXED: 'mixed'
};

export const BILLING_MODES_LABELS = {
  [BILLING_MODES.SETUP_ONLY]: 'Setup único (Pago único)',
  [BILLING_MODES.PERCENTAGE]: 'Comisión Porcentual',
  [BILLING_MODES.FIXED_PER_SERVICE]: 'Pago fijo por Servicio',
  [BILLING_MODES.MONTHLY]: 'Mensualidad Fija',
  [BILLING_MODES.MIXED]: 'Modelo Mixto (Mensualidad + Comisión)'
};

// 7. Client Health (Salud del Cliente)
export const CLIENT_HEALTH = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AT_RISK: 'at_risk',
  CRITICAL: 'critical'
};

export const CLIENT_HEALTH_LABELS = {
  [CLIENT_HEALTH.EXCELLENT]: 'Excelente',
  [CLIENT_HEALTH.GOOD]: 'Bueno',
  [CLIENT_HEALTH.AT_RISK]: 'En Riesgo',
  [CLIENT_HEALTH.CRITICAL]: 'Crítico'
};

export const CLIENT_HEALTH_COLORS = {
  [CLIENT_HEALTH.EXCELLENT]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  [CLIENT_HEALTH.GOOD]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [CLIENT_HEALTH.AT_RISK]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  [CLIENT_HEALTH.CRITICAL]: 'bg-red-500/10 text-red-400 border-red-500/20'
};
