import React, { useState, useEffect, useRef } from 'react';
import { Scan, ShoppingCart, Trash2, HelpCircle } from 'lucide-react';

export default function POSExpressScannerSandbox() {
  const products = [
    { id: '1', name: 'Leche Alquería Entera 1L', price: 4200, barcode: '7702001001234', sku: 'L-ENT' },
    { id: '2', name: 'Pan Tajado Bimbo Grande', price: 6800, barcode: '7702001005678', sku: 'P-TAJ' },
    { id: '3', name: 'Café Águila Roja 500g', price: 12500, barcode: '7702001009999', sku: 'C-AGU' }
  ];

  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastScanned, setLastScanned] = useState(null);

  const playBeep = (freq = 800, dur = 0.08) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      console.warn(e.message);
    }
  };

  const processBarcode = (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const prod = products.find(p => p.barcode === trimmed || p.sku === trimmed);
    if (prod) {
      playBeep(880, 0.08); // Bip
      setCart(prev => {
        const existIdx = prev.findIndex(item => item.id === prod.id);
        if (existIdx > -1) {
          const updated = [...prev];
          updated[existIdx].quantity += 1;
          return updated;
        } else {
          return [...prev, { ...prod, quantity: 1 }];
        }
      });
      setLastScanned(prod);
    } else {
      playBeep(220, 0.25); // Error beep
      alert(`Código o SKU "${trimmed}" no encontrado.\nPrueba con los SKU sugeridos.`);
    }
    setBarcodeInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processBarcode(barcodeInput);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 max-w-md mx-auto text-slate-200">
      <div>
        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">Checkout POS por Código</span>
        <span className="text-[9px] text-slate-500 block">Digita códigos y pulsa Enter. Códigos de prueba a la derecha.</span>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 text-[9px]">
        {products.map(p => (
          <button
            key={p.id}
            onClick={() => processBarcode(p.barcode)}
            className="p-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[8.5px] cursor-pointer text-left flex flex-col justify-between h-11"
            title="Escanear simulado"
          >
            <span className="font-bold text-slate-300 truncate w-full">{p.name.split(' ')[0]}</span>
            <span className="font-mono text-indigo-400 font-bold block">{p.barcode.slice(-4)}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Scan size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Escanear o ingresar código..."
            value={barcodeInput}
            onChange={e => setBarcodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <button
          onClick={() => processBarcode(barcodeInput)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Escanear
        </button>
      </div>

      {lastScanned && (
        <div className="bg-indigo-500/10 border border-indigo-500/25 p-2 rounded-xl flex items-center justify-between text-[10px] text-indigo-300">
          <span>Último: <strong>{lastScanned.name}</strong></span>
          <span className="font-mono font-bold">${lastScanned.price.toLocaleString('es-CO')}</span>
        </div>
      )}

      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
        {cart.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-600 italic">
            Sin artículos en el POS
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-slate-900/30 p-2 rounded-xl border border-slate-800/60 text-xs">
              <div>
                <span className="font-bold text-slate-300 block">{item.name}</span>
                <span className="text-[10px] text-slate-500">${item.price.toLocaleString('es-CO')} x {item.quantity}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-200">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                <button
                  onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                  className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="pt-2 border-t border-slate-900 space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-slate-200">
            <span>Total POS:</span>
            <span className="font-mono text-indigo-400">${total.toLocaleString('es-CO')}</span>
          </div>
          <button
            onClick={() => {
              playBeep(980, 0.12);
              alert('Cobro Procesado Exitosamente.');
              setCart([]);
              setLastScanned(null);
            }}
            className="w-full flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            <ShoppingCart size={11} /> Facturar Pedido
          </button>
        </div>
      )}
    </div>
  );
}
