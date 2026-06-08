import React, { useState } from 'react';
// Since the library holds documentation in .md files, the Sandboxes in dev-dashboard have their own JSX implementations representing the components.
// So let's write a fully functional self-contained KDS playground.


import { Play, Check, Clock, Plus, Bell } from 'lucide-react';

export default function PantallaCocinaKDSSandbox() {
  const [orders, setOrders] = useState([
    {
      id: '1',
      orderNum: '1024',
      status: 'pending',
      createdAt: Date.now() - 120000, // Hace 2 min
      items: [{ quantity: 2, name: 'Hamburguesa Premium' }, { quantity: 1, name: 'Papas Fritas' }],
      notes: 'Sin cebolla'
    },
    {
      id: '2',
      orderNum: '1025',
      status: 'preparing',
      createdAt: Date.now() - 400000, // Hace ~7 min
      items: [{ quantity: 1, name: 'Pizza Pepperoni Mediana' }, { quantity: 2, name: 'Gaseosa Coca-Cola' }]
    }
  ]);

  const [timers, setTimers] = useState({});

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimers = {};
      orders.forEach(order => {
        if (order.status !== 'delivered' && order.createdAt) {
          const diffSec = Math.floor((now - order.createdAt) / 1000);
          newTimers[order.id] = diffSec;
        }
      });
      setTimers(newTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const getTimerColor = (sec) => {
    if (sec < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (sec < 600) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse';
  };

  const formatTime = (totalSeconds) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleUpdateStatus = (id, nextStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
  };

  const handleAddMockOrder = () => {
    const randomItems = [
      [{ quantity: 1, name: 'Tacos al Pastor x3' }, { quantity: 1, name: 'Horchata Grande' }],
      [{ quantity: 1, name: 'Lasagna de Carne' }, { quantity: 1, name: 'Copa de Vino Tinto' }],
      [{ quantity: 2, name: 'Malteada de Vainilla' }, { quantity: 1, name: 'Waffle Nutella' }]
    ];
    const itemSet = randomItems[Math.floor(Math.random() * randomItems.length)];
    const newOrder = {
      id: Date.now().toString(),
      orderNum: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'pending',
      createdAt: Date.now(),
      items: itemSet,
      notes: Math.random() > 0.5 ? 'Enviar cubiertos' : ''
    };
    setOrders(prev => [...prev, newOrder]);
    
    // Simular el beep sintético de alerta de comanda
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn(e.message);
    }
  };

  const columns = {
    pending: { title: 'Cola de Entrada', list: orders.filter(o => o.status === 'pending') },
    preparing: { title: 'En Preparación', list: orders.filter(o => o.status === 'preparing') },
    ready: { title: 'Listo para Despacho', list: orders.filter(o => o.status === 'ready') }
  };

  return (
    <div className="space-y-4">
      {/* Botón de Comulación rápida */}
      <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800 p-3 rounded-2xl">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Panel de Control de Cocina</span>
          <span className="text-[9px] text-slate-500 block">Simula la entrada de comandas en tiempo real.</span>
        </div>
        <button
          onClick={handleAddMockOrder}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black cursor-pointer shadow-md transition-colors"
        >
          <Plus size={11} /> Recibir Orden
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(columns).map(([statusKey, col]) => (
          <div key={statusKey} className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-3 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-300">{col.title}</h3>
              <span className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {col.list.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin max-h-[400px]">
              {col.list.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-600 italic text-[10px]">
                  Sin comandas
                </div>
              ) : (
                col.list.map(order => (
                  <div key={order.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 shadow-md">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-black text-indigo-400">#{order.orderNum}</span>
                      {timers[order.id] !== undefined && (
                        <span className={`flex items-center gap-1 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${getTimerColor(timers[order.id])}`}>
                          <Clock size={9} />
                          {formatTime(timers[order.id])}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-slate-200">
                          <span><strong className="text-indigo-300">{item.quantity}x</strong> {item.name}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[9px] bg-amber-500/5 border border-amber-500/10 text-amber-300/80 p-1.5 rounded-lg italic">
                        Nota: {order.notes}
                      </p>
                    )}

                    <div className="flex gap-1.5 pt-2 border-t border-slate-900">
                      {statusKey === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="w-full flex items-center justify-center gap-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                        >
                          <Play size={9} /> Preparar
                        </button>
                      )}
                      {statusKey === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ready')}
                          className="w-full flex items-center justify-center gap-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                        >
                          <Check size={9} /> Terminar
                        </button>
                      )}
                      {statusKey === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="w-full flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                        >
                          Despachar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
