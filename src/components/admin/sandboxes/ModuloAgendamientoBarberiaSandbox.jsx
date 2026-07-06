import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import DatePickerPremium from '../../ui/DatePickerPremium';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (date, format = 'yyyy-MM-dd') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const y = d.getFullYear(), m = pad(d.getMonth() + 1), day = pad(d.getDate());
  const h = pad(d.getHours()), min = pad(d.getMinutes());
  if (format === 'yyyy-MM-dd') return `${y}-${m}-${day}`;
  if (format === 'HH:mm') return `${h}:${min}`;
  if (format === 'human-short') return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  if (format === 'month-year') return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return d.toISOString();
};
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const startOfWeek = (d) => { const r = new Date(d); const day = r.getDay(); r.setDate(r.getDate() - day + (day === 0 ? -6 : 1)); return r; };
const addMinutes = (t, mins) => { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m + mins, 0, 0); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
const compareTimes = (t1, t2) => { const [h1,m1] = t1.split(':').map(Number); const [h2,m2] = t2.split(':').map(Number); return h1 !== h2 ? h1-h2 : m1-m2; };
const isSameDay = (d1, d2) => { const a = new Date(d1), b = new Date(d2); return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); };
const getDaysInWeek = (d) => { const mon = startOfWeek(d); return Array.from({length:7}, (_,i) => { const dd = addDays(mon,i); return { date: dd, isToday: isSameDay(dd, new Date()) }; }); };
const getDaysInMonth = (date) => {
  const d = new Date(date), y = d.getFullYear(), mo = d.getMonth();
  const first = new Date(y,mo,1), last = new Date(y,mo+1,0);
  const fill = first.getDay() === 0 ? 6 : first.getDay()-1;
  const days = [];
  for (let i=fill;i>0;i--) { const dd=new Date(y,mo,1-i); days.push({date:dd,isCurrentMonth:false,isToday:isSameDay(dd,new Date())}); }
  for (let i=1;i<=last.getDate();i++) { const dd=new Date(y,mo,i); days.push({date:dd,isCurrentMonth:true,isToday:isSameDay(dd,new Date())}); }
  const rem = 42-days.length;
  for (let i=1;i<=rem;i++) { const dd=new Date(y,mo+1,i); days.push({date:dd,isCurrentMonth:false,isToday:isSameDay(dd,new Date())}); }
  return days;
};
const checkCollision = (s1,d1,s2,d2) => { const e1=addMinutes(s1,d1),e2=addMinutes(s2,d2); if(compareTimes(e1,s2)<=0) return false; if(compareTimes(e2,s1)<=0) return false; return true; };
const getSlots = (date, prof, apps, bh) => {
  if (!prof) return [];
  const dayName = new Date(date).toLocaleDateString('es-ES',{weekday:'long'}).toLowerCase();
  const cfg = bh[dayName] || bh['lunes'];
  if (!cfg?.active) return [];
  const slots = []; let cur = cfg.start;
  while (compareTimes(addMinutes(cur,30), cfg.end) <= 0) {
    let ok = true, reason = null;
    if (cfg.breakActive && checkCollision(cur,30,cfg.breakStart,60)) { ok=false; reason='Almuerzo'; }
    if (ok) { for (const a of apps.filter(x=>isSameDay(x.date,date)&&x.professionalId===prof.id&&x.status!=='Cancelada')) { if (checkCollision(cur,30,a.time,a.service?.duration||30)) { ok=false; reason='Ocupado'; break; } } }
    slots.push({ time:cur, isAvailable:ok, reason });
    cur = addMinutes(cur,30);
  }
  return slots;
};

