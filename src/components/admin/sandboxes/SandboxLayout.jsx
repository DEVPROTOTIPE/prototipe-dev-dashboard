import React from 'react';
import { Sliders, ToggleLeft, ToggleRight } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

export function ControlPanel({ controls }) {
  if (!controls || controls.length === 0) return null;
  return (
    <div className="bg-[var(--color-bg)]/60 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Sliders size={11} className="text-indigo-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Controles</span>
      </div>
      {controls.map((ctrl, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3">
          <label className="text-[10px] font-semibold text-[var(--color-text-muted)] shrink-0 w-20">{ctrl.label}</label>
          {ctrl.type === 'toggle' && (
            <button
              onClick={() => ctrl.onChange(!ctrl.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                ctrl.value ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400' : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {ctrl.value ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
              {ctrl.value ? (ctrl.labels?.[1] || 'On') : (ctrl.labels?.[0] || 'Off')}
            </button>
          )}
          {ctrl.type === 'select' && (
            <div className="w-32 shrink-0">
              <CustomSelect
                value={ctrl.value}
                onChange={ctrl.onChange}
                options={ctrl.options.map(o => ({ value: o, label: String(o) }))}
              />
            </div>
          )}
          {(ctrl.type === 'text' || ctrl.type === 'number') && (
            <input
              type={ctrl.type}
              value={ctrl.value}
              onChange={e => ctrl.onChange(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] rounded-xl px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 min-w-0"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function SandboxLayout({ title, description, controls, children }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-black text-[var(--color-text)]">{title}</h4>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col gap-4">
        {/* Preview Area */}
        <div className="min-h-[180px] bg-[var(--color-bg)]/40 border border-dashed border-[var(--color-border)] rounded-2xl p-6 relative flex items-center justify-center">
          <div className="absolute top-2 left-3">
            <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">preview</span>
          </div>
          <div className="max-w-full">{children}</div>
        </div>
        {/* Controls */}
        <ControlPanel controls={controls} />
      </div>
    </div>
  );
}

export default SandboxLayout;
