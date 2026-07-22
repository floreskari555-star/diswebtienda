/* | Nombre: healthController.js | Finalidad: Endpoint de verificación de salud del servidor. */

const startTime = Date.now();

const health = (req, res) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📥 [HEALTH] Solicitud recibida");
  console.log("   Método:", req.method);
  console.log("   URL:", req.originalUrl);
  console.log("   IP:", req.ip);
  console.log("   Headers:", JSON.stringify(req.headers, null, 2));

  const uptimeMs = Date.now() - startTime;
  const uptimeSec = Math.floor(uptimeMs / 1000);
  const hours = Math.floor(uptimeSec / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = uptimeSec % 60;

  const respuesta = {
    mensaje: "Hola mundo mundial, estoy vivo :) 🚀",
    servidor: {
      fechaHora: new Date().toISOString(),
      zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    tiempoEnLinea: `${hours}h ${minutes}m ${seconds}s`,
  };

  console.log("📤 [HEALTH] Respuesta enviada:");
  console.log(JSON.stringify(respuesta, null, 2));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  res.json(respuesta);
};

module.exports = { health };
