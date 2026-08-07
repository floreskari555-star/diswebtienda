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
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
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

  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  transporter = crearTransporter(port, port === 465);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ [EMAIL] Transporter SMTP configurado");
  console.log("   Host:", host + ":" + port);
  console.log("   User:", user);
  console.log("   CC admin:", CC_ADMIN);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  return transporter;
}

async function enviarMail(transport, mailOptions) {
  return transport.sendMail(mailOptions);
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
  const mailOptions = {
    from: process.env.SMTP_FROM || `"LibrosLibres Librería" <${process.env.SMTP_USER}>`,
    to: para,
    cc: CC_ADMIN,
    subject: asunto,
    html
  };

  try {
    const info = await enviarMail(transport, mailOptions);
    const duracion = Date.now() - inicio;

    console.log("   ✅ CORREO ENVIADO EXITOSAMENTE");
    console.log("   MessageId:", info.messageId);
    console.log("   Aceptado:", info.accepted?.join(", "));
    console.log("   Rechazado:", info.rejected?.join(", ") || "ninguno");
    console.log("   Duración:", duracion + "ms");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return { enviado: true, messageId: info.messageId, duracion };
  } catch (err) {
    console.log("   ❌ ERROR AL ENVIAR CORREO (puerto " + (process.env.SMTP_PORT || "465") + ")");
    console.log("   Error:", err.message);
    console.log("   Código:", err.code || "N/A");

    // Retry con puerto alternativo
    const puertoActual = parseInt(process.env.SMTP_PORT || "465", 10);
    const puertoAlt = puertoActual === 465 ? 587 : 465;
    const secureAlt = puertoAlt === 465;

    console.log("   🔄 Reintentando con puerto " + puertoAlt + (secureAlt ? " (SSL)" : " (STARTTLS)") + "...");
    try {
      const altTransport = crearTransporter(puertoAlt, secureAlt);
      const info2 = await enviarMail(altTransport, mailOptions);
      const duracion2 = Date.now() - inicio;

      console.log("   ✅ CORREO ENVIADO (retry puerto " + puertoAlt + ")");
      console.log("   MessageId:", info2.messageId);
      console.log("   Duración:", duracion2 + "ms");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return { enviado: true, messageId: info2.messageId, duracion: duracion2 };
    } catch (err2) {
      const duracionTotal = Date.now() - inicio;
      console.log("   ❌ REINTENTO FALLÓ (puerto " + puertoAlt + ")");
      console.log("   Error:", err2.message);
      console.log("   Código:", err2.code || "N/A");
      console.log("   Duración total:", duracionTotal + "ms");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return { enviado: false, motivo: err.message + " (reintento: " + err2.message + ")", duracion: duracionTotal };
    }
  }
}

module.exports = { enviarComprobante };
