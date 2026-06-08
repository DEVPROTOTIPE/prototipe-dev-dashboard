import React, { useState } from 'react';
import { Send, MessageCircle, RefreshCw } from 'lucide-react';

export default function OmnicanalidadWhatsAppSandbox() {
  const [channels, setChannels] = useState([
    { id: '1', label: 'Línea POS Ventas', phone: '+573001234567', isDefault: true },
    { id: '2', label: 'Línea Despachos/Bodega', phone: '+573009876543', isDefault: false }
  ]);

  const [messageText, setMessageText] = useState('Hola Sergio, tu pedido ya está listo para despacho. Costo total: $35.000. Te esperamos!');
  const [selectedChannel, setSelectedChannel] = useState('1');

  const handleTestRedirect = () => {
    const chan = channels.find(c => c.id === selectedChannel);
    if (!chan) return;

    const formattedPhone = chan.phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(messageText);
    const link = `https://wa.me/${formattedPhone}?text=${encodedText}`;

    // Mostrar una previsualización de la redirección
    alert(`Redirección simulada a WhatsApp:\n\nLínea: ${chan.label} (${chan.phone})\nURL: ${link}`);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 max-w-md mx-auto text-slate-200">
      <div>
        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">Redirecciones de WhatsApp Ecosistema</span>
        <span className="text-[9px] text-slate-500 block">Personaliza mensajes automáticos y asocia líneas según el módulo.</span>
      </div>

      <div className="space-y-3">
        {/* Selector de Canal */}
        <div className="space-y-1 text-xs">
          <label className="text-[10px] font-black uppercase text-indigo-400">Línea de Envío:</label>
          <div className="grid grid-cols-2 gap-2">
            {channels.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChannel(c.id)}
                className={`p-2 border rounded-xl text-left transition-all cursor-pointer ${
                  selectedChannel === c.id
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="font-bold text-[10px]">{c.label}</div>
                <div className="font-mono text-[8.5px] opacity-75">{c.phone}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mensaje de Plantilla */}
        <div className="space-y-1 text-xs">
          <label className="text-[10px] font-black uppercase text-indigo-400">Mensaje a Enviar:</label>
          <textarea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 h-20 resize-none font-sans"
          />
        </div>

        <button
          onClick={handleTestRedirect}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
        >
          <MessageCircle size={12} /> Probar Redirección WhatsApp
        </button>
      </div>
    </div>
  );
}
