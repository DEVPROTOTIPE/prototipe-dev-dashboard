import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Sparkline, AreaChart, BarChart, KpiCard } from '../../ui/ProtoCharts';

// ── DATOS DE DEMO ────────────────────────────────────────────────────────────
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const VENTAS_DATA   = [1200000, 980000, 1450000, 1100000, 1680000, 1900000, 1750000, 2100000, 1850000, 2300000, 2150000, 2600000];
const PEDIDOS_DATA  = [34, 28, 41, 36, 55, 62, 58, 70, 64, 78, 71, 89];
const CLIENTES_DATA = [12, 15, 11, 18, 22, 19, 25, 28, 24, 31, 29, 35];
const TICKET_DATA   = VENTAS_DATA.map((v, i) => Math.round(v / PEDIDOS_DATA[i]));

const CATEGORIAS    = ['Ropa', 'Calzado', 'Accesorios', 'Bolsos', 'Perfumes', 'Otros'];
const VENTAS_CAT    = [4500000, 3200000, 1800000, 2700000, 1200000, 900000];
const COLORES_CAT   = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

// ── SANDBOX ──────────────────────────────────────────────────────────────────
export default function ProtoChartsSandbox() {
  const [activeDemo, setActiveDemo] = useState('kpi');
  const [showAvg, setShowAvg]       = useState(true);
  const [dataRange, setDataRange]   = useState(12); // 6 o 12 meses

  const slicedMeses   = MESES.slice(-dataRange);
  const slicedVentas  = VENTAS_DATA.slice(-dataRange);
  const slicedPedidos = PEDIDOS_DATA.slice(-dataRange);
  const slicedTicket  = TICKET_DATA.slice(-dataRange);

  const demos = [
    { id: 'kpi',  label: 'KPI Cards' },
    { id: 'area', label: 'Area Chart' },
    { id: 'bar',  label: 'Bar Chart' },
    { id: 'spark',label: 'Sparklines' },
  ];

  return (
    <SandboxLayout
      title="ProtoCharts — SVG Puro"
      description="Biblioteca de visualización de datos propia. Cero dependencias externas. Sparkline, AreaChart, BarChart y KpiCard adaptados al tema PROTOTIPE."
      controls={[
        {
          label: 'Vista',
          type: 'select',
          value: activeDemo,
          onChange: setActiveDemo,
          options: demos.map(d => d.id),
        },
        {
          label: 'Período',
          type: 'select',
          value: String(dataRange),
          onChange: (v) => setDataRange(Number(v)),
          options: ['6', '12'],
        },
        {
          label: 'Promedio',
          type: 'toggle',
          value: showAvg,
          onChange: setShowAvg,
          labels: ['Oculto', 'Visible'],
        },
      ]}
    >
      {/* ── KPI CARDS ── */}
      {activeDemo === 'kpi' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <KpiCard
            title="Ventas del Mes"
            value={slicedVentas[slicedVentas.length - 1]}
            prevValue={slicedVentas[slicedVentas.length - 2]}
            trend={slicedVentas}
            unit="$"
            icon="💰"
            color="#6366f1"
            formatVal={(v) => `${(v / 1000000).toFixed(1)}M`}
          />
          <KpiCard
            title="Pedidos"
            value={slicedPedidos[slicedPedidos.length - 1]}
            prevValue={slicedPedidos[slicedPedidos.length - 2]}
            trend={slicedPedidos}
            suffix="órdenes"
            icon="📦"
            color="#8b5cf6"
          />
          <KpiCard
            title="Ticket Promedio"
            value={slicedTicket[slicedTicket.length - 1]}
            prevValue={slicedTicket[slicedTicket.length - 2]}
            trend={slicedTicket}
            unit="$"
            icon="🧾"
            color="#10b981"
            formatVal={(v) => v.toLocaleString('es-CO')}
          />
          <KpiCard
            title="Clientes Nuevos"
            value={CLIENTES_DATA[CLIENTES_DATA.length - 1]}
            prevValue={CLIENTES_DATA[CLIENTES_DATA.length - 2]}
            trend={CLIENTES_DATA}
            suffix="personas"
            icon="👤"
            color="#f59e0b"
          />
        </div>
      )}

      {/* ── AREA CHART ── */}
      {activeDemo === 'area' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '16px',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ventas Mensuales — últimos {dataRange} meses
            </p>
            <AreaChart
              data={slicedVentas}
              labels={slicedMeses}
              color="#6366f1"
              h={170}
              showAvg={showAvg}
              unit="$"
              formatY={(v) => `${(v / 1_000_000).toFixed(1)}M`}
            />
          </div>

          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '16px',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Pedidos — últimos {dataRange} meses
            </p>
            <AreaChart
              data={slicedPedidos}
              labels={slicedMeses}
              color="#10b981"
              h={130}
              showAvg={showAvg}
              unit=""
            />
          </div>
        </div>
      )}

      {/* ── BAR CHART ── */}
      {activeDemo === 'bar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '16px',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ventas por Categoría
            </p>
            <BarChart
              data={VENTAS_CAT}
              labels={CATEGORIAS}
              colors={COLORES_CAT}
              h={160}
              unit="$"
              rounded
            />
          </div>

          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '16px',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Pedidos mensuales — últimos {dataRange} meses
            </p>
            <BarChart
              data={slicedPedidos}
              labels={slicedMeses}
              h={140}
              rounded
            />
          </div>
        </div>
      )}

      {/* ── SPARKLINES TABLE ── */}
      {activeDemo === 'spark' && (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                {['Métrica', 'Actual', 'Anterior', 'Δ%', 'Tendencia'].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px',
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--color-text-muted)',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Ventas', data: slicedVentas, unit: '$', color: '#6366f1', fmt: (v) => `${(v/1e6).toFixed(1)}M` },
                { label: 'Pedidos', data: slicedPedidos, unit: '', color: '#8b5cf6', fmt: String },
                { label: 'Ticket Promedio', data: slicedTicket, unit: '$', color: '#10b981', fmt: (v) => v.toLocaleString('es-CO') },
                { label: 'Clientes Nuevos', data: CLIENTES_DATA, unit: '', color: '#f59e0b', fmt: String },
              ].map(({ label, data, unit, color, fmt }) => {
                const curr = data[data.length - 1];
                const prev = data[data.length - 2];
                const delta = prev ? ((curr - prev) / prev * 100) : 0;
                const pos = delta >= 0;
                return (
                  <tr key={label} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                      {label}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                      {unit}{fmt(curr)}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {unit}{fmt(prev)}
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, fontFamily: 'monospace',
                        color: pos ? '#22c55e' : '#ef4444',
                        background: pos ? '#22c55e18' : '#ef444418',
                        borderRadius: '20px', padding: '2px 7px',
                      }}>
                        {pos ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Sparkline data={data} w={80} h={24} color={color} area />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SandboxLayout>
  );
}
