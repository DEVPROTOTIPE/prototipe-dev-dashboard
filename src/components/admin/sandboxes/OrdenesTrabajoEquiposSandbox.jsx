import React, { useState, useRef } from 'react';
import { FileText, Plus, Trash, ShieldAlert } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

export default function OrdenesTrabajoEquiposSandbox() {
  const { showAlert } = useAlertConfirm();
  const [equipment, setEquipment] = useState({ brand: 'Caterpillar', model: '320D', serial: 'CAT320D-9988X', description: 'Fuga de aceite hidráulico en pistón principal.' });
  const [parts, setParts] = useState([
    { name: 'Sello hidráulico de pistón', price: 185000 },
    { name: 'Filtro de aceite premium', price: 92000 }
  ]);
  const [labor, setLabor] = useState(150000);
  const [partInput, setPartInput] = useState({ name: '', price: '' });
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const addPart = () => {
    if (!partInput.name || !partInput.price) return;
    setParts(prev => [...prev, { name: partInput.name, price: parseFloat(partInput.price) }]);
    setPartInput({ name: '', price: '' });
  };

  const totalParts = parts.reduce((acc, p) => acc + p.price, 0);
  const grandTotal = totalParts + parseFloat(labor || 0);

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3 max-w-md mx-auto text-slate-200">
      <div>
        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">Ficha de Órdenes de Trabajo (OT)</span>
        <span className="text-[9px] text-slate-500 block">Registra reparaciones, insumos, costos y firma de recibido.</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <input
          type="text"
          placeholder="Marca..."
          value={equipment.brand}
          onChange={e => setEquipment(prev => ({ ...prev, brand: e.target.value }))}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Modelo..."
          value={equipment.model}
          onChange={e => setEquipment(prev => ({ ...prev, model: e.target.value }))}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Serial..."
          value={equipment.serial}
          onChange={e => setEquipment(prev => ({ ...prev, serial: e.target.value }))}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-slate-200 col-span-2 focus:outline-none"
        />
        <textarea
          placeholder="Fallo o diagnóstico..."
          value={equipment.description}
          onChange={e => setEquipment(prev => ({ ...prev, description: e.target.value }))}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-slate-200 col-span-2 focus:outline-none h-12 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-[9px] font-black uppercase text-indigo-400">Repuestos Utilizados</span>
        <div className="flex gap-1.5 text-[11px]">
          <input
            type="text"
            placeholder="Repuesto..."
            value={partInput.name}
            onChange={e => setPartInput(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Precio..."
            value={partInput.price}
            onChange={e => setPartInput(prev => ({ ...prev, price: e.target.value }))}
            className="w-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1 focus:outline-none"
          />
          <button onClick={addPart} className="px-2 bg-indigo-600 rounded-xl font-bold cursor-pointer hover:bg-indigo-500">+</button>
        </div>

        {parts.length > 0 && (
          <div className="space-y-1 bg-[var(--color-surface)]/40 p-2 border border-[var(--color-border)] rounded-xl text-[9px] max-h-[80px] overflow-y-auto">
            {parts.map((part, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-300">
                <span>{part.name}</span>
                <span className="font-mono text-indigo-400 font-bold">${part.price.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs">
        <label className="text-[9px] font-black uppercase text-indigo-400">Mano de Obra:</label>
        <input
          type="number"
          value={labor}
          onChange={e => setLabor(e.target.value)}
          className="w-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2 py-1 text-right font-mono focus:outline-none text-[11px]"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase text-indigo-400">Firma del Cliente (Conformidad)</span>
          <button onClick={clearCanvas} className="text-[8px] font-bold text-rose-400 cursor-pointer">Limpiar</button>
        </div>
        <canvas
          ref={canvasRef}
          width={320}
          height={80}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl cursor-crosshair h-16"
        />
      </div>

      <div className="pt-2 border-t border-[var(--color-border)]">
        <div className="flex justify-between items-center text-xs font-black text-slate-200 mb-2">
          <span>Total Reparación:</span>
          <span className="font-mono text-indigo-400">${grandTotal.toLocaleString('es-CO')}</span>
        </div>
        <button
          onClick={() => {
            showAlert({
              title: 'Orden de Trabajo Guardada',
              message: 'Orden de trabajo guardada exitosamente. Firma almacenada en base64.',
              variant: 'success'
            });
          }}
          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md text-center"
        >
          Guardar OT en Historial
        </button>
      </div>
    </div>
  );
}
