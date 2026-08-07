/**
 * carrito.js - Gestión del carrito de compras con sessionStorage
 * LibrosLibres Librería - Frontend
 */

// ── Configuración de pasarelas de pago ────────────────
const PASARELAS_PAGO = {
  YAPE: {
    titulo: "Pago con Yape",
    icono: "bi-phone",
    color: "#7B2D8E",
    descripcion: "Serás redirigido a la app de Yape para completar el pago de forma segura.",
    pasos: [
      "Se abrirá la aplicación de Yape en tu celular",
      "Confirma el monto a pagar",
      "Ingresa tu clave de Yape",
      "Recibirás un código de confirmación",
      "El pago se acreditará en segundos"
    ],
    url: "https://yape.com.pe"
  },
  PLIN: {
    titulo: "Pago con Plin",
    icono: "bi-phone",
    color: "#00BFA5",
    descripcion: "Serás redirigido a la app de Plin para completar el pago de forma segura.",
    pasos: [
      "Se abrirá la aplicación de Plin en tu celular",
      "Confirma el monto a pagar",
      "Ingresa tu clave de Plin",
      "Recibirás un código de confirmación",
      "El pago se acreditará en segundos"
    ],
    url: "https://plin.app"
  },
  VISA: {
    titulo: "Pago con Visa",
    icono: "bi-credit-card",
    color: "#1A1F71",
    descripcion: "Serás redirigido al pasarela de pago segura de Visa para ingresar los datos de tu tarjeta.",
    pasos: [
      "Serás redirigido al checkout seguro de Visa",
      "Ingresa el número de tu tarjeta Visa",
      "Completa la fecha de vencimiento y CVV",
      "Confirma el código de verificación (OTP)",
      "El pago se procesará en segundos"
    ],
    url: "https://www.visa.com.pe"
  },
  MASTERCARD: {
    titulo: "Pago con Mastercard",
    icono: "bi-credit-card",
    color: "#EB001B",
    descripcion: "Serás redirigido al pasarela de pago segura de Mastercard para ingresar los datos de tu tarjeta.",
    pasos: [
      "Serás redirigido al checkout seguro de Mastercard",
      "Ingresa el número de tu tarjeta Mastercard",
      "Completa la fecha de vencimiento y CVV",
      "Confirma el código de verificación (OTP)",
      "El pago se procesará en segundos"
    ],
    url: "https://www.mastercard.com.pe"
  },
  AMEX: {
    titulo: "Pago con American Express",
    icono: "bi-credit-card",
    color: "#006FCF",
    descripcion: "Serás redirigido al pasarela de pago segura de American Express.",
    pasos: [
      "Serás redirigido al checkout seguro de Amex",
      "Ingresa el número de tu tarjeta American Express",
      "Completa la fecha de vencimiento y código de seguridad",
      "Confirma el código de verificación (OTP)",
      "El pago se procesará en segundos"
    ],
    url: "https://www.americanexpress.com"
  },
  PAYPAL: {
    titulo: "Pago con PayPal",
    icono: "bi-paypal",
    color: "#003087",
    descripcion: "Serás redirigido a PayPal para completar el pago de forma segura con tu cuenta.",
    pasos: [
      "Serás redirigido a la página de PayPal",
      "Ingresa tus credenciales de PayPal",
      "Revisa el monto y la forma de pago seleccionada",
      "Confirma el pago",
      "Recibirás la confirmación por correo electrónico"
    ],
    url: "https://www.paypal.com"
  },
  BCP: {
    titulo: "Transferencia BCP",
    icono: "bi-bank",
    color: "#00529B",
    descripcion: "Se mostrarán los datos bancarios para realizar la transferencia desde tu cuenta BCP.",
    pasos: [
      "Copia los datos de la cuenta BCP",
      "Realiza la transferencia desde tu banca en línea o app",
      "El monto a transferir es el total de tu compra",
      "Envía el comprobante de pago a nuestro correo",
      "Tu pedido se activará una vez verificado el pago"
    ],
    url: null
  },
  INTERBANK: {
    titulo: "Transferencia Interbank",
    icono: "bi-bank",
    color: "#EC1C24",
    descripcion: "Se mostrarán los datos bancarios para realizar la transferencia desde tu cuenta Interbank.",
    pasos: [
      "Copia los datos de la cuenta Interbank",
      "Realiza la transferencia desde tu banca en línea o app",
      "El monto a transferir es el total de tu compra",
      "Envía el comprobante de pago a nuestro correo",
      "Tu pedido se activará una vez verificado el pago"
    ],
    url: null
  },
  EFECTIVO: {
    titulo: "Pago en Efectivo",
    icono: "bi-cash",
    color: "#28A745",
    descripcion: "Paga en efectivo en nuestros puntos de atención autorizados.",
    pasos: [
      "Recibirás un código de pago único",
      "Acude a nuestro punto de atención más cercano",
      "Indica el código de pago y el monto a pagar",
      "Realiza el pago en efectivo",
      "Tu pedido se activará al confirmar el pago"
    ],
    url: null
  }
};

