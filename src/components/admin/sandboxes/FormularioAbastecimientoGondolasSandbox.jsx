import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { ClipboardList, ArrowUpRight, CheckCircle, Plus, LayoutGrid, Info, Trash2 } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

const INITIAL_AISLE_PRODUCTS = [
  { id: 'P101', name: 'Leche Colanta Deslactosada 1L', category: 'Lácteos', status: 'abastecido', requestQty: 0, priority: 'normal' },
  { id: 'P102', name: 'Quesito Colanta 200g', category: 'Lácteos', status: 'bajo_stock', requestQty: 10, priority: 'media' },
  { id: 'P103', name: 'Mantequilla Alpina 250g', category: 'Lácteos', status: 'agotado', requestQty: 25, priority: 'alta' },
  { id: 'P104', name: 'Arroz Diana Premium 1Kg', category: 'Granos', status: 'abastecido', requestQty: 0, priority: 'normal' },
  { id: 'P105', name: 'Lenteja Seleccionada 500g', category: 'Granos', status: 'bajo_stock', requestQty: 15, priority: 'media' },
  { id: 'P106', name: 'Aceite de Oliva Extra Virgen', category: 'Granos', status: 'abastecido', requestQty: 0, priority: 'normal' },
  { id: 'P107', name: 'Coca-Cola Sabor Original 1.5L', category: 'Bebidas', status: 'agotado', requestQty: 30, priority: 'alta' },
  { id: 'P108', name: 'Jugo Hit Naranja 1L', category: 'Bebidas', status: 'abastecido', requestQty: 0, priority: 'normal' }
];

