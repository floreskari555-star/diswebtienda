/* | Nombre: emailService.js | Finalidad: Envío de correos electrónicos con nodemailer. */

const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log("⚠️ [EMAIL] SMTP no configurado (faltan SMTP_HOST, SMTP_USER, SMTP_PASS). Los correos NO se enviarán.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  console.log("✅ [EMAIL] Transporter SMTP configurado:", host + ":" + port);
  return transporter;
}

async function enviarComprobante({ para, asunto, html }) {
  const transport = getTransporter();
  if (!transport) {
    console.log("📧 [EMAIL] (simulado) Correo a:", para, "| Asunto:", asunto);
    return { enviado: false, motivo: "SMTP no configurado" };
  }

  try {
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || `"LibrosLibres Librería" <${process.env.SMTP_USER}>`,
      to: para,
      subject: asunto,
      html
    });
    console.log("✅ [EMAIL] Enviado:", info.messageId);
    return { enviado: true, messageId: info.messageId };
  } catch (err) {
    console.log("❌ [EMAIL] Error al enviar:", err.message);
    return { enviado: false, motivo: err.message };
  }
}

module.exports = { enviarComprobante };
