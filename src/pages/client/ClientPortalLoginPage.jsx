import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientPortalStore } from '../../stores/clientPortalStore';
import { AlertTriangle, Building, KeyRound, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function ClientPortalLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, loading, error } = useClientPortalStore();

  const [clientId, setClientId] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/portal');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!clientId.trim() || !token.trim()) {
      setLoginError('Todos los campos son obligatorios');
      return;
    }

    try {
      const success = await login(clientId, token);
      if (success) {
        navigate('/portal');
      }
    } catch (err) {
      console.error('Error en login de cliente:', err);
      setLoginError(err.message || 'Error de conexión');
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
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent leading-none">PORTAL</h2>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-bold uppercase tracking-wider">Autogestión de Clientes Activos</p>
        </div>

        {loginError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 animate-pulse">
            <AlertTriangle size={15} className="shrink-0 text-red-400" />
            <p>{loginError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-text)]">ID de Cliente (Slug)</label>
            <div className="relative">
              <input 
                type="text" 
                required
                placeholder="smartfix"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full h-12 pl-11 pr-3 rounded-xl bg-[var(--color-bg)]/80 border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] transition-all placeholder:text-[var(--color-text-muted)]/50"
              />
              <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]/60" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-text)]">Token de Acceso</label>
            <div className="relative">
              <input 
                type={showToken ? "text" : "password"} 
                required
                placeholder="Ingresa tu token de telemetría"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-xl bg-[var(--color-bg)]/80 border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)] transition-all placeholder:text-[var(--color-text-muted)]/50"
              />
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]/60" />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]/60 hover:text-[var(--color-text)] transition-colors"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
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
              Validando Acceso...
            </>
          ) : (
            "Iniciar Sesión en el Portal"
          )}
        </button>
      </form>
    </div>
  );
}
