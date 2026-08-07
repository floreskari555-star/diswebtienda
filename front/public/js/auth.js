/**
 * auth.js - Lógica de autenticación con Supabase
 * LibrosLibres Librería - Frontend
 */

// ── Configuración global ──────────────────────────────
// Se espera que config.js se cargue antes que este archivo

// ── Verificar si hay sesión activa al cargar ──────────
document.addEventListener("DOMContentLoaded", () => {
  verificarSesionActiva();
  configurarFormularioLogin();
  configurarTogglePassword();
});

// ── Verificar si ya hay sesión ────────────────────────
function verificarSesionActiva() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (user) {
    redirigirSegunRol(user.rol);
  }
}

// ── Configurar formulario de login ────────────────────
function configurarFormularioLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const btnSubmit = document.getElementById("btn-submit");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");
    const alertError = document.getElementById("alert-error");

    // Mostrar loading
    btnText.classList.add("d-none");
    btnSpinner.classList.remove("d-none");
    btnSubmit.disabled = true;
    alertError.classList.add("d-none");

    try {
      // Llamar al backend para login
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo: email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // Guardar datos de sesión
      const usuario = {
        id: data.usuario.id,
        email: data.usuario.email,
        nombre: data.usuario.nombre,
        apellido_paterno: data.usuario.apellido_paterno || "",
        apellido_materno: data.usuario.apellido_materno || "",
        tipo_documento: data.usuario.tipo_documento || "",
        numero_documento: data.usuario.numero_documento || "",
        departamento: data.usuario.departamento || "",
        provincia: data.usuario.provincia || "",
        distrito: data.usuario.distrito || "",
        ubigeo: data.usuario.ubigeo || "",
        telefono: data.usuario.telefono || "",
        direccion: data.usuario.direccion || "",
        rol: data.usuario.rol,
        editorial_id: data.usuario.editorial_id || null,
        token: data.session.access_token
      };

      sessionStorage.setItem("user", JSON.stringify(usuario));

      // Verificar si hay compra pendiente
      const pendingPurchase = sessionStorage.getItem("pendingPurchase");
      if (pendingPurchase) {
        sessionStorage.removeItem("pendingPurchase");
        window.location.href = "carrito.html";
      } else {
        redirigirSegunRol(usuario.rol);
      }

    } catch (error) {
      alertError.textContent = error.message;
      alertError.classList.remove("d-none");
    } finally {
      btnText.classList.remove("d-none");
      btnSpinner.classList.add("d-none");
      btnSubmit.disabled = false;
    }
  });
}

// ── Redirigir según el rol del usuario ────────────────
function redirigirSegunRol(rol) {
  switch (rol) {
    case "admin":
    case "super":
      window.location.href = "admin.html";
      break;
    case "proveedor":
      window.location.href = "proveedor.html";
      break;
    case "cliente":
      window.location.href = "cliente.html";
      break;
    default:
      window.location.href = "index.html";
      break;
  }
}

// ── Toggle mostrar/ocultar contraseña ─────────────────
function configurarTogglePassword() {
  const toggleBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("login-password");

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;

      const icon = toggleBtn.querySelector("i");
      icon.className = type === "password" ? "bi bi-eye" : "bi bi-eye-slash";
    });
  }
}

// ── Función de logout ─────────────────────────────────
function logout() {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("pendingPurchase");
  window.location.href = "login.html";
}

// ── Exportar para uso global ──────────────────────────
window.auth = {
  verificarSesionActiva,
  logout,
  obtenerUsuario: () => JSON.parse(sessionStorage.getItem("user"))
};
