import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const HORARIOS = ['7:00–9:00 AM','10:00–12:00 M','2:00–4:00 PM','5:00–7:00 PM'];

function ProgramadorComponent() {
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', dia: '', horario: '' });
  const [enviado, setEnviado] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.nombre || !form.direccion || !form.dia || !form.horario) return;
    setEnviado(true);
  };

  if (enviado) return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="text-4xl">✅</span>
      <p className="text-sm font-black text-[var(--color-text)]">¡Ruta agendada!</p>
      <p className="text-[11px] text-[var(--color-text-muted)]">
        {form.nombre} · {form.dia} · {form.horario}
      </p>
      <button onClick={() => { setForm({ nombre:'',direccion:'',telefono:'',dia:'',horario:'' }); setEnviado(false); }}
        className="mt-2 text-xs font-bold text-[var(--color-primary)] cursor-pointer hover:underline">
        Nueva ruta
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {['nombre','direccion','telefono'].map(k => (
        <div key={k} className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] capitalize">{k}</label>
          <input value={form[k]} onChange={e => set(k, e.target.value)}
            placeholder={k === 'nombre' ? 'Tu nombre' : k === 'direccion' ? 'Dirección de recolección' : 'Teléfono'}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50"
          />
        </div>
      ))}

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Día de recolección</label>
        <div className="flex flex-wrap gap-1.5">
          {DIAS.map(d => (
            <button key={d} onClick={() => set('dia', d)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${form.dia===d ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Franja horaria</label>
        <div className="flex flex-col gap-1.5">
          {HORARIOS.map(h => (
            <button key={h} onClick={() => set('horario', h)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold border text-left transition-all cursor-pointer ${form.horario===h ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40'}`}>
              {h}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSubmit}
        disabled={!form.nombre || !form.direccion || !form.dia || !form.horario}
        className="w-full py-2.5 rounded-xl text-xs font-black bg-[var(--color-primary)] text-white disabled:opacity-40 cursor-pointer hover:opacity-90 transition-opacity">
        Confirmar ruta a domicilio
      </button>
    </div>
  );
}

export default function ProgramadorRutasDomicilioSandbox() {
  return (
    <SandboxLayout
      title="Programador de Rutas a Domicilio"
      description="Agenda recolección y entrega de prendas seleccionando día y franja horaria"
    >
      <ProgramadorComponent />
    </SandboxLayout>
  );
}
