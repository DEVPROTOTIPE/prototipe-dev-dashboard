import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { AlertTriangle, Mail, KeyRound, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, loading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Redireccionar si ya está logueado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      setAuthError(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error de login:', err);
      setAuthError(err.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[var(--color-bg)] px-4 font-sans overflow-hidden transition-colors duration-300">
      {/* Fondo tecnológico premium */}
      <div aria-hidden="true" className="tech-bg-dots" />
      <div aria-hidden="true" className="tech-bg-orb-1" />
      <div aria-hidden="true" className="tech-bg-orb-2" />
      <div aria-hidden="true" className="tech-bg-vignette" />

      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[var(--color-surface-glass)] border border-[var(--color-border)] p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6 transition-all duration-300"
      >
        <div className="text-center relative">
          <div className="flex items-center justify-center gap-3 mb-2 select-none">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <img src="/logo.png?v=3" className="w-8 h-8 object-contain rounded-full" alt="Logo" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent leading-none">PROTOTIPE</h2>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">Consola Central de Aplicaciones a la Medida</p>
        </div>

        {authError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 animate-pulse">
            <AlertTriangle size={15} className="shrink-0 text-red-400" />
            <p>{authError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-text)]">Correo Electrónico</label>
            <div className="relative">
              <input 
                type="email" 
                required
                placeholder="dev@prototipe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-3 rounded-xl bg-[var(--color-bg)]/80 border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] transition-all placeholder:text-[var(--color-text-muted)]/50"
              />
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]/60" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-text)]">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-xl bg-[var(--color-bg)]/80 border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] transition-all placeholder:text-[var(--color-text-muted)]/50"
              />
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]/60" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]/60 hover:text-[var(--color-text)] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(124,58,237,0.2)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin text-white" size={16} />
              Autenticando Acceso...
            </>
          ) : (
            "Ingresar a la Consola"
          )}
        </button>
      </form>
    </div>
  );
}
