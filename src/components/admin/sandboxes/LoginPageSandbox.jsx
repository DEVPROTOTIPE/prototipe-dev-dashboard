import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { Smartphone, Mail, Lock, Shield, ArrowRight, Check } from 'lucide-react';

export default function LoginPageSandbox() {
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' | 'client'
  const [formData, setFormData] = useState({ email: '', password: '', phone: '', otp: '' });
  const [step, setStep] = useState(1); // 1: input phone, 2: input otp (for client mode)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setFormData({ email: '', password: '', phone: '', otp: '' });
      }, 2500);
    }, 1200);
  };

  return (
    <SandboxLayout
      title="Página de Login Híbrida (Simulador de Autenticación)"
      description="Visualiza e interactúa con la UI de login de marca blanca. Permite el inicio de sesión clásico para administración y de un clic mediante código SMS/OTP para clientes."
    >
      <div className="max-w-md mx-auto bg-surface-glass border border-white/[0.08] backdrop-blur-xl rounded-3xl p-7 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glows Decorativos tras el panel */}
        <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

        {/* Cabecera */}
        <div className="text-center space-y-1.5 z-10 relative">
          <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)]">Ventas Ecosistema</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Panel unificado de acceso comercial</p>
        </div>

        {/* Tabs de cambio de rol */}
        <div className="grid grid-cols-2 p-1 bg-surface-2/80 rounded-2xl border border-app relative z-10">
          <button
            onClick={() => { setLoginMode('admin'); setSuccess(false); }}
            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
              loginMode === 'admin'
                ? 'bg-surface text-indigo-400 shadow-sm border border-app'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Shield size={12} />
            Administrador
          </button>
          <button
            onClick={() => { setLoginMode('client'); setSuccess(false); setStep(1); }}
            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
              loginMode === 'client'
                ? 'bg-surface text-indigo-400 shadow-sm border border-app'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Smartphone size={12} />
            Cliente (OTP)
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3 z-10 relative animate-pulse">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400 text-xl mx-auto">
              ✓
            </div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">¡Sesión Iniciada con Éxito!</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Redireccionando al dashboard correspondiente...</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 z-10 relative">
            {loginMode === 'admin' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest pl-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@empresa.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-app rounded-xl text-xs text-[var(--color-text)] placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest pl-1">Contraseña</label>
                  <div className="relative">
                    <Lock size={12} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-app rounded-xl text-xs text-[var(--color-text)] placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {step === 1 ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest pl-1">Número de Celular</label>
                      <div className="relative">
                        <Smartphone size={12} className="absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="300 123 4567"
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-app rounded-xl text-xs text-[var(--color-text)] placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { if (formData.phone) setStep(2); }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/25 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      Enviar Código SMS
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between pl-1">
                        <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Código de 6 dígitos</label>
                        <button onClick={() => setStep(1)} className="text-[9px] text-indigo-400 font-bold hover:underline">Cambiar celular</button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={formData.otp}
                        onChange={e => setFormData({ ...formData, otp: e.target.value })}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 bg-surface-2 border border-app rounded-xl text-center text-sm font-mono tracking-[8px] text-[var(--color-text)] placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {(loginMode === 'admin' || step === 2) && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loading ? 'Validando...' : 'Iniciar Sesión'}
                {!loading && <ArrowRight size={12} />}
              </button>
            )}
          </form>
        )}
      </div>
    </SandboxLayout>
  );
}
