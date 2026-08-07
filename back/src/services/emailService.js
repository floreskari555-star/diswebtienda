/* | Nombre: emailService.js | Finalidad: Envío de correos electrónicos con nodemailer. */

const nodemailer = require("nodemailer");

const CC_ADMIN = "floreskari555@gmail.com";

let transporter = null;

function crearTransporter(port, secure) {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000
  });
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log("⚠️  [EMAIL] SMTP no configurado - Faltan variables de entorno");
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  transporter = crearTransporter(port, port === 465);

  console.log("✅ [EMAIL] Transporter creado:", host + ":" + port, "| user:", user);
  return transporter;
}

async function enviarComprobante({ para, asunto, html }) {
  const transport = getTransporter();

  console.log("📧 [EMAIL] Iniciando envío a:", para);

  if (!transport) {
    console.log("⚠️  [EMAIL] Sin transporter - modo simulado");
    return { enviado: false, motivo: "SMTP no configurado" };
  }

  const inicio = Date.now();
  const mailOptions = {
    from: process.env.SMTP_FROM || `"LibrosLibres Librería" <${process.env.SMTP_USER}>`,
    to: para,
    cc: CC_ADMIN,
    subject: asunto,
    html
  };

  // Intento 1: puerto configurado
  const puertoActual = parseInt(process.env.SMTP_PORT || "465", 10);
  try {
    console.log("📧 [EMAIL] Intento 1 - puerto " + puertoActual);
    const info = await transport.sendMail(mailOptions);
    const duracion = Date.now() - inicio;
    console.log("✅ [EMAIL] ENVIADO - Id:", info.messageId, "| Duración:", duracion + "ms");
    return { enviado: true, messageId: info.messageId, duracion };
  } catch (err) {
    console.log("❌ [EMAIL] Intento 1 falló:", err.message, "| Código:", err.code || "N/A");
  }

  // Intento 2: puerto alternativo
  const puertoAlt = puertoActual === 465 ? 587 : 465;
  const secureAlt = puertoAlt === 465;
  try {
    console.log("📧 [EMAIL] Intento 2 - puerto " + puertoAlt);
    const altTransport = crearTransporter(puertoAlt, secureAlt);
    const info2 = await altTransport.sendMail(mailOptions);
    const duracion2 = Date.now() - inicio;
    console.log("✅ [EMAIL] ENVIADO (retry) - Id:", info2.messageId, "| Duración:", duracion2 + "ms");
    return { enviado: true, messageId: info2.messageId, duracion: duracion2 };
  } catch (err2) {
    const duracionTotal = Date.now() - inicio;
    console.log("❌ [EMAIL] Intento 2 falló:", err2.message, "| Código:", err2.code || "N/A");
    console.log("❌ [EMAIL] FALLO TOTAL tras " + duracionTotal + "ms");
    return { enviado: false, motivo: err2.message, duracion: duracionTotal };
  }
}

// Verificar conexión SMTP (llamar al inicio para diagnosticar)
async function verificarConexion() {
  const transport = getTransporter();
  if (!transport) {
    console.log("⚠️  [EMAIL] No hay transporter para verificar");
    return false;
  }
  try {
    await transport.verify();
    console.log("✅ [EMAIL] Conexión SMTP verificada OK");
    return true;
  } catch (err) {
    console.log("❌ [EMAIL] Error de conexión SMTP:", err.message, "| Código:", err.code || "N/A");
    return false;
  }
}

module.exports = { enviarComprobante, verificarConexion };
