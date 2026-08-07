/* | Nombre: emailService.js | Finalidad: Envío de correos electrónicos vía API HTTP (Resend). */

const CC_ADMIN = "floreskari555@gmail.com";

async function enviarComprobante({ para, asunto, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.SMTP_FROM || "LibrosLibres Librería <onboarding@resend.dev>";

  console.log("📧 [EMAIL] Iniciando envío a:", para);

  if (!apiKey) {
    console.log("⚠️  [EMAIL] RESEND_API_KEY no configurado - modo simulado");
    console.log("   Configure RESEND_API_KEY en las variables de entorno de Render");
    return { enviado: false, motivo: "RESEND_API_KEY no configurado (modo simulado)" };
  }

  const inicio = Date.now();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [para],
        cc: [CC_ADMIN],
        subject: asunto,
        html
      })
    });

    const data = await res.json();
    const duracion = Date.now() - inicio;

    if (!res.ok) {
      console.log("❌ [EMAIL] Error API:", res.status, data.message || JSON.stringify(data));
      return { enviado: false, motivo: data.message || "Error API " + res.status, duracion };
    }

    console.log("✅ [EMAIL] ENVIADO - Id:", data.id, "| Duración:", duracion + "ms");
    return { enviado: true, messageId: data.id, duracion };
  } catch (err) {
    const duracion = Date.now() - inicio;
    console.log("❌ [EMAIL] Error de red:", err.message, "| Duración:", duracion + "ms");
    return { enviado: false, motivo: err.message, duracion };
  }
}

async function verificarConexion() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("⚠️  [EMAIL] RESEND_API_KEY no configurada");
    return false;
  }
  console.log("✅ [EMAIL] API Key configurada (verificación pendiente en primer envío)");
  return true;
}

module.exports = { enviarComprobante, verificarConexion };
