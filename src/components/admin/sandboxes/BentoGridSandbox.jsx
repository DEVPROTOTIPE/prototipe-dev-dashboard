import React from 'react';
import { Zap, Bell, User, ShoppingCart } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

function SandboxBentoGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[160px] w-full ${className}`}>
      {children}
    </div>
  );
}

function SandboxBentoCard({ title, description, icon, colSpan = 'sm:col-span-1', rowSpan = 'row-span-1', children, className = '', cta }) {
  return (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-4 transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/20 hover:shadow-xl ${colSpan} ${rowSpan} ${className}`}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/4 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-1.5">
        <div className="space-y-1">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-indigo-400 border border-slate-700/40 group-hover:bg-indigo-600/10">
              {icon}
            </div>
          )}
          <h4 className="text-[10px] font-black text-slate-100 tracking-tight pt-1.5">{title}</h4>
          {description && (
            <p className="text-[8px] text-slate-500 leading-normal max-w-[180px]">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center py-2">
        {children}
      </div>
      {cta && (
        <div className="mt-1.5 flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider text-indigo-400 group-hover:translate-x-0.5 transition-transform duration-300">
          {cta}
        </div>
      )}
    </div>
  );
}

export default function BentoGridSandbox() {
  return (
    <SandboxLayout
      title="BentoGrid & BentoCard"
      description="Tablero en mosaico responsivo premium con hover glow y bordes HSL adaptativos."
      controls={[]}
    >
      <div className="w-full">
        <SandboxBentoGrid className="grid-cols-1 sm:grid-cols-3 gap-2">
          <SandboxBentoCard
            title="Ventas COP"
            description="Ingresos acumulados de hoy"
            colSpan="sm:col-span-2"
            icon={<Zap size={13} className="text-amber-400" />}
          >
            <div className="text-right w-full pr-2">
              <span className="text-xs font-black text-white">$ 1.280.000</span>
              <p className="text-[7px] text-emerald-400 font-bold">+18.4% vs ayer</p>
            </div>
          </SandboxBentoCard>
          <SandboxBentoCard
            title="Alertas"
            description="Acciones requeridas"
            icon={<Bell size={13} className="text-red-400" />}
          >
            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black rounded-lg">3 Críticos</span>
          </SandboxBentoCard>
          <SandboxBentoCard
            title="Clientes"
            description="Nuevos usuarios"
            icon={<User size={13} className="text-indigo-400" />}
            cta="Ver CRM →"
          >
            <span className="text-xs font-mono font-black text-indigo-400">14 nuevos</span>
          </SandboxBentoCard>
          <SandboxBentoCard
            title="Conversión"
            description="Embudo de ventas"
            colSpan="sm:col-span-2"
            icon={<ShoppingCart size={13} className="text-emerald-400" />}
          >
            <div className="w-full text-center">
              <span className="text-xs font-mono font-black text-emerald-400">3.4% ratio</span>
            </div>
          </SandboxBentoCard>
        </SandboxBentoGrid>
      </div>
    </SandboxLayout>
  );
}
