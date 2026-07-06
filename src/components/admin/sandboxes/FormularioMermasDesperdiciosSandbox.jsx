import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Trash2, AlertTriangle, AlertCircle, TrendingDown, ClipboardList } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import CustomSelect from '../../ui/CustomSelect';

const PRODUCT_LIST = [
  { id: 'P01', name: 'Jamón Cuit Sándwich 500g', costPrice: 9500, category: 'Fiambrería' },
  { id: 'P02', name: 'Queso Mozzarella Colanta 1Kg', costPrice: 22000, category: 'Lácteos' },
  { id: 'P03', name: 'Manzana Verde Importada 1Kg', costPrice: 6800, category: 'Fruver' },
  { id: 'P04', name: 'Aceite de Girasol Premier 1L', costPrice: 7900, category: 'Granos' },
  { id: 'P05', name: 'Filete de Salmón Premium 500g', costPrice: 38000, category: 'Pescadería' }
];

const REASONS = [
  { value: 'vencimiento', label: 'Fecha de Vencimiento Expirada' },
  { value: 'rotura', label: 'Rotura / Daño Físico de Empaque' },
  { value: 'frio', label: 'Pérdida de Cadena de Frío' },
  { value: 'robo', label: 'Robo / Pérdida Desconocida' }
];

function FormularioMermasDesperdicios({
  onAddMerma = () => {}
}) {
  const [selectedProductId, setSelectedProductId] = useState(PRODUCT_LIST[0].id);
  const [selectedReason, setSelectedReason] = useState(REASONS[0].value);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const confirm = useAlertConfirm();

  const selectedProduct = useMemo(() => {
    return PRODUCT_LIST.find(p => p.id === selectedProductId) || PRODUCT_LIST[0];
  }, [selectedProductId]);

  const lossValue = useMemo(() => {
    return selectedProduct.costPrice * quantity;
  }, [selectedProduct, quantity]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const handleRegisterMerma = async (e) => {
    e.preventDefault();
    
    const reasonLabel = REASONS.find(r => r.value === selectedReason)?.label || selectedReason;

    const accepted = await confirm({
      title: '¿Confirmar Baja de Inventario?',
      message: `Esta acción descontará definitivamente ${quantity} unidades de "${selectedProduct.name}" del inventario. El costo de pérdida registrado será de ${formatCurrency(lossValue)} bajo el motivo: "${reasonLabel}".`,
      variant: 'error',
      confirmText: 'Sí, Registrar Merma',
      cancelText: 'Cancelar'
    });

    if (accepted) {
      onAddMerma({
        id: `M-${Date.now().toString().slice(-4)}`,
        product: selectedProduct,
        reason: selectedReason,
        reasonLabel: reasonLabel,
        quantity,
        lossValue,
        notes: notes.trim(),
        timestamp: new Date().toLocaleTimeString()
      });
      setQuantity(1);
      setNotes('');
    }
  };

  const isHighLoss = lossValue >= 50000;

  const productOptions = PRODUCT_LIST.map(p => ({
    value: p.id,
    label: `${p.name} (${formatCurrency(p.costPrice)}/u)`
  }));

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl w-full p-6 text-[var(--color-text)]">
      <div className="flex items-center gap-3 mb-5 border-b border-[var(--color-border)] pb-4">
        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Registro de Mermas y Averías</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Reporte técnico de pérdidas y descarte de productos físicos</p>
        </div>
      </div>

      <form onSubmit={handleRegisterMerma} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Producto Afectado
          </label>
          <CustomSelect 
            value={selectedProductId}
            onChange={(val) => setSelectedProductId(val)}
            options={productOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 h-8 flex items-end">
              Motivo del Descarte
            </label>
            <CustomSelect 
              value={selectedReason}
              onChange={(val) => setSelectedReason(val)}
              options={REASONS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 h-8 flex items-end">
              Cantidad a Descartar
            </label>
            <input 
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text)] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Observaciones Adicionales
          </label>
          <textarea
            placeholder="Detalla cómo ocurrió el daño o especificaciones del lote..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none text-[var(--color-text)]"
          />
        </div>

        <div className={`p-4 rounded-xl border flex justify-between items-center transition ${isHighLoss ? 'bg-red-500/10 border-red-500/35 text-red-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]/55'}`}>
          <div className="flex items-center gap-2">
            {isHighLoss ? <AlertTriangle className="w-5 h-5 animate-bounce shrink-0" /> : <AlertCircle className="w-5 h-5 text-[var(--color-primary)] shrink-0" />}
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-85">Pérdida Financiera Estimada</span>
              <p className="text-[10px] opacity-75">Calculado sobre costo de adquisición de tienda</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] opacity-75">{quantity} x {formatCurrency(selectedProduct.costPrice)}</span>
            <p className="font-extrabold text-lg !text-[var(--color-primary)] leading-none mt-1">{formatCurrency(lossValue)}</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600 py-3 rounded-xl font-bold shadow-lg transition duration-200"
        >
          <Trash2 className="w-4 h-4" />
          Registrar Merma Definitiva
        </button>
      </form>
    </div>
  );
}

export default function FormularioMermasDesperdiciosSandbox() {
  const [mermas, setMermas] = useState([]);

  const handleAddMerma = (merma) => {
    setMermas(prev => [merma, ...prev]);
  };

  const handleClearHistory = () => {
    setMermas([]);
  };

  const totalLoss = mermas.reduce((sum, item) => sum + item.lossValue, 0);
  const totalLossFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalLoss);

  return (
    <SandboxLayout
      title="Formulario de Mermas y Desperdicios"
      description="Dashboard de auditoría operativa para justificar descarte de inventario y registrar impacto contable"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
        <div className="xl:col-span-7">
          <FormularioMermasDesperdicios onAddMerma={handleAddMerma} />
        </div>

        {/* Resumen e Historial de Mermas */}
        <div className="xl:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow p-5 flex flex-col justify-between max-h-[550px]">
          <div>
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3 mb-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[var(--color-primary)]" />
                Historial de Bajas ({mermas.length})
              </h4>
              {mermas.length > 0 && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                  Total Perdido: {totalLossFormatted}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] min-h-[250px]">
              {mermas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-muted)] text-xs">
                  <Trash2 className="w-10 h-10 stroke-1 mb-2" />
                  <p>Ninguna merma reportada en esta sesión.</p>
                </div>
              ) : (
                mermas.map(item => (
                  <div key={item.id} className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)]/55 rounded-xl text-xs flex flex-col gap-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[var(--color-text)]">{item.product.name}</span>
                      <span className="text-red-500 font-extrabold">
                        -{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.lossValue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[var(--color-text-muted)]">
                      <span>Motivo: {item.reasonLabel} ({item.quantity} ud)</span>
                      <span>{item.timestamp}</span>
                    </div>
                    {item.notes && (
                      <p className="mt-1 text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)]/50 p-1.5 rounded italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {mermas.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="w-full py-2.5 mt-4 border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 text-xs font-semibold rounded-xl text-center transition"
            >
              Limpiar Historial de Simulación
            </button>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
