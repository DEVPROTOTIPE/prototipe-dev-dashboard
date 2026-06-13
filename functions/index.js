const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

/**
 * Cloud Function HTTPS que recibe telemetría de facturación mensual e incidentes de error
 * provenientes de las instancias de los clientes de forma segura.
 * Reemplaza la inicialización directa de Firebase Central del lado del cliente.
 */
exports.reportTelemetry = onRequest({ maxInstances: 10, cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send({ error: "Only POST requests are allowed" });
    return;
  }

  // Extraer token de cabecera Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send({ error: "Unauthorized: Missing Authorization header" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    res.status(401).send({ error: "Unauthorized: Invalid token format" });
    return;
  }

  try {
    // Validar token en Firestore central: /tokens/{token}
    const tokenDoc = await db.collection("tokens").doc(token).get();
    if (!tokenDoc.exists) {
      res.status(401).send({ error: "Unauthorized: Invalid developer token" });
      return;
    }

    const tokenData = tokenDoc.data();
    const clientId = tokenData.clientId;
    if (!clientId) {
      res.status(400).send({ error: "Bad Request: Token has no associated Client ID" });
      return;
    }

    const { type, ...payload } = req.body;
    if (!type) {
      res.status(400).send({ error: "Bad Request: Missing telemetry 'type'" });
      return;
    }

    const now = FieldValue.serverTimestamp();

    if (type === "billing") {
      const { periodo, totalVentas, totalVentasNetas, totalImpuestos, facturasDianCount, costoPorFacturaDian, comisionPorcentaje, comisionValor, billingMode, montoFijoServicio, pagoMensualFijo, orderCount, enableDianBilling } = payload;
      
      if (!periodo) {
        res.status(400).send({ error: "Bad Request: Missing billing period ('periodo')" });
        return;
      }

      // Escribir reporte en /reportesBilling/{clientId}_{periodo}
      const reportId = `${clientId}_${periodo}`;
      const reportRef = db.collection("reportesBilling").doc(reportId);

      await reportRef.set({
        clientId,
        periodo,
        totalVentas: totalVentas ?? 0,
        totalVentasNetas: totalVentasNetas ?? (totalVentas ?? 0),
        totalImpuestos: totalImpuestos ?? 0,
        facturasDianCount: facturasDianCount ?? 0,
        costoPorFacturaDian: costoPorFacturaDian ?? 0,
        comisionPorcentaje: comisionPorcentaje ?? 0,
        comisionValor: comisionValor ?? 0,
        billingMode: billingMode ?? "percentage",
        montoFijoServicio: montoFijoServicio ?? 0,
        pagoMensualFijo: pagoMensualFijo ?? 0,
        orderCount: orderCount ?? 0,
        enableDianBilling: enableDianBilling ?? false,
        token,
        updatedAt: now
      }, { merge: true });

      // Actualizar el estado de facturación del cliente en /clientes_control/{clientId}
      await db.collection("clientes_control").doc(clientId).set({
        billingTelemetry: {
          lastPeriod: periodo,
          lastSales: totalVentas ?? 0,
          lastCommission: comisionValor ?? 0,
          lastUpdate: now
        }
      }, { merge: true });

      console.log(`[Telemetry Central] Reporte de facturación procesado para cliente: ${clientId}, período: ${periodo}`);
      res.status(200).send({ success: true, message: "Billing telemetry saved successfully." });
      return;

    } else if (type === "failure") {
      // Registrar incidente en /app_failures
      const failuresRef = db.collection("app_failures");
      await failuresRef.add({
        ...payload,
        clientId,
        token,
        createdAt: now
      });

      console.log(`[Telemetry Central] Incidente de error registrado para cliente: ${clientId}`);
      res.status(200).send({ success: true, message: "Failure incident registered successfully." });
      return;

    } else if (type === "ping") {
      res.status(200).send({ success: true, message: "Telemetry channel is active and token is valid." });
      return;

    } else {
      res.status(400).send({ error: `Bad Request: Unsupported telemetry type '${type}'` });
      return;
    }

  } catch (error) {
    console.error("[Telemetry Central Error] Error al procesar reporte:", error);
    res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
});
