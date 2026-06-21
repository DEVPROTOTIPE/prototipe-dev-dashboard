import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Genera y descarga un PDF con el recibo comisional del desarrollador
 * @param {Object} report - El reporte de facturación comisional
 */
export function exportCommissionReceiptPDF(report) {
  const doc = new jsPDF()
  
  // Colores del tema (Indigo/Slate de dev-dashboard)
  const primaryColor = [99, 102, 241] // #6366f1
  const darkColor = [7, 11, 19]      // #070b13
  const lightBg = [243, 244, 246]
  
  // Encabezado
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE COMISIÓN DE INSTANCIA', 15, 20)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Identificador de Factura: ${report.id}`, 15, 28)
  doc.text(`Fecha de Emisión: ${new Date().toLocaleString('es-CO')}`, 15, 33)
  doc.text('ESTADO DE PAGO:', 140, 20)
  
  // Badge de Estado de Pago
  const isPaid = report.estadoPago === 'pagado'
  if (isPaid) {
    doc.setFillColor(16, 185, 129) // Emerald-500
    doc.rect(140, 23, 55, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('PAGADO / LIBERADO', 145, 29)
  } else {
    doc.setFillColor(245, 158, 11) // Amber-500
    doc.rect(140, 23, 55, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('COBRO PENDIENTE', 147, 29)
  }

  // Detalles de las partes
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN DE TRANSACCIÓN', 15, 60)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Desarrollador Core: Soporte Técnico Central / Ecosistema Owner`, 15, 68)
  doc.text(`Cliente Asociado: ${report.clientId}`, 15, 74)
  doc.text(`Periodo Contable: ${report.periodo}`, 15, 80)
  
  // Cajas de resumen financiero
  doc.setFillColor(...lightBg)
  doc.rect(15, 90, 85, 25, 'F')
  doc.rect(110, 90, 85, 25, 'F')
  
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('VENTAS DECLARADAS DEL PERIODO', 20, 96)
  doc.text('TOTAL COMISIÓN POR RECAUDAR', 115, 96)
  
  doc.setFontSize(14)
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.text(`$${report.totalVentas.toLocaleString('es-CO')}`, 20, 108)
  
  doc.setTextColor(...primaryColor)
  doc.text(`$${report.comisionValor.toLocaleString('es-CO')}`, 115, 108)
  
  // Tabla de desglose de conceptos
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Desglose de Concepto', 15, 130)
  
  const headers = [['Concepto', 'Base Imponible', 'Tasa (%)', 'Subtotal']]
  const data = [
    [
      `Comisión de Servicio por Licenciamiento de Instancia - Cliente: ${report.clientId}`,
      `$${report.totalVentas.toLocaleString('es-CO')}`,
      `${report.comisionPorcentaje}%`,
      `$${report.comisionValor.toLocaleString('es-CO')}`
    ]
  ]
  
  autoTable(doc, {
    startY: 136,
    head: headers,
    body: data,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, halign: 'left' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'center' },
      3: { halign: 'right' }
    }
  })
  
  // Footer / Firma Digital de Certificación
  const finalY = (doc.lastAutoTable?.finalY ?? 180) + 20
  doc.setDrawColor(209, 213, 219)
  doc.line(15, finalY + 15, 90, finalY + 15)
  
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Firma Autorizada Desarrollador', 15, finalY + 20)
  doc.text('Core Telemetry Service', 15, finalY + 24)
  
  // Sello o texto decorativo
  doc.setFontSize(7)
  doc.text('Este documento digital sirve como soporte administrativo oficial de la Consola Central de Control.', 15, 280)
  
  doc.save(`Recibo_Comision_${report.clientId}_${report.periodo}.pdf`)
}

/**
 * Genera y descarga un PDF con la conciliación consolidada de comisiones de un periodo
 */