// ─── Datos mock ───────────────────────────────────────────────────────────────
const SERVICES = [
  { id:'s1', name:'Corte Clásico',        duration:30, price:15, color:'262', category:'Cabello' },
  { id:'s2', name:'Perfilado de Barba',   duration:30, price:12, color:'217', category:'Barba'   },
  { id:'s3', name:'Corte + Barba Combo',  duration:60, price:24, color:'330', category:'Combos'  },
  { id:'s4', name:'Tinte & Canas',        duration:45, price:20, color:'150', category:'Color'   },
];
const PROFESSIONALS = [
  { id:'p1', name:'Alexx Barber',   specialty:'Estilo Clásico', avatar:'AB', status:'active' },
  { id:'p2', name:'Mateo Barbero',  specialty:'Cortes Modernos', avatar:'MB', status:'active' },
  { id:'p3', name:'Carlos Stylist', specialty:'Perfilado',       avatar:'CS', status:'active' },
];
const DEFAULT_BH = {
  lunes:    { active:true,  start:'09:00', end:'19:00', breakActive:true,  breakStart:'13:00' },
  martes:   { active:true,  start:'09:00', end:'19:00', breakActive:true,  breakStart:'13:00' },
  miercoles:{ active:true,  start:'09:00', end:'19:00', breakActive:true,  breakStart:'13:00' },
  jueves:   { active:true,  start:'09:00', end:'19:00', breakActive:true,  breakStart:'13:00' },
  viernes:  { active:true,  start:'09:00', end:'20:00', breakActive:true,  breakStart:'13:00' },
  sabado:   { active:true,  start:'09:00', end:'17:00', breakActive:false, breakStart:'13:00' },
  domingo:  { active:false, start:'09:00', end:'14:00', breakActive:false, breakStart:'12:00' },
};

// ─── Modal nativo (reemplaza TapShield) ─────────────────────────────────────
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-bg)]/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
          <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] cursor-pointer transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge de estado ──────────────────────────────────────────────────────────
