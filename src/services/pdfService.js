import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Genera y descarga un PDF con el recibo comisional del desarrollador
 * @param {Object} report - El reporte de facturación comisional
 */
export function exportCommissionReceiptPDF(report) {
  const doc = new jsPDF()
  
  // Colores del tema (Indigo/Slate de dev-dashboard - Curated & Harmonious)
  const primaryColor = [79, 70, 229] // Indigo-600 (#4f46e5)
  const secondaryColor = [99, 102, 241] // Indigo-500 (#6366f1)
  const darkColor = [15, 23, 42]      // Slate-900 (#0f172a)
  const textMuted = [100, 116, 139]   // Slate-500 (#64748b)
  const borderLight = [226, 232, 240] // Slate-200 (#e2e8f0)
  const lightBg = [248, 250, 252]     // Slate-50 / Cool Gray
  
  // Margen de 20mm
  const marginX = 20
  
  // Cabecera Elegante (Estilo Factura Apple/Stripe - Fondo blanco con acento superior de color)
  // Línea decorativa superior
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 4, 'F')
  
  // Identidad de marca (Marca de agua superior izquierda)
  doc.setTextColor(...textMuted)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('PROTOTIPE ECOSISTEMA CENTRAL • TELEMETRÍA & GESTIÓN', marginX, 15)
  
  // Título Principal
  doc.setTextColor(...darkColor)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE COMISIÓN DE INSTANCIA', marginX, 24)
  
  // Subtítulo
  doc.setTextColor(...textMuted)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Licenciamiento administrativo de software y uso de marca blanca', marginX, 29)
  
  // Estado de Pago (Posicionado a la derecha de forma limpia para evitar superposiciones)
  const isPaid = (report.estadoPago || 'pendiente').toLowerCase() === 'pagado'
  
  // Dibujar contenedor de Estado de Pago (Badge con esquinas suavizadas o estilo flat sutil)
  // Caja de fondo
  if (isPaid) {
    doc.setFillColor(209, 250, 229) // Emerald-100 (#d1fae5)
    doc.roundedRect(140, 18, 50, 12, 1.5, 1.5, 'F')
    doc.setTextColor(6, 95, 70) // Emerald-800 (#065f46)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('PAGADO / LIBERADO', 144, 25)
  } else {
    doc.setFillColor(254, 243, 199) // Amber-100 (#fef3c7)
    doc.roundedRect(140, 18, 50, 12, 1.5, 1.5, 'F')
    doc.setTextColor(146, 64, 14) // Amber-800 (#92400e)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('COBRO PENDIENTE', 146, 25)
  }
  
  // Línea divisoria elegante
  doc.setDrawColor(...borderLight)
  doc.setLineWidth(0.5)
  doc.line(marginX, 38, 190, 38)
  
  // Detalles de Transmisión e Identificador
  doc.setTextColor(...textMuted)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Identificador de Factura: ${report.id}`, marginX, 44)
  
  const emisionDate = new Date().toLocaleString('es-CO')
  doc.text(`Fecha de Emisión: ${emisionDate}`, marginX, 49)
  
  // Sección: INFORMACIÓN DE TRANSACCIÓN
  doc.setTextColor(...darkColor)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN DE TRANSACCIÓN', marginX, 64)
  
  // Campos en formato grid de metadatos (limpio y minimalista)
  doc.setFontSize(8.5)
  doc.setTextColor(...textMuted)
  doc.setFont('helvetica', 'normal')
  doc.text('Desarrollador Core:', marginX, 72)
  doc.text('Cliente Asociado:', marginX, 78)
  doc.text('Periodo Contable:', marginX, 84)
  
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Soporte Técnico Central / Ecosistema Owner', marginX + 32, 72)
  doc.text(report.clientId, marginX + 32, 78)
  doc.text(report.periodo, marginX + 32, 84)
  
  // Tarjetas de Resumen Financiero (Rediseñadas con bordes finos, fondo y tipografía premium)
  const cardWidth = 82
  const cardHeight = 24
  const cardY = 92
  
  // Tarjeta 1: Ventas
  doc.setFillColor(...lightBg)
  doc.roundedRect(marginX, cardY, cardWidth, cardHeight, 1.5, 1.5, 'F')
  doc.setDrawColor(...borderLight)
  doc.roundedRect(marginX, cardY, cardWidth, cardHeight, 1.5, 1.5, 'S')
  
  doc.setFontSize(7.5)
  doc.setTextColor(...textMuted)
  doc.setFont('helvetica', 'bold')
  doc.text('VENTAS DECLARADAS DEL PERIODO', marginX + 5, cardY + 7)
  
  doc.setFontSize(13)
  doc.setTextColor(...darkColor)
  doc.text(`$${report.totalVentas.toLocaleString('es-CO')}`, marginX + 5, cardY + 17)
  
  // Tarjeta 2: Comisión
  doc.setFillColor(...lightBg)
  doc.roundedRect(108, cardY, cardWidth, cardHeight, 1.5, 1.5, 'F')
  doc.roundedRect(108, cardY, cardWidth, cardHeight, 1.5, 1.5, 'S')
  
  doc.setFontSize(7.5)
  doc.setTextColor(...textMuted)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL COMISIÓN POR RECAUDAR', 113, cardY + 7)
  
  doc.setFontSize(13)
  doc.setTextColor(...primaryColor)
  doc.text(`$${report.comisionValor.toLocaleString('es-CO')}`, 113, cardY + 17)
  
  // Sección: Desglose de Concepto
  doc.setTextColor(...darkColor)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Desglose de Concepto', marginX, 130)
  
  const headers = [['Concepto', 'Base Imponible', 'Tasa (%)', 'Subtotal']]
  const tableData = [
    [
      `Comisión de Servicio por Licenciamiento de Instancia - Cliente: ${report.clientId}`,
      `$${report.totalVentas.toLocaleString('es-CO')}`,
      `${report.comisionPorcentaje || 1.5}%`,
      `$${report.comisionValor.toLocaleString('es-CO')}`
    ]
  ]
  
  autoTable(doc, {
    startY: 136,
    head: headers,
    body: tableData,
    theme: 'plain', // minimalista y elegante sin fondo de rayas tosco
    headStyles: { 
      fillColor: primaryColor, 
      textColor: [255, 255, 255], 
      halign: 'left',
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: { 
      fontSize: 8.5, 
      cellPadding: 5,
      lineColor: borderLight,
      lineWidth: 0.5,
      textColor: darkColor
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: 'right' },
      2: { halign: 'center' },
      3: { halign: 'right', fontStyle: 'bold' }
    }
  })
  
  // Footer / Firma Digital de Certificación
  const finalY = (doc.lastAutoTable?.finalY ?? 175) + 20
  
  doc.setDrawColor(...borderLight)
  doc.setLineWidth(0.5)
  doc.line(marginX, finalY + 12, marginX + 75, finalY + 12)
  
  doc.setFontSize(8)
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Soporte Técnico Desarrollador', marginX, finalY + 17)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textMuted)
  doc.text('Central Core Telemetry Services LLC', marginX, finalY + 21)
  
  // Sello o texto decorativo al pie de la página
  doc.setFontSize(7)
  doc.setTextColor(...textMuted)
  doc.setFont('helvetica', 'italic')
  doc.text('Este documento sirve como comprobante administrativo oficial de liquidación de comisiones de Prototype Ecosistema.', marginX, 282)
  
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

/**
 * Genera y descarga un PDF con la propuesta comercial del Cotizador — CORE-133
 * @param {Object} params
 * @param {string} params.clienteName
 * @param {string} params.resumen
 * @param {number} params.setupVal
 * @param {number} params.mensualidadVal
 * @param {number} params.comisionVal
 * @param {string[]} params.modulos
 */
export function exportProposalPDF({ clienteName, resumen, setupVal, mensualidadVal, comisionVal, modulos }) {
  const doc = new jsPDF();
  const primaryColor = [79, 70, 229];   // Indigo-600
  const darkColor    = [15, 23, 42];    // Slate-900
  const textMuted    = [100, 116, 139]; // Slate-500
  const borderLight  = [226, 232, 240]; // Slate-200
  const lightBg      = [248, 250, 252]; // Slate-50
  const marginX = 20;
  const pageW   = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageW, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PROTOTIPE', marginX, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Propuesta Comercial — Ecosistema App Ventas', marginX, 25);
  doc.text(`Generada: ${new Date().toLocaleDateString('es-CO')}`, marginX, 32);

  // Prospecto
  doc.setTextColor(...darkColor);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Prospecto: ${clienteName || 'Sin nombre'}`, marginX, 52);

  // Resumen ejecutivo
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  const resumenLines = doc.splitTextToSize(resumen || 'Sin descripción.', pageW - marginX * 2);
  doc.text(resumenLines, marginX, 62);

  let y = 62 + resumenLines.length * 5 + 8;

  // Tabla de inversión
  autoTable(doc, {
    startY: y,
    head: [['Concepto', 'Valor']],
    body: [
      ['Setup / Implementación (único)',  `$${(setupVal      || 0).toLocaleString('es-CO')}`],
      ['Mensualidad SaaS',               `$${(mensualidadVal|| 0).toLocaleString('es-CO')} / mes`],
      ['Comisión sobre ventas brutas',    `${comisionVal || 0}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: darkColor },
    alternateRowStyles: { fillColor: lightBg },
    tableLineColor: borderLight,
    margin: { left: marginX, right: marginX },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Módulos evaluados
  if (modulos && modulos.length) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Módulos de Complejidad Evaluados:', marginX, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    modulos.forEach(m => {
      doc.text(`• ${m}`, marginX + 3, y);
      y += 5;
    });
  }

  // Footer
  doc.setDrawColor(...borderLight);
  doc.line(marginX, 282, pageW - marginX, 282);
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text('PROTOTIPE — Documento confidencial generado automáticamente por el Cotizador.', marginX, 287);

  doc.save(`Propuesta_${clienteName || 'Prospecto'}.pdf`);
}
