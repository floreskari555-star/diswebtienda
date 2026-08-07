/* | Nombre: emailService.js | Finalidad: Envío de correos electrónicos con nodemailer. */

const nodemailer = require("nodemailer");

const CC_ADMIN = "floreskari555@gmail.com";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  [EMAIL] SMTP no configurado");
    console.log("   Faltan: SMTP_HOST, SMTP_USER, SMTP_PASS");
    console.log("   Los correos NO se enviarán (modo simulado)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ [EMAIL] Transporter SMTP configurado");
  console.log("   Host:", host + ":" + port);
  console.log("   User:", user);
  console.log("   CC admin:", CC_ADMIN);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  return transporter;
}

async function enviarComprobante({ para, asunto, html }) {
  const transport = getTransporter();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 [EMAIL] Intentando enviar comprobante...");
  console.log("   Para:", para);
  console.log("   CC:", CC_ADMIN);
  console.log("   Asunto:", asunto);

  if (!transport) {
    console.log("   ⚠️  Modo simulado - SMTP no configurado");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return { enviado: false, motivo: "SMTP no configurado (modo simulado)" };
  }

  const inicio = Date.now();

  try {
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || `"LibrosLibres Librería" <${process.env.SMTP_USER}>`,
      to: para,
      cc: CC_ADMIN,
      subject: asunto,
      html
    });

    const duracion = Date.now() - inicio;

    console.log("   ✅ CORREO ENVIADO EXITOSAMENTE");
    console.log("   MessageId:", info.messageId);
    console.log("   Aceptado:", info.accepted?.join(", "));
    console.log("   Rechazado:", info.rejected?.join(", ") || "ninguno");
    console.log("   Duración:", duracion + "ms");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return { enviado: true, messageId: info.messageId, duracion };
  } catch (err) {
    const duracion = Date.now() - inicio;

    console.log("   ❌ ERROR AL ENVIAR CORREO");
    console.log("   Error:", err.message);
    console.log("   Código:", err.code || "N/A");
    console.log("   Duración:", duracion + "ms");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return { enviado: false, motivo: err.message, duracion };
  }
}

module.exports = { enviarComprobante };