export function exportConsolidatedReconciliationPDF(period, clients, reports) {
  const doc = new jsPDF()
  const primaryColor = [99, 102, 241] // Indigo
  const darkColor = [7, 11, 19]

  // Filtrar reportes por periodo
  const periodReports = reports.filter(r => r.periodo === period)

  // Agregar datos por cliente
  const clientAgg = clients.reduce((acc, client) => {
    const cId = client.id;
    acc[cId] = {
      name: cId,
      niche: client.niche || 'N/A',
      billingMode: client.billingMode || 'percentage',
      comisionPorcentaje: client.comisionPorcentaje !== undefined ? client.comisionPorcentaje : 1.5,
      pagoMensualFijo: client.pagoMensualFijo || 0,
      montoFijoServicio: client.montoFijoServicio || 0,
      sales: 0,
      commission: 0,
      paid: 0,
      pending: 0
    };
    return acc;
  }, {});

  periodReports.forEach(r => {
    if (clientAgg[r.clientId]) {
      clientAgg[r.clientId].sales += (r.totalVentas || 0);
      clientAgg[r.clientId].commission += (r.comisionValor || 0);
      if ((r.estadoPago || 'pendiente').toLowerCase() === 'pagado') {
        clientAgg[r.clientId].paid += (r.comisionValor || 0);
      } else {
        clientAgg[r.clientId].pending += (r.comisionValor || 0);
      }
    }
  });

  // Calcular totales consolidados
  const totalSales = Object.values(clientAgg).reduce((sum, c) => sum + c.sales, 0);
  const totalCommission = Object.values(clientAgg).reduce((sum, c) => sum + c.commission, 0);
  const totalPaid = Object.values(clientAgg).reduce((sum, c) => sum + c.paid, 0);
  const totalPending = Object.values(clientAgg).reduce((sum, c) => sum + c.pending, 0);

  // Encabezado
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CONCILIACIÓN CONSOLIDADA DE COMISIONES', 15, 20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Periodo Contable: ${period}`, 15, 28)
  doc.text(`Fecha de Emisión: ${new Date().toLocaleString('es-CO')}`, 15, 33)

  // Resumen financiero consolidado
  doc.setFillColor(243, 244, 246)
  doc.rect(15, 52, 180, 24, 'F')
  doc.setTextColor(55, 65, 81)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN GENERAL DEL PERIODO', 20, 58)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('VENTAS TOTALES', 20, 64)
  doc.text('COMISIONES BRUTAS', 65, 64)
  doc.text('TOTAL RECAUDADO', 110, 64)
  doc.text('BALANCE PENDIENTE', 155, 64)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  doc.text(`$${totalSales.toLocaleString('es-CO')}`, 20, 71)
  doc.setTextColor(...primaryColor)
  doc.text(`$${totalCommission.toLocaleString('es-CO')}`, 65, 71)
  doc.setTextColor(16, 185, 129) // green
  doc.text(`$${totalPaid.toLocaleString('es-CO')}`, 110, 71)
  doc.setTextColor(245, 158, 11) // amber
  doc.text(`$${totalPending.toLocaleString('es-CO')}`, 155, 71)

  // Tabla
  const headers = [['Cliente', 'Nicho', 'Esquema Cobro', 'Ventas', 'Comisión', 'Cobrado', 'Pendiente']]
  const tableData = Object.values(clientAgg).map(c => {
    const billingText = c.billingMode === 'percentage' 
      ? `${c.comisionPorcentaje}%` 
      : c.billingMode === 'fixed_per_service' 
        ? `$${c.montoFijoServicio.toLocaleString()} /Serv` 
        : `$${c.pagoMensualFijo.toLocaleString()} /Mes`;
    return [
      c.name,
      c.niche,
      billingText,
      `$${c.sales.toLocaleString('es-CO')}`,
      `$${c.commission.toLocaleString('es-CO')}`,
      `$${c.paid.toLocaleString('es-CO')}`,
      `$${c.pending.toLocaleString('es-CO')}`
    ];
  });

  autoTable(doc, {
    startY: 84,
    head: headers,
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, halign: 'left' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });

  const finalY = (doc.lastAutoTable?.finalY ?? 150) + 15;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Este reporte consolida en tiempo real la facturación registrada por telemetría.', 15, finalY);

  doc.save(`Conciliacion_Consolidada_${period}.pdf`);
}

/**
 * Genera y descarga un PDF con el directorio de clientes
 */
