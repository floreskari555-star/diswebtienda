/* | Nombre: server.js | Finalidad: Arranca el servidor HTTP escuchando en el puerto configurado. */

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 [SERVER] DisWebTienda Backend iniciado");
  console.log("   Puerto:", PORT);
  console.log("   Entorno:", process.env.NODE_ENV || "development");
  console.log("   URL local: http://localhost:" + PORT);
  console.log("   Health check: http://localhost:" + PORT + "/health");
  console.log("   Swagger docs: http://localhost:" + PORT + "/docs");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});