function StatusBadge({ status='Pendiente' }) {
  const cls = { Confirmada:'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20', 'En proceso':'bg-amber-500/10 text-amber-400 border-amber-500/20', Completada:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', Cancelada:'bg-rose-500/10 text-rose-400 border-rose-500/20', Pendiente:'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  return <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${cls[status]||cls.Pendiente}`}>{status.toUpperCase()}</span>;
}

// ─── Selector de barbero ──────────────────────────────────────────────────────
function ProfSelector({ profs, selected, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Barbero</label>
      <div className="grid grid-cols-3 gap-1.5">
        {profs.map(p => (
          <button key={p.id} type="button" onClick={()=>onChange(p.id)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${selected===p.id?'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40':'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]'}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black ${selected===p.id?'bg-[var(--color-primary)] text-white':'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'}`}>{p.avatar}</div>
            <div><div className="text-[9px] font-bold text-[var(--color-text)] truncate">{p.name}</div><div className="text-[7px] text-[var(--color-text-muted)] truncate">{p.specialty}</div></div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Selector de servicio ─────────────────────────────────────────────────────
function ServiceSelector({ services, selected, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Servicio</label>
      <div className="grid grid-cols-2 gap-1.5">
        {services.map(s => (
          <button key={s.id} type="button" onClick={()=>onChange(s.id)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${selected===s.id?'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40':'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]'}`}>
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{backgroundColor:`hsl(${s.color} 80% 50%)`}}/>
            <div className="pl-2">
              <div className="text-[7px] font-bold text-[var(--color-text-muted)] uppercase">{s.category}</div>
              <div className="text-[9px] font-bold text-[var(--color-text)] truncate">{s.name}</div>
              <div className="text-[8px] font-mono text-[var(--color-text-muted)] mt-1">{s.duration}min · ${s.price}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Slots de horario ─────────────────────────────────────────────────────────
function SlotPicker({ slots, selected, onChange }) {
  if (!slots.length) return <div className="text-[9px] text-[var(--color-text-muted)] py-2 text-center italic">Selecciona barbero y fecha primero.</div>;
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Horario disponible</label>
      <div className="grid grid-cols-5 gap-1">
        {slots.map((s,i) => (
          <button key={i} type="button" disabled={!s.isAvailable} onClick={()=>onChange(s.time)} title={s.reason||'Disponible'}
            className={`py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all text-center ${selected===s.time?'bg-[var(--color-primary)] text-white':s.isAvailable?'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-primary)]/20 cursor-pointer':'bg-[var(--color-surface-2)]/30 text-[var(--color-text-muted)] opacity-30 cursor-not-allowed'}`}>
            {s.time}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Tarjeta de cita ──────────────────────────────────────────────────────────
function AppCard({ app, onClick, onComplete }) {
  return (
    <div onClick={onClick} className="group p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 hover:bg-[var(--color-surface-2)]/50 transition-all cursor-pointer relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{backgroundColor:`hsl(${app.service?.color||'262'} 80% 50%)`}}/>
      <div className="pl-1.5 flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-mono font-bold text-[var(--color-text)]">{app.time} <span className="text-[var(--color-text-muted)] font-normal">({app.service?.duration}m)</span></div>
          <div className="text-[9px] font-bold text-[var(--color-text)] truncate mt-0.5">{app.clientName}</div>
          <div className="text-[7.5px] text-[var(--color-text-muted)] truncate">{app.service?.name}</div>
        </div>
        <StatusBadge status={app.status}/>
      </div>
      {app.status!=='Completada' && app.status!=='Cancelada' && (
        <button onClick={e=>{e.stopPropagation();onComplete(app.id);}} className="opacity-0 group-hover:opacity-100 mt-1.5 w-full py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[7.5px] font-bold transition-all cursor-pointer border-none">
          ✓ Completar
        </button>
      )}
    </div>
  );
}

// ─── Vista Día ────────────────────────────────────────────────────────────────
function DayView({ date, apps, bh, onCard, onAddAt }) {
  const dayName = new Date(date).toLocaleDateString('es-ES',{weekday:'long'}).toLowerCase();
  const cfg = bh[dayName]||bh['lunes'];
  if (!cfg?.active) return <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)] text-xs italic">Barbería cerrada este día.</div>;
  const hours = [];
  let cur = cfg.start;
  while (compareTimes(cur, cfg.end) <= 0) { hours.push(cur); cur = addMinutes(cur, 60); }
  return (
    <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <div className="divide-y divide-[var(--color-border)]/40 max-h-[440px] overflow-y-auto">
        {hours.map(h => {
          const ha = apps.filter(a=>isSameDay(a.date,date)&&a.time===h);
          return (
            <div key={h} className="flex min-h-[68px] group/row">
              <div className="w-14 shrink-0 flex items-start justify-center pt-3 border-r border-[var(--color-border)]/40 bg-[var(--color-surface-2)]/20">
                <span className="text-[9px] font-mono font-bold text-[var(--color-text-muted)]">{h}</span>
              </div>
              <div className="flex-1 p-1.5 space-y-1">
                {ha.length>0 ? ha.map(a=><AppCard key={a.id} app={a} onClick={()=>onCard(a)} onComplete={()=>{}}/>) : (
                  <button onClick={()=>onAddAt(h)} className="opacity-0 group-hover/row:opacity-100 px-2 py-1 text-[8px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded cursor-pointer transition-all border-none">
                    + Agendar a las {h}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vista Semana ─────────────────────────────────────────────────────────────
function WeekView({ date, apps, onCard, onAddDay }) {
  const days = getDaysInWeek(date);
  return (
    <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 divide-x divide-[var(--color-border)]/40">
        {days.map(d => {
          const da = apps.filter(a=>isSameDay(a.date,d.date));
          return (
            <div key={d.date.toISOString()} className="flex flex-col min-h-[280px] group/col">
              <div className={`p-2 border-b border-[var(--color-border)]/40 flex items-center justify-between ${d.isToday?'bg-[var(--color-primary)]/5':''}`}>
                <div>
                  <div className={`text-[8px] font-bold uppercase ${d.isToday?'text-[var(--color-primary)]':'text-[var(--color-text-muted)]'}`}>{d.date.toLocaleDateString('es-ES',{weekday:'short'})}</div>
                  <div className={`text-xs font-black ${d.isToday?'text-[var(--color-primary)]':'text-[var(--color-text)]'}`}>{d.date.getDate()}</div>
                </div>
                <button onClick={()=>onAddDay(d.date)} className="opacity-0 group-hover/col:opacity-100 p-0.5 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] cursor-pointer border-none">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                </button>
              </div>
              <div className="flex-1 p-1 space-y-1 overflow-y-auto max-h-56">
                {da.length>0 ? da.map(a=>(
                  <div key={a.id} onClick={()=>onCard(a)} className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 cursor-pointer hover:bg-[var(--color-surface-2)] transition-all">
                    <div className="text-[8px] font-mono font-bold text-[var(--color-text)]">{a.time}</div>
                    <div className="text-[7.5px] text-[var(--color-text)] truncate font-bold">{a.clientName}</div>
                    <div className="text-[7px] text-[var(--color-text-muted)] truncate">{a.service?.name}</div>
                  </div>
                )) : <div className="h-full flex items-center justify-center py-6"><span className="text-[7px] text-[var(--color-text-muted)] font-mono uppercase">Libre</span></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vista Mes ────────────────────────────────────────────────────────────────
function MonthView({ date, apps, onDateClick }) {
  const days = getDaysInMonth(date);
  const labels = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  return (
    <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[var(--color-border)]/40 bg-[var(--color-surface-2)]/20 py-1.5">
        {labels.map(l=><span key={l} className="text-center text-[8px] font-bold text-[var(--color-text-muted)] uppercase">{l}</span>)}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-[var(--color-border)]/30">
        {days.map((d,i)=>{
          const da = apps.filter(a=>isSameDay(a.date,d.date));
          return (
            <button key={i} onClick={()=>onDateClick(d.date)}
              className={`min-h-[64px] p-1.5 flex flex-col text-left hover:bg-[var(--color-surface-2)]/30 cursor-pointer transition-all border-none ${!d.isCurrentMonth?'opacity-30':''} ${d.isToday?'bg-[var(--color-primary)]/5':''}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${d.isToday?'bg-[var(--color-primary)] text-white':'text-[var(--color-text-muted)]'}`}>{d.date.getDate()}</span>
              {da.length>0 && <span className={`mt-auto px-1 py-0.5 rounded text-[7px] font-bold ${da.length>=3?'bg-rose-500/10 text-rose-400':'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>{da.length} cita{da.length>1?'s':''}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL DEL SANDBOX ────────────────────────────────────────
export default function ModuloAgendamientoBarberiaSandbox() {
  const { showConfirm } = useAlertConfirm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('semana');
  const [searchQ, setSearchQ] = useState('');
  const [filterProf, setFilterProf] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  // Form state
  const [fProf, setFProf] = useState(PROFESSIONALS[0].id);
  const [fService, setFService] = useState(SERVICES[0].id);
  const [fDate, setFDate] = useState(formatDate(new Date(),'yyyy-MM-dd'));
  const [fTime, setFTime] = useState('');
  const [fClient, setFClient] = useState('');
  const [fNotes, setFNotes] = useState('');

  const todayStr = formatDate(new Date(),'yyyy-MM-dd');
  const [appointments, setAppointments] = useState([
    { id:'a1', date:todayStr, time:'10:00', clientName:'Juan Pérez',    professionalId:'p1', serviceId:'s1', status:'Confirmada', notes:'Corte texturizado.' },
    { id:'a2', date:todayStr, time:'11:00', clientName:'Diego M.',      professionalId:'p2', serviceId:'s3', status:'Pendiente',  notes:'' },
    { id:'a3', date:todayStr, time:'15:00', clientName:'Lionel M.',     professionalId:'p1', serviceId:'s2', status:'En proceso', notes:'Toalla fría.' },
    { id:'a4', date:formatDate(addDays(new Date(),1),'yyyy-MM-dd'), time:'09:00', clientName:'Carlos R.', professionalId:'p3', serviceId:'s4', status:'Pendiente', notes:'' },
  ]);

  const expandedApps = useMemo(() => appointments.map(a=>({...a, service: SERVICES.find(s=>s.id===a.serviceId), professional: PROFESSIONALS.find(p=>p.id===a.professionalId) })), [appointments]);

  const filteredApps = useMemo(() => expandedApps.filter(a => {
    if (searchQ && !a.clientName.toLowerCase().includes(searchQ.toLowerCase()) && !a.service?.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (filterProf !== 'Todos' && a.professionalId !== filterProf) return false;
    if (filterStatus !== 'Todos' && a.status !== filterStatus) return false;
    return true;
  }), [expandedApps, searchQ, filterProf, filterStatus]);

  const slots = useMemo(() => {
    const prof = PROFESSIONALS.find(p=>p.id===fProf);
    return getSlots(fDate, prof, expandedApps, DEFAULT_BH);
  }, [fDate, fProf, expandedApps]);

  const navigate = (dir) => {
    setCurrentDate(prev => {
      if (currentView==='dia') return addDays(prev, dir);
      if (currentView==='semana') return addDays(prev, dir*7);
      const d = new Date(prev); d.setMonth(d.getMonth()+dir); return d;
    });
  };

  const handleAddApp = () => {
    if (!fClient.trim() || !fTime) return;
    const newApp = { id:`a${Date.now()}`, date:fDate, time:fTime, clientName:fClient.trim(), professionalId:fProf, serviceId:fService, status:'Pendiente', notes:fNotes };
    setAppointments(prev=>[...prev,newApp]);
    setFClient(''); setFTime(''); setFNotes('');
    setActiveModal('confirmation');
    setSelectedApp({...newApp, service:SERVICES.find(s=>s.id===fService), professional:PROFESSIONALS.find(p=>p.id===fProf)});
  };

  const completeApp = (id) => setAppointments(prev=>prev.map(a=>a.id===id?{...a,status:'Completada'}:a));
  const cancelApp = async (id) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Cita',
      message: '¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'error'
    });
    if (confirmed) {
      setAppointments(prev => prev.filter(a => a.id !== id));
      setActiveModal(null);
    }
  };

  const openAdd = (date, time='09:00') => { setFDate(formatDate(date,'yyyy-MM-dd')); setFTime(time); setActiveModal('form'); };

  const formattedTitle = currentView==='mes' ? formatDate(currentDate,'month-year') : formatDate(currentDate,'human-short');

  const dayOccupancy = useMemo(() => {
    const prof = PROFESSIONALS[0];
    const sl = getSlots(currentDate, prof, expandedApps, DEFAULT_BH);
    const total = sl.length, busy = sl.filter(s=>!s.isAvailable).length;
    return { pct: total>0?Math.round(busy/total*100):0, free: sl.filter(s=>s.isAvailable).length };
  }, [currentDate, expandedApps]);

  const dayApps = useMemo(()=>filteredApps.filter(a=>isSameDay(a.date,currentDate)),[filteredApps,currentDate]);

  return (
    <div className="space-y-4 w-full text-[var(--color-text)]">

      {/* Buscador y filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative sm:col-span-1">
          <input type="text" placeholder="Buscar cliente o servicio..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"/>
          <svg className="absolute left-2.5 top-2.5 w-3 h-3 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <CustomSelect
          value={filterProf}
          onChange={setFilterProf}
          options={[{ value: 'Todos', label: 'Todos los barberos' }, ...PROFESSIONALS.map(p => ({ value: p.id, label: p.name }))]}
        />
        <CustomSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={['Todos','Pendiente','Confirmada','En proceso','Completada','Cancelada'].map(s => ({ value: s, label: s === 'Todos' ? 'Todos los estados' : s }))}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40">
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
            <button onClick={()=>navigate(-1)} className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg></button>
            <button onClick={()=>setCurrentDate(new Date())} className="px-2 py-1 text-[9px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">Hoy</button>
            <button onClick={()=>navigate(1)} className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg></button>
          </div>
          <span className="text-[11px] font-bold text-[var(--color-text)] capitalize font-mono">{formattedTitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex p-0.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
            {['dia','semana','mes'].map(v=>(
              <button key={v} onClick={()=>setCurrentView(v)} className={`px-2.5 py-1 rounded text-[9px] font-bold capitalize cursor-pointer transition-all ${currentView===v?'bg-[var(--color-surface-2)] text-[var(--color-text)]':'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>{v}</button>
            ))}
          </div>
          <button onClick={()=>openAdd(currentDate)} className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-[9px] font-bold cursor-pointer active:scale-95 transition-all">+ Cita</button>
        </div>
      </div>

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        <div className="lg:col-span-3">
          {currentView==='dia' && <DayView date={currentDate} apps={filteredApps} bh={DEFAULT_BH} onCard={a=>{setSelectedApp(a);setActiveModal('details');}} onAddAt={h=>openAdd(currentDate,h)}/>}
          {currentView==='semana' && <WeekView date={currentDate} apps={filteredApps} onCard={a=>{setSelectedApp(a);setActiveModal('details');}} onAddDay={d=>openAdd(d)}/>}
          {currentView==='mes' && <MonthView date={currentDate} apps={filteredApps} onDateClick={d=>{setCurrentDate(d);setCurrentView('dia');}}/>}
        </div>

        {/* Panel lateral */}
        <div className="lg:col-span-1 space-y-3">
          {/* Ocupación */}
          <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-[var(--color-border)]" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path className={dayOccupancy.pct>=80?'text-rose-500':dayOccupancy.pct>=50?'text-amber-400':'text-emerald-500'} strokeWidth="3.5" strokeDasharray={`${dayOccupancy.pct}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-[var(--color-text)]">{dayOccupancy.pct}%</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[var(--color-text)]">Ocupación Hoy</div>
              <div className="text-[9px] text-[var(--color-text-muted)]">{dayOccupancy.free} turnos libres</div>
            </div>
          </div>

          {/* Cronograma del día */}
          <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)]/40 pb-2">
              <h4 className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text)]">Cronograma</h4>
              <span className="text-[8px] text-[var(--color-text-muted)] font-mono">{dayApps.length} citas</span>
            </div>
            {dayApps.length>0 ? (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
                {[...dayApps].sort((a,b)=>a.time.localeCompare(b.time)).map(a=>(
                  <AppCard key={a.id} app={a} onClick={()=>{setSelectedApp(a);setActiveModal('details');}} onComplete={completeApp}/>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 gap-2 text-[var(--color-text-muted)]">
                <svg className="w-7 h-7 opacity-20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25"/></svg>
                <span className="text-[9px] italic">Sin citas hoy</span>
                <button onClick={()=>openAdd(currentDate)} className="text-[9px] font-bold text-[var(--color-primary)] cursor-pointer border-none bg-transparent">+ Agendar turno</button>
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20">
            {[{l:'Pendiente',c:'bg-zinc-400'},{l:'Confirmada',c:'bg-[var(--color-primary)]'},{l:'En proceso',c:'bg-amber-400'},{l:'Completada',c:'bg-emerald-500'},{l:'Cancelada',c:'bg-rose-500'}].map((x,i)=>(
              <div key={i} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${x.c}`}/><span className="text-[8px] text-[var(--color-text-muted)]">{x.l}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Nueva Cita */}
      <Modal isOpen={activeModal==='form'} onClose={()=>setActiveModal(null)} title="Nueva Reserva">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Nombre del Cliente *</label>
            <input type="text" placeholder="Ej: Juan Pérez" value={fClient} onChange={e=>setFClient(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"/>
          </div>
          <ProfSelector profs={PROFESSIONALS} selected={fProf} onChange={id=>{setFProf(id);setFTime('');}}/>
          <ServiceSelector services={SERVICES} selected={fService} onChange={setFService}/>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Fecha</label>
            <DatePickerPremium
              value={fDate ? new Date(fDate + 'T00:00:00') : null}
              onChange={date => { setFDate(formatDate(date, 'yyyy-MM-dd')); setFTime(''); }}
              placeholder="Seleccione fecha..."
            />
          </div>
          <SlotPicker slots={slots} selected={fTime} onChange={setFTime}/>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Notas</label>
            <textarea value={fNotes} onChange={e=>setFNotes(e.target.value)} rows={2} placeholder="Ej: corte en degradé..." className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] resize-none focus:outline-none"/>
          </div>
          <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
            <button type="button" onClick={()=>setActiveModal(null)} className="flex-1 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-bold cursor-pointer">Cancelar</button>
            <button type="button" onClick={handleAddApp} disabled={!fClient.trim()||!fTime} className="flex-1 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all">Confirmar</button>
          </div>
        </div>
      </Modal>

      {/* Modal: Detalles */}
      <Modal isOpen={activeModal==='details'} onClose={()=>setActiveModal(null)} title="Detalles del Turno">
        {selectedApp && (
          <div className="space-y-3 text-[10px]">
            <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{backgroundColor:`hsl(${selectedApp.service?.color||'262'} 80% 50%)`}}/>
              <div className="pl-2 flex items-start justify-between">
                <div><div className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase">{selectedApp.service?.category}</div><div className="font-bold text-[var(--color-text)]">{selectedApp.service?.name}</div></div>
                <StatusBadge status={selectedApp.status}/>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-[var(--color-border)]/40 pl-2">
                <div><div className="text-[7.5px] text-[var(--color-text-muted)] uppercase font-bold">Cliente</div><div className="font-bold text-[var(--color-text)]">{selectedApp.clientName}</div></div>
                <div><div className="text-[7.5px] text-[var(--color-text-muted)] uppercase font-bold">Barbero</div><div className="font-bold text-[var(--color-text)]">{selectedApp.professional?.name}</div></div>
                <div><div className="text-[7.5px] text-[var(--color-text-muted)] uppercase font-bold">Fecha y Hora</div><div className="font-mono font-bold text-[var(--color-text)]">{selectedApp.date} @ {selectedApp.time}</div></div>
                <div><div className="text-[7.5px] text-[var(--color-text-muted)] uppercase font-bold">Precio</div><div className="font-mono font-bold text-[var(--color-primary)]">${selectedApp.service?.price}</div></div>
              </div>
            </div>
            {selectedApp.notes && <div className="p-2.5 rounded-lg bg-[var(--color-surface-2)]/20 border border-[var(--color-border)] text-[var(--color-text-muted)] italic">"{selectedApp.notes}"</div>}
            <div className="flex flex-wrap gap-1.5">
              {['Confirmada','En proceso','Completada','Cancelada'].filter(s=>s!==selectedApp.status).map(s=>(
                <button key={s} onClick={()=>{setAppointments(prev=>prev.map(a=>a.id===selectedApp.id?{...a,status:s}:a));setActiveModal(null);}}
                  className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[8px] font-bold text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 transition-all">{s}</button>
              ))}
            </div>
            <button onClick={()=>cancelApp(selectedApp.id)} className="w-full py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold cursor-pointer hover:bg-rose-600 hover:text-white transition-all">Eliminar Cita</button>
          </div>
        )}
      </Modal>

      {/* Modal: Confirmación */}
      <Modal isOpen={activeModal==='confirmation'} onClose={()=>setActiveModal(null)} title="¡Reserva Exitosa!">
        {selectedApp && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            </div>
            <div className="w-full p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-left text-[9px] space-y-1.5 font-mono">
              {[['Cliente',selectedApp.clientName],['Servicio',selectedApp.service?.name],['Barbero',selectedApp.professional?.name],['Fecha y Hora',`${selectedApp.date} @ ${selectedApp.time}`],['Total',`$${selectedApp.service?.price}`]].map(([k,v])=>(
                <div key={k} className="flex justify-between border-b border-[var(--color-border)]/40 pb-1.5 last:border-0"><span className="text-[var(--color-text-muted)] uppercase">{k}</span><span className="font-bold text-[var(--color-text)]">{v}</span></div>
              ))}
            </div>
            <button onClick={()=>setActiveModal(null)} className="w-full py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold cursor-pointer active:scale-95 transition-all">Volver al Calendario</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
