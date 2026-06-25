/**
 * Algoritmo de salud de cliente local y utilidades compartidas del CRM.
 */
export function calculateClientHealth(client, failures, reports, followups) {
  const clientFailures = failures.filter(f => f.clientId === client.id && !f.resolved);
  const clientReports = reports.filter(r => r.clientId === client.id && (r.estadoPago || 'pendiente').toLowerCase() === 'pendiente');
  const clientFollowups = followups.filter(f => f.clientId === client.id);

  let lastFollowupDays = 999;
  if (clientFollowups.length > 0) {
    const dates = clientFollowups.map(f => new Date(f.date).getTime());
    const lastDate = Math.max(...dates);
    lastFollowupDays = (Date.now() - lastDate) / (1000 * 86400);
  }

  const activeFailuresCount = clientFailures.length;
  const pendingBillsCount = clientReports.length;

  let score = 100;
  score -= activeFailuresCount * 15;
  score -= pendingBillsCount * 10;
  
  if (clientFollowups.length === 0) {
    score -= 20;
  } else if (lastFollowupDays > 15) {
    score -= 15;
  }

  score = Math.max(0, Math.min(100, score));

  let label = 'Excelente';
  let color = 'emerald';
  let bg = 'bg-emerald-500/10';
  let text = 'text-emerald-400';
  let border = 'border-emerald-500/20';
  let ringColor = 'stroke-emerald-500';

  if (score >= 85) {
    label = 'Excelente';
    color = 'emerald';
    bg = 'bg-emerald-500/10';
    text = 'text-emerald-400';
    border = 'border-emerald-500/20';
    ringColor = 'stroke-emerald-500';
  } else if (score >= 70) {
    label = 'Bueno';
    color = 'blue';
    bg = 'bg-blue-500/10';
    text = 'text-blue-400';
    border = 'border-blue-500/20';
    ringColor = 'stroke-blue-500';
  } else if (score >= 50) {
    label = 'En Riesgo';
    color = 'amber';
    bg = 'bg-amber-500/10';
    text = 'text-amber-500 dark:text-amber-400';
    border = 'border-amber-500/20';
    ringColor = 'stroke-amber-500';
  } else {
    label = 'Crítico';
    color = 'red';
    bg = 'bg-red-500/10';
    text = 'text-red-400';
    border = 'border-red-500/20';
    ringColor = 'stroke-red-500';
  }

  return {
    score,
    label,
    color,
    bg,
    text,
    border,
    ringColor,
    failuresCount: activeFailuresCount,
    billsCount: pendingBillsCount,
    lastFollowupDays: lastFollowupDays === 999 ? null : Math.round(lastFollowupDays)
  };
}
