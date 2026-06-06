import React, { useState, useEffect, useRef } from 'react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

function SandboxRaffleNumberSelector({
  soldNumbers = [],
  reservedNumbers = [],
  selectedNumbers = [],
  clientDetails = {},
  color1 = 'var(--color-primary, #6366f1)',
  color2 = 'var(--color-accent, #3b82f6)',
  isAdmin = false,
  onNumberToggle = () => {},
  onAdminAction = () => {},
  onQuickPick = () => {}
}) {
  const [luckySpinning, setLuckySpinning] = useState(false);
  const [spinHighlight, setSpinHighlight] = useState(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragSelectedRef = useRef(new Set());

  const numbersList = Array.from({ length: 100 }, (_, i) => {
    return i.toString().padStart(2, '0');
  });

  useEffect(() => {
    if (isAdmin) return;

    const handlePointerDown = (e) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      dragSelectedRef.current.clear();
      
      const cell = e.target.closest('[data-number]');
      if (cell) {
        const num = cell.getAttribute('data-number');
        if (!soldNumbers.includes(num) && !reservedNumbers.includes(num)) {
          dragSelectedRef.current.add(num);
          onNumberToggle(num);
          if (navigator.vibrate) navigator.vibrate(10);
        }
      }
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;
      
      const cell = element.closest('[data-number]');
      if (cell) {
        const num = cell.getAttribute('data-number');
        if (!soldNumbers.includes(num) && !reservedNumbers.includes(num) && !dragSelectedRef.current.has(num)) {
          dragSelectedRef.current.add(num);
          onNumberToggle(num);
          if (navigator.vibrate) navigator.vibrate(10);
        }
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      if (container) {
        container.removeEventListener('pointerdown', handlePointerDown);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [soldNumbers, reservedNumbers, isAdmin, onNumberToggle]);

  const triggerLuckyDraw = (count = 1) => {
    if (luckySpinning) return;
    setLuckySpinning(true);

    const available = numbersList.filter(n => !soldNumbers.includes(n) && !reservedNumbers.includes(n) && !selectedNumbers.includes(n));
    if (available.length < count) {
      alert("No hay suficientes números disponibles.");
      setLuckySpinning(false);
      return;
    }

    let iterations = 0;
    const maxIterations = 20;
    const intervalTime = 60;

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * available.length);
      setSpinHighlight(available[randomIdx]);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setSpinHighlight(null);
        setLuckySpinning(false);

        const shuffled = [...available].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);
        selected.forEach(num => onNumberToggle(num));
      }
    }, intervalTime);
  };

  const getStatus = (num) => {
    if (soldNumbers.includes(num)) return 'sold';
    if (reservedNumbers.includes(num)) return 'reserved';
    if (selectedNumbers.includes(num)) return 'selected';
    if (luckySpinning && spinHighlight === num) return 'spinning';
    return 'available';
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl text-white shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-black tracking-tight uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Panel de Boletas
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isAdmin ? 'Mapeo de ventas y asignación CRM' : 'Desliza o presiona para seleccionar boletas'}
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-1.5 self-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Azar:</span>
            {[1, 3, 5].map((qty) => (
              <button
                key={qty}
                onClick={() => triggerLuckyDraw(qty)}
                disabled={luckySpinning}
                className="px-2.5 py-1 text-[10px] font-black rounded-lg border border-white/5 bg-slate-950/40 hover:bg-slate-950 hover:border-white/10 transition duration-300 disabled:opacity-40"
              >
                +{qty}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-10 gap-1.5 touch-none select-none p-1.5 bg-slate-950/50 border border-white/5 rounded-2xl"
      >
        {numbersList.map((num) => {
          const status = getStatus(num);
          const detail = clientDetails[num];

          let cellClass = "";
          let cellStyle = {};

          if (status === 'sold') {
            cellClass = "bg-slate-800/40 border-slate-800 text-slate-600 cursor-pointer opacity-50";
          } else if (status === 'reserved') {
            cellClass = "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse cursor-pointer";
          } else if (status === 'selected') {
            cellClass = "border-transparent text-white font-black scale-105";
            cellStyle = {
              background: `linear-gradient(135deg, ${color1}, ${color2})`,
              boxShadow: `0 0 12px ${color1}50`,
              animation: 'elasticPop 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            };
          } else if (status === 'spinning') {
            cellClass = "border-transparent text-white font-black scale-110";
            cellStyle = {
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              animation: 'elasticPop 150ms infinite'
            };
          } else {
            cellClass = "bg-slate-900/40 border-white/5 text-slate-300 hover:border-white/20 hover:scale-105 transition-all duration-200 cursor-pointer";
          }

          return (
            <div
              key={num}
              data-number={num}
              style={cellStyle}
              className={`aspect-square border flex items-center justify-center text-[11px] sm:text-xs font-bold rounded-lg relative ${cellClass}`}
              onPointerDown={() => {
                if (isAdmin && (status === 'sold' || status === 'reserved')) {
                  onAdminAction(num, 'detail', detail);
                }
              }}
            >
              {num}
              {status === 'sold' && (
                <svg className="absolute inset-0 w-full h-full text-slate-700/80 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5 text-[10px] font-medium text-slate-400 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-slate-900/40 border border-white/10" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }} />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/30" />
          <span>Reservado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-slate-800/40 border border-slate-800 opacity-50 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-slate-700"><span className="text-[6px]">/</span></div>
          </div>
          <span>Vendido</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes elasticPop {
          0% { transform: scale(0.8); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
      `}} />
    </div>
  );
}

export default function SelectorBoletasRifasSandbox() {
  const { showAlert } = useAlertConfirm();
  const [soldNumbers, setSoldNumbers] = useState(['07', '18', '24', '42', '55', '73', '89']);
  const [reservedNumbers, setReservedNumbers] = useState(['14', '33', '67']);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [color1, setColor1] = useState('var(--color-primary)');
  const [color2, setColor2] = useState('var(--color-accent)');
  const [crmDetail, setCrmDetail] = useState(null);

  const clientDetails = {
    '07': { name: 'Juan Carlos Pérez', phone: '+57 300 481 9283', time: '06-06 09:12', email: 'juan.perez@email.com' },
    '18': { name: 'María Alejandra Gómez', phone: '+57 312 902 3847', time: '06-06 09:30', email: 'mar.gomez@email.com' },
    '24': { name: 'Andrés Felipe Restrepo', phone: '+57 315 882 1092', time: '06-06 09:45', email: 'andres.f@email.com' },
    '42': { name: 'Clara Inés Córdoba', phone: '+57 320 736 1827', time: '06-06 10:05', email: 'clara.c@email.com' },
    '55': { name: 'Sergio Agudelo', phone: '+57 300 123 4567', time: '06-06 10:20', email: 'sergio.a@email.com' },
    '73': { name: 'Diana Marcela Rincón', phone: '+57 310 938 1827', time: '06-06 10:45', email: 'diana.r@email.com' },
    '89': { name: 'Luis Fernando Castro', phone: '+57 322 839 2038', time: '06-06 11:05', email: 'luis.c@email.com' },
    '14': { name: 'Reserva temporal: Carlos', phone: 'Expira en 4 min', time: '06-06 11:25', email: 'En carrito' },
    '33': { name: 'Reserva temporal: Liliana', phone: 'Expira en 7 min', time: '06-06 11:22', email: 'En carrito' },
    '67': { name: 'Reserva temporal: Roberto', phone: 'Expira en 9 min', time: '06-06 11:20', email: 'En carrito' },
  };

  const handleNumberToggle = (num) => {
    setSelectedNumbers(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const handleAdminAction = (num, action, detail) => {
    if (action === 'detail') {
      setCrmDetail({ number: num, ...detail });
    }
  };

  return (
    <SandboxLayout
      title="Selector de Boletas de Rifa"
      description="Cuadrícula táctil interactiva 10x10 para rifas (00-99). Permite selección fluida por arrastre, sorteo rápido al azar y gestión CRM de clientes en tiempo real."
      controls={[
        { label: 'Modo Administrador', type: 'boolean', value: isAdmin, onChange: v => { setIsAdmin(v); setCrmDetail(null); } },
        { label: 'Color Gradiente 1', type: 'select', value: color1, options: ['var(--color-primary)', 'var(--color-accent)', '#ec4899', '#10b981'], onChange: v => setColor1(v) },
        { label: 'Color Gradiente 2', type: 'select', value: color2, options: ['var(--color-accent)', 'var(--color-primary)', '#8b5cf6', '#f97316'], onChange: v => setColor2(v) },
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        <div className="flex-1 w-full">
          <SandboxRaffleNumberSelector
            soldNumbers={soldNumbers}
            reservedNumbers={reservedNumbers}
            selectedNumbers={selectedNumbers}
            clientDetails={clientDetails}
            color1={color1}
            color2={color2}
            isAdmin={isAdmin}
            onNumberToggle={handleNumberToggle}
            onAdminAction={handleAdminAction}
          />

          {!isAdmin && selectedNumbers.length > 0 && (
            <div className="mt-4 p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex items-center justify-between animate-fade-in">
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Boletas Seleccionadas</h5>
                <p className="text-lg font-black text-indigo-400 mt-1.5 flex gap-1.5 flex-wrap">
                  {selectedNumbers.sort().map(n => (
                    <button
                      key={n}
                      onClick={() => handleNumberToggle(n)}
                      className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/20 hover:bg-red-500/20 border border-indigo-500/30 hover:border-red-500/30 rounded-lg text-xs text-white hover:text-red-200 transition duration-200 group cursor-pointer"
                      title={`Eliminar boleta ${n}`}
                    >
                      <span>{n}</span>
                      <span className="text-[10px] text-indigo-400 group-hover:text-red-400 font-black">×</span>
                    </button>
                  ))}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[160px] self-center">
                <button 
                  onClick={() => alert(`Procediendo a comprar boletas: ${selectedNumbers.sort().join(', ')}`)}
                  className="relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50 cursor-pointer text-center"
                >
                  Confirmar {selectedNumbers.length} boleta(s)
                </button>
                <button
                  onClick={() => setSelectedNumbers([])}
                  className="px-3 py-1.5 bg-slate-950/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-400 tracking-wider uppercase transition-all duration-200 cursor-pointer text-center"
                >
                  Limpiar Selección
                </button>
              </div>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="w-full lg:w-72 bg-slate-950/40 border border-white/5 p-5 rounded-3xl min-h-[300px] flex flex-col justify-between self-stretch">
            {crmDetail ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-black">
                      Boleta #{crmDetail.number}
                    </span>
                    <button 
                      onClick={() => setCrmDetail(null)}
                      className="text-[10px] text-slate-500 hover:text-white transition uppercase font-bold"
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Comprador</label>
                      <p className="text-sm font-bold text-white">{crmDetail.name}</p>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Teléfono</label>
                      <p className="text-xs text-slate-300 font-semibold">{crmDetail.phone}</p>
                    </div>
                    {crmDetail.email && (
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Email</label>
                        <p className="text-xs text-slate-400">{crmDetail.email}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Fecha de Adquisición</label>
                      <p className="text-[10px] text-slate-400">{crmDetail.time}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`¿Liberar boleta #${crmDetail.number}?`)) {
                        setSoldNumbers(prev => prev.filter(n => n !== crmDetail.number));
                        setReservedNumbers(prev => prev.filter(n => n !== crmDetail.number));
                        setCrmDetail(null);
                      }
                    }}
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-[10px] font-black text-red-400 tracking-wider uppercase transition"
                  >
                    Liberar Boleta
                  </button>
                  <button
                    onClick={() => alert(`Enviando comprobante de boleta #${crmDetail.number} al WhatsApp: ${crmDetail.phone}`)}
                    className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 tracking-wider uppercase transition"
                  >
                    Enviar WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-10">
                <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-slate-600 mb-3">
                  #
                </div>
                <h5 className="text-xs font-bold text-slate-400">Detalles de Boleta</h5>
                <p className="text-[10px] text-slate-500 max-w-[180px] mt-1 leading-relaxed">
                  Toca cualquier número marcado como vendido (/) o reservado para ver la información del cliente.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
