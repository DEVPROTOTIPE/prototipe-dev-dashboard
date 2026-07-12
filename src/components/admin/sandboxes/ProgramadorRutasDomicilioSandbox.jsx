import React, { useState, useEffect } from 'react';
import SandboxLayout from './SandboxLayout';
import CustomSelect from '../../ui/CustomSelect';

export default function ProgramadorRutasDomicilioSandbox() {
  // Parámetros dinámicos del simulador de entrega (deliveryService)
  const [cliente, setCliente] = useState('Sergio Gaviria');
  const [direccion, setDireccion] = useState('Carrera 15 # 82-44, Bogotá');
  const [distanciaKm, setDistanciaKm] = useState(5.4);
  const [repartidor, setRepartidor] = useState('Carlos Alarcón (Moto 4)');
  const [estadoRuta, setEstadoRuta] = useState('pendiente');
  const [valorFlete, setValorFlete] = useState(7500);
  const [progresoViaje, setProgresoViaje] = useState(0);
  const [animandoRuta, setAnimandoRuta] = useState(false);

  // Recalcular costo de flete aproximado por kilómetro
  useEffect(() => {
    const fleteCalculado = Math.max(3500, Math.round(distanciaKm * 1500));
    setValorFlete(fleteCalculado);
  }, [distanciaKm]);

  // Simulación de recorrido en tránsito
  useEffect(() => {
    let interval;
    if (animandoRuta) {
      interval = setInterval(() => {
        setProgresoViaje(p => {
          if (p >= 100) {
            setAnimandoRuta(false);
            setEstadoRuta('entregado');
            alert('¡Entrega completada exitosamente por el repartidor!');
            return 100;
          }
          return p + 10;
        });
      }, 500);
    } else {
      setProgresoViaje(0);
    }
    return () => clearInterval(interval);
  }, [animandoRuta]);

  const handleIniciarDespacho = () => {
    setEstadoRuta('en_ruta');
    setAnimandoRuta(true);
    setProgresoViaje(0);
  };

  const getHitoClass = (stepIndex) => {
    const stepStates = ['pendiente', 'en_ruta', 'entregado'];
    const activeIndex = stepStates.indexOf(estadoRuta);
    if (activeIndex >= stepIndex) {
      return 'bg-indigo-600 border-indigo-500 text-white';
    }
    return 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]';
  };

  return (
    <SandboxLayout
      title="Programador de Rutas a Domicilio (deliveryService)"
      description="Playground interactivo para simular el enrutamiento de domicilios de la PWA. Permite configurar distancias, tarifas, repartidores y animar la ruta del despacho."
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Nombre del Cliente</label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Dirección de Destino</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Distancia de Ruta ({distanciaKm} km)</label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.1"
              value={distanciaKm}
              onChange={(e) => setDistanciaKm(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Repartidor Asignado</label>
            <CustomSelect
              value={repartidor}
              onChange={(val) => setRepartidor(val)}
              options={[
                { value: 'Carlos Alarcón (Moto 4)', label: 'Carlos Alarcón (Moto 4)' },
                { value: 'Lorena Fuentes (Bici-entrega 2)', label: 'Lorena Fuentes (Bici-entrega 2)' },
                { value: 'Andrés Castro (Camión Ligero 1)', label: 'Andrés Castro (Camión Ligero 1)' }
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Estado Inicial</label>
            <CustomSelect
              value={estadoRuta}
              onChange={(val) => {
                setEstadoRuta(val);
                setAnimandoRuta(false);
                setProgresoViaje(0);
              }}
              options={[
                { value: 'pendiente', label: 'PENDIENTE' },
                { value: 'en_ruta', label: 'EN RUTA' },
                { value: 'entregado', label: 'ENTREGADO' }
              ]}
            />
          </div>
        </div>
      }
    >
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-6" style={{ color: 'var(--color-text)' }}>
        {/* Ficha Resumen de Ruta */}
        <div className="flex justify-between items-start border-b border-[var(--color-border)] pb-4">
          <div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Hoja de Ruta y Despacho</span>
            <h3 className="text-sm font-bold text-[var(--color-text)] mt-1">Envío a {cliente}</h3>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{direccion}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase block">Tarifa de Flete</span>
            <span className="font-mono text-xs font-black text-indigo-400">$ {valorFlete.toLocaleString()} COP</span>
          </div>
        </div>

        {/* Stepper de Progreso Lineal (Cumple estándar z-index de la línea de progreso) */}
        <div className="relative flex items-center justify-between py-4">
          {/* Línea de Progreso de Fondo */}
          <div className="absolute left-4 right-4 h-1 bg-[var(--color-border)] z-[-10]" />
          {/* Línea de Progreso Activa */}
          <div 
            className="absolute left-4 h-1 bg-indigo-600 z-[-10] transition-all duration-300"
            style={{ 
              width: estadoRuta === 'entregado' ? 'calc(100% - 2rem)' : estadoRuta === 'en_ruta' ? '50%' : '0%' 
            }}
          />

          {/* Hito 1: Preparación */}
          <div className="flex flex-col items-center gap-1.5 bg-[var(--color-surface)] px-2">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs relative z-10 transition-all ${getHitoClass(0)}`}>
              1
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Preparación</span>
          </div>

          {/* Hito 2: En Tránsito */}
          <div className="flex flex-col items-center gap-1.5 bg-[var(--color-surface)] px-2">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs relative z-10 transition-all ${getHitoClass(1)}`}>
              2
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">En Tránsito</span>
          </div>

          {/* Hito 3: Entregado */}
          <div className="flex flex-col items-center gap-1.5 bg-[var(--color-surface)] px-2">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs relative z-10 transition-all ${getHitoClass(2)}`}>
              3
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Entregado</span>
          </div>
        </div>

        {/* Simulador Radar de Ruta */}
        <div className="relative h-20 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center px-6 overflow-hidden select-none">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px)] bg-[size:15px_15px]" />
          
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex flex-col">
              <span className="text-[14px]">🏬</span>
              <span className="text-[8px] text-[var(--color-text-muted)] font-bold mt-1">TIENDA</span>
            </div>

            {/* Repartidor en Ruta */}
            <div className="flex-1 px-4 relative">
              <div className="h-0.5 border-t-2 border-dashed border-[var(--color-border)] w-full" />
              {estadoRuta === 'en_ruta' && (
                <div 
                  className="absolute -top-3.5 text-lg transition-all duration-300"
                  style={{ left: `${progresoViaje}%`, transform: 'translateX(-50%)' }}
                >
                  🏍️
                </div>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[14px]">🏠</span>
              <span className="text-[8px] text-[var(--color-text-muted)] font-bold mt-1">CLIENTE</span>
            </div>
          </div>

          {/* Barra de progreso de animación */}
          {animandoRuta && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600/30">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progresoViaje}%` }}
              />
            </div>
          )}
        </div>

        {/* Panel de Control de Simulación */}
        <div className="flex justify-between items-center bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border)]">
          <div className="min-w-0">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Repartidor Activo</span>
            <p className="text-xs font-bold text-[var(--color-text)] truncate mt-0.5">{repartidor}</p>
          </div>
          <button
            onClick={handleIniciarDespacho}
            disabled={estadoRuta === 'entregado' || animandoRuta}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-98 disabled:opacity-50 transition-all border-none"
          >
            {animandoRuta ? 'Simulando Ruta...' : estadoRuta === 'entregado' ? 'Entrega Completada' : 'Iniciar Despacho'}
          </button>
        </div>
      </div>
    </SandboxLayout>
  );
}
