/**
 * Servicio de Exportación de Datos en caliente (CSV y Excel XML)
 */

/**
 * Exporta una matriz de datos a formato CSV y gatilla la descarga.
 * @param {string} filename - Nombre del archivo de salida.
 * @param {Array<string>} headers - Nombres de las columnas.
 * @param {Array<Array<any>>} rows - Filas de datos.
 */
export function exportToCSV(filename, headers, rows) {
  const content = [
    headers.join(','),
    ...rows.map(row => row.map(val => {
      const str = String(val === null || val === undefined ? '' : val);
      // Escapar comillas y comas para un CSV estándar
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(','))
  ].join('\n');

  // Agregar BOM UTF-8 para compatibilidad de acentos en Excel
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporta a formato Excel compatible (.xlsx) de manera nativa utilizando XML Spreadsheet 2003.
 * Evita dependencias pesadas en el bundle final.
 * @param {string} filename - Nombre del archivo de salida.
 * @param {Array<string>} headers - Cabeceras de las columnas.
 * @param {Array<Array<any>>} rows - Filas de datos.
 */
export function exportToXLSX(filename, headers, rows) {
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#6366F1" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="$#,##0"/>
  </Style>
  <Style ss:ID="Number">
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Reporte CRM">
  <Table>`;

  // Encabezado
  xml += '\n   <Row ss:Height="22">';
  headers.forEach(h => {
    xml += `\n    <Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>`;
  });
  xml += '\n   </Row>';

  // Filas de Datos
  rows.forEach(row => {
    xml += '\n   <Row ss:Height="18">';
    row.forEach(val => {
      let type = 'String';
      let styleAttr = '';
      let cleanVal = '';

      if (val === null || val === undefined) {
        cleanVal = '';
      } else if (typeof val === 'number') {
        type = 'Number';
        cleanVal = String(val);
        // Si parece moneda (ej. setups, mensualidades, montos grandes), aplicar formato Currency
        if (val > 100) {
          styleAttr = ' ss:StyleID="Currency"';
        }
      } else if (typeof val === 'boolean') {
        type = 'Boolean';
        cleanVal = val ? '1' : '0';
      } else {
        // Escapar XML especial
        cleanVal = String(val)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      }

      xml += `\n    <Cell${styleAttr}><Data ss:Type="${type}">${cleanVal}</Data></Cell>`;
    });
    xml += '\n   </Row>';
  });

  xml += `\n  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
