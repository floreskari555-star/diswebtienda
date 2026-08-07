/* | Nombre: comprobanteTemplate.js | Finalidad: Genera HTML del correo de comprobante. */

function comprobanteHTML({ tipo, numero, fecha, cliente, items, subtotal, igv, total }) {
  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido_paterno || ""} ${cliente.apellido_materno || ""}`.trim();
  const colorTipo = tipo === "FACTURA" ? "#0d6efd" : "#0dcaf0";

  const itemsRows = items.map((d, i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;color:#555;">${i + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${d.descripcion || ""}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;color:#555;">${d.cantidad}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;color:#555;">S/ ${parseFloat(d.precio_unitario).toFixed(2)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#333;">S/ ${parseFloat(d.total_item).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0F172A;padding:24px 30px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:20px;">📚 LibrosLibres Librería</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Tu comprobante de compra</p>
    </div>

    <!-- Badge comprobante -->
    <div style="text-align:center;padding:20px 30px 0;">
      <span style="display:inline-block;background:${colorTipo};color:#fff;padding:6px 20px;border-radius:20px;font-size:13px;font-weight:600;letter-spacing:0.5px;">
        ${tipo} N° ${numero}
      </span>
    </div>

    <!-- Fecha -->
    <div style="text-align:center;padding:8px 30px 0;">
      <span style="color:#888;font-size:13px;">Fecha de emisión: ${fecha}</span>
    </div>

    <!-- Cliente -->
    <div style="padding:20px 30px 0;">
      <table style="width:100%;font-size:13px;color:#555;">
        <tr><td style="padding:3px 0;font-weight:600;color:#333;">Cliente:</td><td style="padding:3px 0;">${nombreCliente}</td></tr>
        <tr><td style="padding:3px 0;font-weight:600;color:#333;">${cliente.tipo_documento || "Documento"}:</td><td style="padding:3px 0;">${cliente.numero_documento || "---"}</td></tr>
        <tr><td style="padding:3px 0;font-weight:600;color:#333;">Dirección:</td><td style="padding:3px 0;">${cliente.direccion || "---"}</td></tr>
      </table>
    </div>

    <!-- Detalle -->
    <div style="padding:20px 30px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="padding:10px 8px;text-align:center;color:#555;border-bottom:2px solid #dee2e6;">#</th>
            <th style="padding:10px 8px;text-align:left;color:#555;border-bottom:2px solid #dee2e6;">Descripción</th>
            <th style="padding:10px 8px;text-align:center;color:#555;border-bottom:2px solid #dee2e6;">Cant.</th>
            <th style="padding:10px 8px;text-align:right;color:#555;border-bottom:2px solid #dee2e6;">P. Unit.</th>
            <th style="padding:10px 8px;text-align:right;color:#555;border-bottom:2px solid #dee2e6;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <!-- Totales -->
    <div style="padding:0 30px 24px;">
      <table style="width:100%;font-size:13px;">
        <tr>
          <td style="padding:6px 0;color:#888;">Subtotal:</td>
          <td style="padding:6px 0;text-align:right;color:#555;">S/ ${parseFloat(subtotal).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#888;">IGV (18%):</td>
          <td style="padding:6px 0;text-align:right;color:#555;">S/ ${parseFloat(igv).toFixed(2)}</td>
        </tr>
        <tr style="border-top:2px solid #0F172A;">
          <td style="padding:10px 0;font-size:16px;font-weight:700;color:#0F172A;">TOTAL:</td>
          <td style="padding:10px 0;text-align:right;font-size:16px;font-weight:700;color:#0F172A;">S/ ${parseFloat(total).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="background:#f8f9fa;padding:16px 30px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#888;">Este comprobante fue enviado automáticamente por LibrosLibres Librería.</p>
      <p style="margin:4px 0 0;font-size:12px;color:#aaa;">www.libroslibres.com</p>
    </div>

  </div>
</body>
</html>`;
}

module.exports = { comprobanteHTML };