export function exportClientsDirectoryPDF(clients) {
  const doc = new jsPDF()
  const primaryColor = [99, 102, 241] // Indigo

  // Encabezado
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DIRECTORIO GENERAL DE CLIENTES SAAS', 15, 20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Clientes Activos: ${clients.length}`, 15, 28)
  doc.text(`Fecha de Exportación: ${new Date().toLocaleString('es-CO')}`, 15, 33)

  // Tabla
  const headers = [['ID Cliente', 'Nicho', 'Esquema Facturación', 'Detalle Esquema', 'DIAN']]
  const tableData = clients.map(c => {
    const detailText = c.billingMode === 'percentage' 
      ? `${c.comisionPorcentaje}% de Ventas` 
      : c.billingMode === 'fixed_per_service' 
        ? `$${(c.montoFijoServicio || 0).toLocaleString()} por Servicio` 
        : `$${(c.pagoMensualFijo || 0).toLocaleString()} Pago Mensual`;
    return [
      c.id || c.name,
      c.niche || 'N/A',
      c.billingMode || 'percentage',
      detailText,
      c.enableDianBilling ? 'Habilitado' : 'Inactivo'
    ];
  });

  autoTable(doc, {
    startY: 55,
    head: headers,
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, halign: 'left' },
    styles: { fontSize: 8, cellPadding: 4 }
  });

  doc.save('Directorio_Clientes_Saas.pdf');
}

/**
 * Genera y descarga un PDF con el reporte de rendimiento y métricas del sistema
 */
