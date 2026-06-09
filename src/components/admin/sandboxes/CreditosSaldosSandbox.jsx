import React, { useState } from 'react';
import { DollarSign, User, PlusCircle, CheckCircle } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

export default function CreditosSaldosSandbox() {
  const [clients, setClients] = useState([
    { id: '1', name: 'Carlos Restrepo', limit: 1000000, balance: 350000 },
    { id: '2', name: 'Diana Montoya', limit: 500000, balance: 120000 },
    { id: '3', name: 'Almacenes Éxito', limit: 5000000, balance: 0 }
  ]);

  const [paymentInput, setPaymentInput] = useState({ clientId: '1', amount: '' });

  const handleMakePayment = () => {
    const amt = parseFloat(paymentInput.amount);
    if (isNaN(amt) || amt <= 0) return;

    setClients(prev => prev.map(c => {
      if (c.id === paymentInput.clientId) {
        if (amt > c.balance) {
          alert('El monto del abono supera la deuda actual.');
          return c;
        }
        return { ...c, balance: c.balance - amt };
      }
      return c;
    }));
    setPaymentInput(prev => ({ ...prev, amount: '' }));
    alert('Abono registrado con éxito.');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 max-w-md mx-auto text-slate-200">
      <div>
        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">Gestión de Créditos y Cuentas por Cobrar</span>
        <span className="text-[9px] text-slate-500 block">Administra deudas pendientes de clientes y abona cuotas.</span>
      </div>

      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
        {clients.map(c => (
          <div key={c.id} className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <User size={10} className="text-slate-400" /> {c.name}
              </span>
              <div className="flex gap-2 text-[9px] text-slate-500">
                <span>Cupo: ${c.limit.toLocaleString('es-CO')}</span>
                <span>Disponible: ${(c.limit - c.balance).toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="text-right">
              {c.balance > 0 ? (
                <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/15">
                  Debe: ${c.balance.toLocaleString('es-CO')}
                </span>
              ) : (
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/15">
                  Al día
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-900 space-y-2 text-xs">
        <h4 className="text-[10px] font-black uppercase text-indigo-400">Registrar Abono de Cuota</h4>
        <div className="flex gap-2">
          <div className="flex-1 min-w-[140px]">
            <CustomSelect
              value={paymentInput.clientId}
              onChange={val => setPaymentInput(prev => ({ ...prev, clientId: val }))}
              options={clients.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>
          <input
            type="number"
            placeholder="Monto a abonar..."
            value={paymentInput.amount}
            onChange={e => setPaymentInput(prev => ({ ...prev, amount: e.target.value }))}
            className="w-24 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-2 py-1 focus:outline-none font-mono text-[11px]"
          />
          <button
            onClick={handleMakePayment}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
          >
            Abonar
          </button>
        </div>
      </div>
    </div>
  );
}