// ── Obtener carrito de sessionStorage ─────────────────
function obtenerCarrito() {
  const carrito = sessionStorage.getItem("carrito");
  return carrito ? JSON.parse(carrito) : [];
}

// ── Guardar carrito en sessionStorage ─────────────────
function guardarCarrito(carrito) {
  sessionStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

// ── Agregar item al carrito ───────────────────────────
function agregarAlCarrito(item) {
  const carrito = obtenerCarrito();
  const existente = carrito.find(i => i.id === item.id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push(item);
  }

  guardarCarrito(carrito);
  mostrarToast(`"${item.titulo}" añadido al carrito`);
}

// ── Eliminar item del carrito ─────────────────────────
function eliminarDelCarrito(id) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(i => i.id !== id);
  guardarCarrito(carrito);
  renderizarCarrito();
}

// ── Actualizar cantidad de un item ────────────────────
function actualizarCantidad(id, nuevaCantidad) {
  const carrito = obtenerCarrito();
  const item = carrito.find(i => i.id === id);

  if (item) {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
    } else {
      item.cantidad = nuevaCantidad;
      guardarCarrito(carrito);
      renderizarCarrito();
    }
  }
}

// ── Vaciar el carrito ─────────────────────────────────
function vaciarCarrito() {
  sessionStorage.removeItem("carrito");
  actualizarContadorCarrito();
  renderizarCarrito();
}

// ── Calcular totales ──────────────────────────────────
function calcularTotales(carrito) {
  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const impuestos = subtotal * 0.18;
  const total = subtotal + impuestos;

  return { subtotal, impuestos, total };
}

// ── Actualizar contador del carrito en navbar ─────────
function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  const badge = document.getElementById("cart-count");

  if (badge) {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = "inline";
    } else {
      badge.style.display = "none";
    }
  }
}

