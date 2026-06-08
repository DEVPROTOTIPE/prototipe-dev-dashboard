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
  
  const tableResult = autoTable(doc, {
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
