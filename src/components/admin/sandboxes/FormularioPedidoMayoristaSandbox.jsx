import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Truck, Check, HelpCircle, ShoppingCart, Trash2, Clipboard } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

const PRODUCTOS_B2B = [
  { id: 'b2b-01', nombre: 'Saco Nitrógeno Urea (50Kg)', precioBase: 140000, stock: 500 },
  { id: 'b2b-02', nombre: 'Saco Fósforo DAP (50Kg)', precioBase: 165000, stock: 350 },
  { id: 'b2b-03', nombre: 'Saco Potasio KCI (50Kg)', precioBase: 130000, stock: 600 },
  { id: 'b2b-04', nombre: 'Rollo Alambre Púas 400m', precioBase: 195000, stock: 120 }
];

const METODOS_ENVIO = [
  { value: 'camion', label: '🚚 Camión Cama Baja (Flete Pesado - $250.000)' },
  { value: 'turbina', label: '🚛 Camión Turbina Mediano (Flete - $120.000)' },
  { value: 'retiro', label: '🏬 Retiro en Bodega Principal (Sin flete)' }
];

function FormularioPedidoMayorista({ onAddOrder }) {
  const confirm = useAlertConfirm();
  const [quantities, setQuantities] = useState(
    PRODUCTOS_B2B.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  );
  const [envioVal, setEnvioVal] = useState('camion');
  const [orderSummary, setOrderSummary] = useState(null);

  const handleQtyChange = (productId, val, maxStock) => {
    const num = Math.min(maxStock, Math.max(0, parseInt(val) || 0));
    setQuantities(prev => ({ ...prev, [productId]: num }));
    setOrderSummary(null);
  };

  const handleIncrement = (productId, maxStock) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      if (current >= maxStock) return prev;
      setOrderSummary(null);
      return { ...prev, [productId]: current + 1 };
    });
  };

  const handleDecrement = (productId) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      if (current <= 0) return prev;
      setOrderSummary(null);
      return { ...prev, [productId]: current - 1 };
    });
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalItems = 0;
    
    PRODUCTOS_B2B.forEach(p => {
      const qty = quantities[p.id] || 0;
      subtotal += p.precioBase * qty;
      totalItems += qty;
    });

    let dctoPercent = 0;
    if (totalItems >= 50) {
      dctoPercent = 20;
    } else if (totalItems >= 15) {
      dctoPercent = 10;
    }

    const discountAmount = Math.round(subtotal * (dctoPercent / 100));
    
    let flete = 0;
    if (envioVal === 'camion') flete = 250000;
    else if (envioVal === 'turbina') flete = 120000;

    const total = subtotal - discountAmount + flete;

    return {
      subtotal,
      totalItems,
      dctoPercent,
      discountAmount,
      flete,
      total
    };
  }, [quantities, envioVal]);

  const handleQuote = () => {
    if (totals.totalItems === 0) return;
    setOrderSummary({ ...totals });
  };

  const handleConfirmOrder = async () => {
    if (totals.totalItems === 0) return;

    const approved = await confirm.show({
      title: '¿Confirmar Pedido Mayorista?',
      message: `Estás a punto de registrar un pedido de ${totals.totalItems} insumos por valor de $${totals.total.toLocaleString()}. Se despachará mediante ${
        envioVal === 'camion' ? 'Camión Cama Baja' : envioVal === 'turbina' ? 'Camión Turbina' : 'Retiro en Bodega'
      }.`,
      variant: 'warning'
    });

    if (approved) {
      if (onAddOrder) {
        // Enviar desglose
        const itemsDetail = PRODUCTOS_B2B.filter(p => quantities[p.id] > 0).map(p => ({
          nombre: p.nombre,
          cant: quantities[p.id]
        }));

        onAddOrder({
          id: 'ord-' + Date.now(),
          items: itemsDetail,
          summary: totals,
          envio: envioVal
        });
      }
      setQuantities(PRODUCTOS_B2B.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}));
      setOrderSummary(null);
    }
  };

  return (
    <div className="w-full bg-[var(--color-surface)] text-[var(--color-text)] rounded-2xl border border-[var(--color-border)] shadow-xl p-4 sm:p-5 relative min-w-0">
      
      {/* Header */}
      <div className="mb-6 border-b border-[var(--color-border)] pb-4 flex items-center gap-3">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base">Pedido Mayorista B2B</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Ingresa cantidades de insumos y gestiona el envío pesado</p>
        </div>
      </div>

      {/* Tabla de Insumos */}
      <div className="w-full overflow-x-auto scrollbar-thin border border-[var(--color-border)] rounded-xl mb-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
              <th className="p-3 font-bold whitespace-nowrap">Insumo / Producto</th>
              <th className="p-3 font-bold whitespace-nowrap text-right">Precio Unitario</th>
              <th className="p-3 font-bold whitespace-nowrap text-center">Cantidad (Sacos/Rollos)</th>
              <th className="p-3 font-bold whitespace-nowrap text-right">Total Parcial</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTOS_B2B.map(product => {
              const qty = quantities[product.id] || 0;
              return (
                <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/30 transition-colors">
                  <td className="p-3 min-w-0">
                    <p className="font-bold text-[var(--color-text)] truncate max-w-[200px] sm:max-w-none">{product.nombre}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Stock: {product.stock} unds</p>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap font-medium">
                    ${product.precioBase.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleDecrement(product.id)}
                        className="w-7 h-7 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg font-bold text-sm text-[var(--color-text)] flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) => handleQtyChange(product.id, e.target.value, product.stock)}
                        className="w-12 py-1 text-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg font-bold text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleIncrement(product.id, product.stock)}
                        className="w-7 h-7 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg font-bold text-sm text-[var(--color-text)] flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap font-bold text-[var(--color-text)]">
                    ${(product.precioBase * qty).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Selector Despacho */}
        <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Método de Despacho y Flete
            </label>
            <CustomSelect
              options={METODOS_ENVIO}
              value={envioVal}
              onChange={(val) => {
                setEnvioVal(val);
                setOrderSummary(null);
              }}
            />
          </div>
          <button
            onClick={handleQuote}
            disabled={totals.totalItems === 0}
            className="w-full bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-xs font-bold py-2.5 rounded-xl border border-[var(--color-border)] transition-colors text-[var(--color-text)] flex items-center justify-center gap-1.5"
          >
            Cotizar Pedido B2B
          </button>
        </div>

        {/* Resumen Final */}
        <div className="md:col-span-6 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col justify-between">
          {orderSummary ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2">
                Resumen de Cotización
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Subtotal ({orderSummary.totalItems} insumos):</span>
                  <span className="font-bold text-[var(--color-text)]">${orderSummary.subtotal.toLocaleString()}</span>
                </div>
                {orderSummary.dctoPercent > 0 && (
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Descuento por Volumen ({orderSummary.dctoPercent}%):</span>
                    <span>-${orderSummary.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Costo Despacho/Flete:</span>
                  <span className="font-bold text-[var(--color-text)]">${orderSummary.flete.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-[var(--color-border)] pt-2 mt-1">
                  <span className="font-bold text-sm text-[var(--color-text)]">Total Neto:</span>
                  <span className="font-extrabold text-base text-[var(--color-primary)]">${orderSummary.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <div className="pt-2">
                <button
                  onClick={handleConfirmOrder}
                  className="w-full bg-[var(--color-primary)] text-white hover:opacity-95 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all !text-white"
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  Confirmar Pedido Mayorista
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[var(--color-text-muted)]">
              <HelpCircle className="w-8 h-8 stroke-1 mb-2" />
              <p className="text-xs font-semibold">Pedido Vacío o Sin Cotizar</p>
              <p className="text-[10px] mt-1 max-w-[200px]">Establece cantidades superiores a cero en la tabla y presiona "Cotizar Pedido B2B".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FormularioPedidoMayoristaSandbox() {
  const [orders, setOrders] = useState([]);

  const handleAddOrder = (order) => {
    setOrders(prev => [order, ...prev]);
  };

  const handleRemove = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <SandboxLayout
      title="Pedido Mayorista B2B"
      description="Formulario matricial de compras por volumen y cálculo de flete de transporte pesado"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
        <div className="xl:col-span-8">
          <FormularioPedidoMayorista onAddOrder={handleAddOrder} />
        </div>

        {/* Órdenes Recibidas */}
        <div className="xl:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow p-5 flex flex-col justify-between max-h-[500px]">
          <div>
            <h4 className="font-bold text-sm border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-[var(--color-primary)]" />
              Órdenes Registradas
            </h4>
            <div className="flex flex-col gap-2.5 py-4 overflow-y-auto max-h-[300px] min-h-[200px]">
              {orders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[var(--color-text-muted)] text-xs">
                  <Clipboard className="w-8 h-8 stroke-1 mb-2 text-[var(--color-text-muted)]" />
                  <p>Ningún pedido confirmado</p>
                  <p className="mt-1">Introduce cantidades, cotiza y presiona "Confirmar Pedido".</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="flex flex-col text-xs p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] gap-2">
                    <div className="flex justify-between items-center border-b border-[var(--color-border)]/50 pb-1.5">
                      <span className="font-bold text-[var(--color-primary)]">{order.id}</span>
                      <span className="font-semibold text-emerald-600">${order.summary.total.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
                          <span className="truncate max-w-[150px]">{it.nombre}</span>
                          <span>x{it.cant}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-[var(--color-border)]/50 text-[9px] text-[var(--color-text-muted)]">
                      <span>Envío: {order.envio === 'camion' ? 'Cama Baja' : order.envio === 'turbina' ? 'Turbina' : 'Bodega'}</span>
                      <button
                        onClick={() => handleRemove(order.id)}
                        className="text-red-500 hover:underline font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {orders.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-3">
              <button
                onClick={() => setOrders([])}
                className="w-full py-2 border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 text-xs font-semibold rounded-lg text-center transition-colors text-[var(--color-text)]"
              >
                Limpiar Historial
              </button>
            </div>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