// ── Renderizar carrito en la página ────────────────────
function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const vacioEl = document.getElementById("carrito-vacio");
  const contenidoEl = document.getElementById("carrito-contenido");
  const itemsEl = document.getElementById("carrito-items");
  const totalItemsEl = document.getElementById("total-items");
  const subtotalEl = document.getElementById("resumen-subtotal");
  const impuestosEl = document.getElementById("resumen-impuestos");
  const totalEl = document.getElementById("resumen-total");

  if (!vacioEl || !contenidoEl) return;

  if (carrito.length === 0) {
    vacioEl.classList.remove("d-none");
    contenidoEl.classList.add("d-none");
    return;
  }

  vacioEl.classList.add("d-none");
  contenidoEl.classList.remove("d-none");

  // Renderizar items
  if (itemsEl) {
    itemsEl.innerHTML = carrito.map(item => `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <img src="${item.portada}" alt="${item.titulo}" 
                 class="rounded me-3" style="width: 50px; height: 70px; object-fit: cover;">
            <div>
              <strong>${item.titulo}</strong>
              <small class="d-block text-muted">${item.autor}</small>
            </div>
          </div>
        </td>
        <td>S/ ${item.precio.toFixed(2)}</td>
        <td class="text-center">
          <div class="input-group input-group-sm justify-content-center" style="width: 120px; margin: 0 auto;">
            <button class="btn btn-outline-secondary btn-cantidad" data-id="${item.id}" data-action="restar">-</button>
            <input type="number" class="form-control text-center" value="${item.cantidad}" min="1" 
                   data-id="${item.id}" readonly style="width: 40px;">
            <button class="btn btn-outline-secondary btn-cantidad" data-id="${item.id}" data-action="sumar">+</button>
          </div>
        </td>
        <td class="fw-bold">S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
        <td>
          <button class="btn btn-outline-danger btn-sm btn-eliminar" data-id="${item.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");

    // Event listeners para cantidades
    itemsEl.querySelectorAll(".btn-cantidad").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const accion = btn.dataset.action;
        const carritoActual = obtenerCarrito();
        const item = carritoActual.find(i => i.id === id);

        if (item) {
          if (accion === "sumar") {
            actualizarCantidad(id, item.cantidad + 1);
          } else if (accion === "restar") {
            actualizarCantidad(id, item.cantidad - 1);
          }
        }
      });
    });

    // Event listeners para eliminar
    itemsEl.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm("¿Eliminar este libro del carrito?")) {
          eliminarDelCarrito(id);
        }
      });
    });
  }

  // Actualizar totales
  const { subtotal, impuestos, total } = calcularTotales(carrito);

  if (totalItemsEl) totalItemsEl.textContent = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  if (subtotalEl) subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
  if (impuestosEl) impuestosEl.textContent = `S/ ${impuestos.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

// ── Cargar formas de pago desde la tabla maestra ──────
async function cargarFormasPago() {
  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/api/tablas-maestras/forpago`);
    const data = await res.json();
    const select = document.getElementById("forma-pago");
    if (!select) return;

    data.items.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.clave;
      opt.textContent = item.valor;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar formas de pago:", err);
  }
}

// ── Mostrar modal de proceso de pago ──────────────────
function mostrarModalPago(claveMetodo) {
  const metodo = PASARELAS_PAGO[claveMetodo];
  if (!metodo) return;

  // Actualizar contenido del modal
  document.getElementById("pago-modal-titulo").innerHTML = `<i class="${metodo.icono} me-2"></i>${metodo.titulo}`;
  document.getElementById("pago-modal-icono").innerHTML = `<i class="${metodo.icono} display-1" style="color: ${metodo.color};"></i>`;
  document.getElementById("pago-modal-mensaje").textContent = metodo.titulo;
  document.getElementById("pago-modal-descripcion").textContent = metodo.descripcion;

  // Generar pasos
  const pasosHtml = metodo.pasos.map((paso, i) => `
    <div class="d-flex align-items-start mb-2">
      <span class="badge rounded-pill me-2 mt-1" style="background-color: ${metodo.color};">${i + 1}</span>
      <span>${paso}</span>
    </div>
  `).join("");
  document.getElementById("pago-modal-pasos").innerHTML = pasosHtml;

  // Configurar botón continuar
  const btnContinuar = document.getElementById("btn-pago-continuar");
  btnContinuar.onclick = () => {
    if (metodo.url) {
      window.open(metodo.url, "_blank");
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById("modal-pago-proceso"));
    modal.hide();
    mostrarToast("Pago procesado exitosamente (simulado)");
  };

  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById("modal-pago-proceso"));
  modal.show();
}

// ── Mostrar notificación toast ────────────────────────
function mostrarToast(mensaje) {
  const toastEl = document.getElementById("toast-carrito");
  const messageEl = document.getElementById("toast-message");

  if (toastEl && messageEl) {
    messageEl.textContent = mensaje;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// ── Verificar si hay sesión activa ────────────────────
function haySesion() {
  const user = sessionStorage.getItem("user");
  return user !== null;
}

// ── Manejar clic en "PAGAR" ──────────────────────────
function manejarPago() {
  const btnPagar = document.getElementById("btn-pagar");

  if (btnPagar) {
    btnPagar.addEventListener("click", () => {
      if (!haySesion()) {
        sessionStorage.setItem("pendingPurchase", "true");
        const modal = new bootstrap.Modal(document.getElementById("modal-login-requerido"));
        modal.show();
        return;
      }

      const formaPago = document.getElementById("forma-pago");
      if (!formaPago || !formaPago.value) {
        mostrarToast("Debes seleccionar una forma de pago");
        return;
      }

      mostrarModalPago(formaPago.value);
    });
  }
}

// ── Inicializar en página de carrito ──────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrito();
  manejarPago();
  cargarFormasPago();
  actualizarContadorCarrito();

  // Configurar botón vaciar carrito
  const btnVaciar = document.getElementById("btn-vaciar-carrito");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
      if (confirm("¿Estás seguro de vaciar todo el carrito?")) {
        vaciarCarrito();
      }
    });
  }

  // Verificar sesión en navbar
  const user = JSON.parse(sessionStorage.getItem("user"));
  const btnLogin = document.getElementById("btn-login");
  const userMenu = document.getElementById("user-menu");
  const userName = document.getElementById("user-name");

  if (user && btnLogin && userMenu && userName) {
    btnLogin.classList.add("d-none");
    userMenu.classList.remove("d-none");
    userName.textContent = user.nombre || user.email;
  }
});
