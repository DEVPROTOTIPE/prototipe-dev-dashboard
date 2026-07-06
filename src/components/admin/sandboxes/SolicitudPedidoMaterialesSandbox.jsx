import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Plus, Trash2, Send, ShoppingBag, Calendar, CheckCircle2 } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import DatePickerPremium from '../../ui/DatePickerPremium';

// Recreación inline del componente
function SolicitudPedidoMateriales({
  onSubmitRequest,
  confirmAction,
  materialesCatalogo = [
    { value: 'cemento_gris', label: 'Cemento Gris Portland (Saco 50kg)', unidad: 'Sacos' },
    { value: 'varilla_media', label: 'Varilla de Acero Corrugado 1/2"', unidad: 'Unidades' },
    { value: 'arena_azul', label: 'Arena Lavada de Río (Volquetada)', unidad: 'm³' },
    { value: 'grava_triturada', label: 'Piedra Grava Triturada 3/4"', unidad: 'm³' },
    { value: 'ladrillo_bloque', label: 'Ladrillo Bloque Nro 4 estructural', unidad: 'Unidades' }
  ]
}) {
  const [material, setMaterial] = useState('cemento_gris');
  const [cantidad, setCantidad] = useState(10);
  const [fechaEntrega, setFechaEntrega] = useState(null);
  const [prioridad, setPrioridad] = useState('normal');

  const [items, setItems] = useState([]);

  const materialActivo = React.useMemo(() => {
    return materialesCatalogo.find(m => m.value === material) || materialesCatalogo[0];
  }, [material, materialesCatalogo]);

  const agregarAlPedido = () => {
    if (cantidad <= 0 || !fechaEntrega) return;

    const fechaFormateada = fechaEntrega.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const existeIndex = items.findIndex(it => it.materialKey === material);
    if (existeIndex > -1) {
      setItems(items.map((it, idx) => idx === existeIndex ? { ...it, cantidad: it.cantidad + cantidad } : it));
    } else {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          materialKey: material,
          label: materialActivo.label,
          unidad: materialActivo.unidad,
          cantidad,
          fechaEntrega: fechaFormateada,
          prioridad
        }
      ]);
    }

    setCantidad(10);
    setFechaEntrega(null);
  };

  const eliminarItem = (id) => {
    setItems(items.filter(it => it.id !== id));
  };

  const handleCancelar = async () => {
    if (items.length === 0) return;
    const confirmed = await confirmAction({
      title: '¿Vaciar pedido en curso?',
      message: 'Esta acción removerá todos los materiales agregados al carrito de solicitud actual.',
      confirmText: 'Vaciar Carrito',
      cancelText: 'Volver'
    });

    if (confirmed) {
      setItems([]);
    }
  };

  const handleSend = () => {
    if (items.length === 0) return;
    if (onSubmitRequest) {
      onSubmitRequest(items);
    }
    setItems([]);
  };

  const getPrioridadBadge = (prio) => {
    switch (prio) {
      case 'critico':
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-red-500/10 border border-red-500/20 text-red-400">Crítico</span>;
      case 'urgente':
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">Urgente</span>;
      default:
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">Normal</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl text-[var(--color-text)]">
      {/* Cabecera */}
      <div className="flex items-center gap-3 pb-5 border-b border-[var(--color-border)] mb-6">
        <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Solicitud de Materiales</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Envío de órdenes de suministro a bodega central</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Formulario */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold">Agregar Material</h3>

          {/* Seleccionar Material */}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Nombre / Referencia de Material</label>
            <CustomSelect
              value={material}
              onChange={setMaterial}
              options={materialesCatalogo.map(m => ({ value: m.value, label: m.label }))}
            />
          </div>

          {/* Cantidad y Unidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">Cantidad Requerida</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-center font-bold focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">Unidad base</label>
              <div className="w-full px-3 py-2 bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-lg text-xs font-semibold text-center mt-0.5">
                {materialActivo.unidad}
              </div>
            </div>
          </div>

          {/* Fecha Límite */}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Fecha Límite en Obra
            </label>
            <DatePickerPremium
              value={fechaEntrega}
              onChange={setFechaEntrega}
              placeholder="Seleccione plazo..."
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Prioridad Logística</label>
            <CustomSelect
              value={prioridad}
              onChange={setPrioridad}
              options={[
                { value: 'normal', label: 'Prioridad Normal (Hasta 3 días)' },
                { value: 'urgente', label: 'Prioridad Urgente (Siguiente día)' },
                { value: 'critico', label: 'Prioridad Crítica (Mismo día)' }
              ]}
            />
          </div>

          <button
            onClick={agregarAlPedido}
            className="w-full py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            Agregar a Solicitud
          </button>
        </div>

        {/* Panel Lista de Materiales Solicitados */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-4 rounded-xl flex flex-col h-full justify-between">
            <div>
              <h3 className="text-sm font-bold mb-3">Orden de Despacho en Curso</h3>
              <div className="max-h-[300px] overflow-y-auto pr-2 py-4">
                {items.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
                    No has agregado materiales a la orden de despacho todavía.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3.5 bg-[var(--color-bg)]/80 border border-[var(--color-border)] rounded-xl gap-4">
                        <div className="flex-1">
                          <span className="text-xs font-bold block">{item.label}</span>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-[var(--color-primary)] font-bold">
                              {item.cantidad} {item.unidad}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              Plazo: {item.fechaEntrega}
                            </span>
                            {getPrioridadBadge(item.prioridad)}
                          </div>
                        </div>
                        <button
                          onClick={() => eliminarItem(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fila Acciones */}
            {items.length > 0 && (
              <div className="flex gap-3 pt-3 border-t border-[var(--color-border)] mt-4">
                <button
                  onClick={handleCancelar}
                  className="flex-1 py-2.5 border border-[var(--color-border)] hover:bg-red-500/10 hover:border-red-500/20 text-red-400 font-semibold rounded-xl text-xs transition-all active:scale-[0.98]"
                >
                  Cancelar Pedido
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Orden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolicitudPedidoMaterialesSandbox() {
  const { alertConfirm } = useAlertConfirm();
  const [lastRequest, setLastRequest] = useState(null);

  const handleSave = (result) => {
    setLastRequest(result);
  };

  return (
    <SandboxLayout
      title="Solicitud de Pedido de Materiales"
      description="Formulario interactivo de aprovisionamiento de materiales pesados a almacén o proveedor."
    >
      <div className="flex flex-col gap-6">
        <SolicitudPedidoMateriales
          onSubmitRequest={handleSave}
          confirmAction={alertConfirm}
        />

        {lastRequest && (
          <div className="max-w-4xl mx-auto w-full p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
            <p className="font-bold">✓ Pedido interno enviado a bodega central:</p>
            <div className="mt-1 flex flex-col gap-1">
              {lastRequest.map(item => (
                <div key={item.id} className="text-xs">
                  • {item.label}: {item.cantidad} {item.unidad} (Plazo: {item.fechaEntrega}) [{item.prioridad}]
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
