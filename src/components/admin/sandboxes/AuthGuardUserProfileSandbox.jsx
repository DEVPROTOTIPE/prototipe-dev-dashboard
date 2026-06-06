import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Lock, AlertTriangle, Check, X, Shield, DollarSign, TrendingUp, ShoppingCart, User as UserIcon } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

export default function AuthGuardUserProfileSandbox() {
  const [user, setUser] = useState({
    displayName: 'Sergio Agudelo',
    email: 'sergio.agudelo@prototipe.com',
    role: 'admin'
  });
  const [requiredRole, setRequiredRole] = useState('vendedor');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Deterministic avatar color
  const getAvatarColor = (str = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h} 75% 50%)`;
  };

  const initials = user ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

  const handleLogin = (role) => {
    setUser({
      displayName: role === 'admin' ? 'Administrador Core' : role === 'vendedor' ? 'Vendedor Caja' : 'Cliente VIP',
      email: `${role}@prototipe.com`,
      role
    });
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsDropdownOpen(false);
  };

  const isAuthorized = user && (requiredRole === 'todos' || user.role === requiredRole);

  return (
    <SandboxLayout
      title="AuthGuard & UserProfile"
      description="Simula el control de sesión y protección de vistas por roles de usuario (admin, vendedor, cliente)."
      controls={[
        {
          label: 'Rol Requerido',
          type: 'select',
          value: requiredRole,
          options: ['todos', 'admin', 'vendedor', 'cliente'],
          onChange: setRequiredRole
        }
      ]}
    >
      <div className="w-full space-y-4 text-[var(--color-text)] font-sans">
        {/* Header Bar Mockup */}
        <div className="flex items-center justify-between p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl shadow-md transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-[var(--color-text)] tracking-wider">MI_NEGOCIO_POS</span>
          </div>
          
          {/* User Profile Component */}
          <div ref={containerRef} className="relative">
            {user ? (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl transition-all duration-200 cursor-pointer outline-none text-[var(--color-text)] shadow-sm pr-3"
              >
                <span
                  style={{ backgroundColor: getAvatarColor(user.email) }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0 select-none"
                >
                  {initials}
                </span>
                <div className="text-left leading-tight hidden xs:block max-w-[90px]">
                  <p className="text-[9px] font-extrabold text-[var(--color-text)] truncate">{user.displayName}</p>
                  <span className="text-[7px] font-black uppercase text-indigo-500 tracking-wider mt-0.5 block truncate">
                    {user.role}
                  </span>
                </div>
                <ChevronDown size={12} className="text-[var(--color-text-muted)] transition-transform duration-350" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
            ) : (
              <button
                onClick={() => handleLogin('vendedor')}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Iniciar Sesión
              </button>
            )}

            {/* Dropdown menu */}
            {isDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl p-1.5 z-50 animate-scale-up">
                <div className="px-2.5 py-2 border-b border-[var(--color-border)] mb-1">
                  <p className="text-[9px] font-black text-[var(--color-text)] truncate">{user.displayName}</p>
                  <p className="text-[8px] text-[var(--color-text-muted)] truncate mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={() => { handleLogout(); }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[9px] font-bold text-red-500 hover:bg-red-500/10 transition-all text-left cursor-pointer"
                >
                  <X size={12} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Protected Area Representation */}
        <div className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-3xl flex flex-col items-center justify-center text-center min-h-[220px] shadow-lg relative overflow-hidden transition-all duration-300">
          {!user ? (
            <div className="space-y-4 py-4 animate-fade-in">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock size={18} />
              </div>
              <div className="space-y-1">
                <h5 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text)]">Sesión Requerida</h5>
                <p className="text-[9px] text-[var(--color-text-muted)] max-w-[220px] leading-relaxed mx-auto">
                  Debes iniciar sesión para visualizar el panel protegido del negocio.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button onClick={() => handleLogin('cliente')} className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/35 text-[var(--color-text)] text-[9px] font-bold rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all">Cliente</button>
                <button onClick={() => handleLogin('vendedor')} className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/35 text-[var(--color-text)] text-[9px] font-bold rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all">Vendedor</button>
                <button onClick={() => handleLogin('admin')} className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/35 text-[var(--color-text)] text-[9px] font-bold rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all">Admin</button>
              </div>
            </div>
          ) : !isAuthorized ? (
            <div className="space-y-4 py-4 animate-fade-in">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse shadow-inner">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h5 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text)]">Permisos Insuficientes</h5>
                <p className="text-[9px] text-[var(--color-text-muted)] max-w-[220px] leading-relaxed mx-auto">
                  Tu rol de <span className="text-amber-500 font-bold uppercase">{user.role}</span> no tiene acceso. Se requiere rol de <span className="text-indigo-500 font-bold uppercase">{requiredRole}</span>.
                </p>
              </div>
              <button
                onClick={() => handleLogin(requiredRole)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95"
              >
                Cambiar a Rol {requiredRole}
              </button>
            </div>
          ) : (
            /* Premium Dashboard Mockup on Access Granted */
            <div className="w-full space-y-4 py-1 text-left animate-scale-up">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Acceso Concedido (Panel POS)</span>
                </div>
                <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  Rol: {user.role.toUpperCase()}
                </span>
              </div>
              
              {/* Mini KPI Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Ventas Hoy</span>
                    <DollarSign size={10} className="text-indigo-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-[var(--color-text)]">$480k</span>
                    <span className="text-[6px] text-emerald-500 font-bold flex items-center leading-none">
                      <TrendingUp size={6} /> +12%
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Pedidos</span>
                    <ShoppingCart size={10} className="text-indigo-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-[var(--color-text)]">24</span>
                    <span className="text-[6px] text-[var(--color-text-muted)] font-medium">Activos</span>
                  </div>
                </div>
              </div>

              {/* Recent Transaction Item */}
              <div className="flex items-center justify-between p-2 bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-xl text-[9px]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                    <UserIcon size={10} />
                  </div>
                  <div className="truncate">
                    <p className="font-extrabold text-[var(--color-text)]">Venta registrada</p>
                    <p className="text-[7px] text-[var(--color-text-muted)]">Caja #1 · Hace 2 min</p>
                  </div>
                </div>
                <span className="font-black text-emerald-500 shrink-0">+$25.000</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}