function FormularioAbastecimientoGondolas({
  onSendReport = () => {}
}) {
  const [products, setProducts] = useState(INITIAL_AISLE_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('Lácteos');
  const [customProductName, setCustomProductName] = useState('');

  const filteredProducts = products.filter(p => p.category === selectedCategory);

  const handleStatusChange = (id, newStatus) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        let reqQty = p.requestQty;
        let priority = 'normal';
        
        if (newStatus === 'abastecido') {
          reqQty = 0;
          priority = 'normal';
        } else if (newStatus === 'bajo_stock') {
          reqQty = reqQty || 10;
          priority = 'media';
        } else if (newStatus === 'agotado') {
          reqQty = reqQty || 20;
          priority = 'alta';
        }
        
        return { ...p, status: newStatus, requestQty: reqQty, priority };
      }
      return p;
    }));
  };

  const handleQuantityChange = (id, val) => {
    const qty = parseInt(val) || 0;
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, requestQty: qty };
      }
      return p;
    }));
  };

  const handleAddCustomProduct = (e) => {
    e.preventDefault();
    if (!customProductName.trim()) return;

    const newProduct = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name: customProductName.trim(),
      category: selectedCategory,
      status: 'agotado',
      requestQty: 10,
      priority: 'alta'
    };

    setProducts(prev => [...prev, newProduct]);
    setCustomProductName('');
  };

  const handleSend = () => {
    const activeRequests = products.filter(p => p.status !== 'abastecido' && p.requestQty > 0);
    onSendReport(activeRequests);
  };

  const getPriorityBadgeColor = (prio) => {
    if (prio === 'alta') return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (prio === 'media') return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border-[var(--color-border)]';
  };

  const categoryOptions = [
    { value: 'Lácteos', label: 'Pasillo 1 - Lácteos y Quesos' },
    { value: 'Granos', label: 'Pasillo 2 - Granos y Aceites' },
    { value: 'Bebidas', label: 'Pasillo 3 - Refrescos y Bebidas' }
  ];

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl w-full p-6 text-[var(--color-text)]">
      <div className="flex items-center gap-3 mb-5 border-b border-[var(--color-border)] pb-4">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Control de Abastecimiento de Góndolas</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Reporte digital de quiebres de stock y requerimiento a bodega</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Seleccionar Góndola / Pasillo
          </label>
          <CustomSelect 
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={categoryOptions}
          />
        </div>

        <form onSubmit={handleAddCustomProduct} className="flex flex-col justify-end">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            ¿Falta otro producto en esta góndola?
          </label>
          <div className="flex flex-col gap-2">
            <input 
              type="text"
              placeholder="Nombre del faltante..."
              value={customProductName}
              onChange={(e) => setCustomProductName(e.target.value)}
              className="w-full px-4 py-2 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text)]"
            />
            <button
              type="submit"
              className="w-full py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-4 h-4" />
              Añadir Producto
            </button>
          </div>
        </form>
      </div>

      <div className="border border-[var(--color-border)]/60 rounded-xl overflow-hidden mb-6">
        <div className="divide-y divide-[var(--color-border)]/50">
          {filteredProducts.map(p => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 bg-[var(--color-surface)] hover:bg-[var(--color-border)]/5 transition">
              {/* Info del producto */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{p.id}</span>
                <h5 className="font-bold text-sm text-[var(--color-text)] leading-tight break-words">{p.name}</h5>
              </div>

              {/* Controles del estatus y reposición alineados a la derecha */}
              <div className="flex flex-col gap-2 items-start sm:items-end shrink-0">
                {/* Selector de estatus */}
                <div className="flex items-center gap-1 bg-[var(--color-surface-2)] p-1 rounded-xl border border-[var(--color-border)] w-full sm:w-auto max-w-[240px]">
                  {[
                    { key: 'abastecido', label: 'Completo' },
                    { key: 'bajo_stock', label: 'Bajo' },
                    { key: 'agotado', label: 'Agotado' }
                  ].map(opt => {
                    const isActive = p.status === opt.key;
                    let colorClass = 'hover:bg-[var(--color-border)]/20';
                    if (isActive) {
                      if (opt.key === 'abastecido') colorClass = 'bg-emerald-500 text-white shadow-sm';
                      if (opt.key === 'bajo_stock') colorClass = 'bg-amber-500 text-white shadow-sm';
                      if (opt.key === 'agotado') colorClass = 'bg-red-500 text-white shadow-sm';
                    }
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleStatusChange(p.id, opt.key)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${colorClass}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Caja de reposición debajo del selector (si no está completo) */}
                {p.status !== 'abastecido' && (
                  <div className="flex items-center gap-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-2.5 py-1 text-xs font-semibold">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">Reponer</span>
                    <input 
                      type="number" 
                      min="1"
                      value={p.requestQty}
                      onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                      className="w-10 text-center font-bold bg-transparent focus:outline-none text-[var(--color-text)]"
                    />
                    <span className="text-[10px] text-[var(--color-text-muted)]">und</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded border uppercase ${getPriorityBadgeColor(p.priority)}`}>
                      {p.priority}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4 flex justify-between items-center">
        <span className="text-xs text-[var(--color-text-muted)]">
          Lotes activos para reabastecer: <span className="font-bold text-[var(--color-text)]">{products.filter(p => p.status !== 'abastecido' && p.requestQty > 0).length}</span>
        </span>
        <button
          onClick={handleSend}
          className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 px-6 py-2.5 rounded-xl font-bold shadow-md transition"
        >
          Enviar Reporte a Bodega
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function FormularioAbastecimientoGondolasSandbox() {
  const [reports, setReports] = useState([]);

  const handleSendReport = (requests) => {
    setReports(prev => [
      {
        id: `R-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString(),
        items: requests
      },
      ...prev
    ]);
  };

  return (
    <SandboxLayout
      title="Formulario de Abastecimiento de Góndolas"
      description="Simulador móvil de control de estantería y generación de órdenes de reposición a bodega"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
        <div className="xl:col-span-8">
          <FormularioAbastecimientoGondolas onSendReport={handleSendReport} />
        </div>

        {/* Órdenes Recibidas en Bodega */}
        <div className="xl:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow p-5 flex flex-col justify-between max-h-[500px]">
          <div>
            <h4 className="font-bold text-sm border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[var(--color-primary)]" />
              Órdenes de Bodega
            </h4>
            <div className="flex flex-col gap-3 py-4 overflow-y-auto max-h-[350px] min-h-[250px]">
              {reports.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[var(--color-text-muted)] text-xs">
                  <ClipboardList className="w-8 h-8 stroke-1 mb-2" />
                  <p>Ningún reporte enviado</p>
                  <p className="mt-1">Realiza la auditoría en las góndolas y presiona "Enviar Reporte a Bodega".</p>
                </div>
              ) : (
                reports.map(rep => (
                  <div key={rep.id} className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)]/55 rounded-xl text-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[var(--color-primary)]">{rep.id}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{rep.timestamp}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[11px]">
                      {rep.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-[var(--color-text)]">
                          <span>{item.name}</span>
                          <span className="font-bold">x{item.requestQty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {reports.length > 0 && (
            <button 
              onClick={() => setReports([])}
              className="w-full py-2 border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 text-xs font-semibold rounded-lg text-center transition"
            >
              Limpiar Órdenes
            </button>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
