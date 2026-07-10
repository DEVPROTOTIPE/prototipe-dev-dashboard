import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function HybridLoginPage() {
  // Estados de navegación y carga
  const [activeTab, setActiveTab] = useState('client'); // 'client' | 'admin'
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false); // Define si el cliente ya pidió el código

  // Estados de formulario
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sanitización y formateo de teléfono en vivo
  const handlePhoneChange = (e) => {
    const sanitizedValue = e.target.value.replace(/\D/g, '');
    setPhone(sanitizedValue);
  };

  // Simulación de envío al servicio de Firebase Auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === 'client' && !otpStep) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setOtpStep(true);
      } else if (activeTab === 'client' && otpStep) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Cliente autenticado con rol 'client'");
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Administrador autenticado");
      }
    } catch (error) {
      console.error("Error de autenticación", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[500px] w-full p-4 bg-[var(--color-bg)] rounded-[24px] overflow-hidden border border-[var(--color-border)]">
      
      {/* Orbes de fondo (Efecto Glassmorphism Premium) */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[var(--color-primary)]/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[var(--color-secondary)]/20 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm p-6 bg-[var(--color-surface)]/85 backdrop-blur-2xl border border-[var(--color-border)] rounded-[24px] shadow-soft-2xl"
      >
        {/* Cabecera del Login */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-display font-bold text-[var(--color-text)]">
            Te damos la bienvenida
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        {/* Control Segmentado Interactivo para Tabs */}
        {!otpStep && (
          <div className="flex p-1 mb-6 rounded-xl bg-[var(--color-surface-2)]">
            <button
              type="button"
              onClick={() => setActiveTab('client')}
              className={`relative flex-1 py-1.5 text-xs font-semibold transition-colors duration-200 z-10 ${
                activeTab === 'client' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Soy Cliente
              {activeTab === 'client' && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[var(--color-surface)] rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`relative flex-1 py-1.5 text-xs font-semibold transition-colors duration-200 z-10 ${
                activeTab === 'admin' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Soy Equipo
              {activeTab === 'admin' && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[var(--color-surface)] rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </button>
          </div>
        )}

        {/* Contenedor de Formularios con AnimatePresence */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            
            {/* FLUJO CLIENTE (Teléfono / OTP) */}
            {activeTab === 'client' && (
              <motion.div
                key="client-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3.5"
              >
                {!otpStep ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-[var(--color-text)] uppercase tracking-wider pl-1">
                      Número de Teléfono
                    </label>
                    <div className="relative flex items-center">
                      <Smartphone className="absolute left-3 text-[var(--color-text-muted)]" size={16} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="300 123 4567"
                        required
                        className="w-full h-10 pl-9 pr-3 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-[var(--color-text)] uppercase tracking-wider pl-1">
                      Código de Verificación (SMS)
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 text-[var(--color-text-muted)]" size={16} />
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        required
                        className="w-full h-10 pl-9 pr-3 text-center tracking-[0.4em] font-mono text-base bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setOtpStep(false)}
                      className="mt-1 text-[10px] text-center font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      ¿Número incorrecto? Cambiar teléfono
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* FLUJO EQUIPO/ADMIN (Correo y Contraseña) */}
            {activeTab === 'admin' && (
              <motion.div
                key="admin-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[var(--color-text)] uppercase tracking-wider pl-1">
                    Correo Electrónico
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 text-[var(--color-text-muted)]" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                      required
                      className="w-full h-10 pl-9 pr-3 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[var(--color-text)] uppercase tracking-wider pl-1">
                    Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 text-[var(--color-text-muted)]" size={16} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-10 pl-9 pr-3 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón de Submit Universal Premium */}
          <button
            type="submit"
            disabled={isLoading || (activeTab === 'client' && phone.length < 10)}
            className="group relative flex items-center justify-center w-full h-11 mt-1 font-bold text-white text-xs transition-all duration-200 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="relative z-10">
                  {activeTab === 'client' && !otpStep ? 'Recibir código SMS' : 'Ingresar al sistema'}
                </span>
                <ArrowRight className="absolute right-3.5 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
            {/* Destello de fondo interactivo */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        </form>

      </motion.div>
    </div>
  );
}