export function exportGeneralMetricsPDF(metrics, chartData, projections) {
  const doc = new jsPDF()
  const primaryColor = [99, 102, 241] // Indigo
  const darkColor = [7, 11, 19]

  // Encabezado
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE GENERAL DE RENDIMIENTO Y MÉTRICAS', 15, 20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha de Emisión: ${new Date().toLocaleString('es-CO')}`, 15, 28)

  // Métricas agregadas
  doc.setFillColor(243, 244, 246)
  doc.rect(15, 52, 180, 22, 'F')
  doc.setTextColor(107, 114, 128)
  doc.setFontSize(7)
  doc.text('COMISIÓN ACUMULADA', 20, 58)
  doc.text('TOTAL COBRADO', 65, 58)
  doc.text('POR RECAUDAR', 110, 58)
  doc.text('CLIENTES ACTIVOS', 155, 58)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  doc.text(`$${metrics.totalComision.toLocaleString('es-CO')}`, 20, 66)
  doc.setTextColor(16, 185, 129)
  doc.text(`$${metrics.totalCobrado.toLocaleString('es-CO')}`, 65, 66)
  doc.setTextColor(245, 158, 11)
  doc.text(`$${metrics.totalPendiente.toLocaleString('es-CO')}`, 110, 66)
  doc.setTextColor(99, 102, 241)
  doc.text(`${metrics.clientesActivos}`, 155, 66)

  // Top Clientes
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Top Clientes por Comisión Acumulada', 15, 84)

  const chartHeaders = [['Cliente', 'Ventas Totales', 'Comisión Acumulada', 'Reportes']]
  const chartTableData = chartData.map(c => [
    c.name,
    `$${c.totalSales.toLocaleString('es-CO')}`,
    `$${c.totalCommission.toLocaleString('es-CO')}`,
    `${c.reportCount}`
  ]);

  autoTable(doc, {
    startY: 89,
    head: chartHeaders,
    body: chartTableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'center' }
    }
  });

  // Proyecciones de Crecimiento
  let nextY = (doc.lastAutoTable?.finalY ?? 130) + 12
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Simulación de Proyecciones de Crecimiento', 15, nextY)

  const projHeaders = [['Parámetro', 'Valor Simulación']]
  const projTableData = [
    ['Nuevas Tiendas a Añadir', `${projections.projNewClients}`],
    ['Ventas Promedio por Tienda', `$${projections.projAvgSales.toLocaleString('es-CO')}`],
    ['Tasa Nuevas Tiendas (%)', `${projections.projRate}%`],
    ['Horizonte de Proyección', `${projections.projMonths} Meses`],
    ['Ingresos Actuales Mensuales (SaaS)', `$${projections.projExistingMonthly.toLocaleString('es-CO')}`],
    ['Proyección Total Mensual', `$${projections.projTotalMonthly.toLocaleString('es-CO')}`],
    ['Proyección Acumulada Total', `$${projections.projTotalYear.toLocaleString('es-CO')}`]
  ]

  autoTable(doc, {
    startY: nextY + 4,
    head: projHeaders,
    body: projTableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  doc.save('Reporte_General_Metricas.pdf');
}

/**
 * Genera y descarga un PDF con el rendimiento detallado e historial de un cliente
 */
export function exportClientDetailPDF(clientName, clientConfig, clientReports, clientFailures) {
  const doc = new jsPDF()
  const primaryColor = [99, 102, 241] // Indigo
  const darkColor = [7, 11, 19]

  // Encabezado
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`REPORTE DE RENDIMIENTO: ${clientName.toUpperCase()}`, 15, 20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nicho: ${clientConfig.niche || 'N/A'} | Esquema: ${clientConfig.billingMode || 'percentage'}`, 15, 28)
  doc.text(`Fecha de Emisión: ${new Date().toLocaleString('es-CO')}`, 15, 33)

  // Configuración de Facturación
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Configuración de Facturación', 15, 55)

  const configHeaders = [['Propiedad', 'Valor Configurado']]
  const billingDetail = clientConfig.billingMode === 'percentage' 
    ? `${clientConfig.comisionPorcentaje}% de Ventas` 
    : clientConfig.billingMode === 'fixed_per_service' 
      ? `$${(clientConfig.montoFijoServicio || 0).toLocaleString()} por Servicio` 
      : `$${(clientConfig.pagoMensualFijo || 0).toLocaleString()} Mensual Fijo`;

  const configTableData = [
    ['Modo de Facturación', clientConfig.billingMode || 'percentage'],
    ['Tarifa de Comisión', billingDetail],
    ['Facturación DIAN Electrónica', clientConfig.enableDianBilling ? 'Habilitado' : 'Desactivado'],
    ['Costo Factura DIAN', `$${clientConfig.costoPorFacturaDian || 0}`],
    ['Token Telemetría Vinculado', clientConfig.telemetryToken || 'Por defecto']
  ]

  autoTable(doc, {
    startY: 60,
    head: configHeaders,
    body: configTableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  // Historial de Facturación
  let nextY = (doc.lastAutoTable?.finalY ?? 100) + 10
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Historial de Ventas y Comisiones', 15, nextY)

  const reportsHeaders = [['Periodo', 'Ventas Declaradas', 'Comisión Generada', 'Estado Pago']]
  const reportsTableData = clientReports.map(r => [
    r.periodo,
    `$${(r.totalVentas || 0).toLocaleString('es-CO')}`,
    `$${(r.comisionValor || 0).toLocaleString('es-CO')}`,
    (r.estadoPago || 'pendiente').toUpperCase()
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: reportsHeaders,
    body: reportsTableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' }
    }
  });

  // Historial de Incidentes
  nextY = (doc.lastAutoTable?.finalY ?? 150) + 10
  if (nextY > 230) {
    doc.addPage()
    nextY = 20
  }
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Incidentes de Telemetría Activos/Recientes', 15, nextY)

  const failuresHeaders = [['Fecha', 'Mensaje de Error', 'Severidad', 'Estado']]
  const failuresTableData = clientFailures.slice(0, 10).map(f => [
    f.timestamp || 'N/A',
    f.errorMsg || 'Error genérico',
    f.severity || 'error',
    f.resolved ? 'RESUELTO' : 'ACTIVO'
  ]);

  if (failuresTableData.length === 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(107, 114, 128)
    doc.text('No se registran fallos o incidentes de telemetría para esta instancia.', 15, nextY + 6)
  } else {
    autoTable(doc, {
      startY: nextY + 4,
      head: failuresHeaders,
      body: failuresTableData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 7, cellPadding: 2 }
    });
  }

  doc.save(`Reporte_Detalle_${clientName}.pdf`);
}
