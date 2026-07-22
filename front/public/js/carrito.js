/**
 * carrito.js - Gestión del carrito de compras con sessionStorage
 * DisWebTienda - Frontend
 */

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
      if (haySesion()) {
        // TODO: Redirigir a página de pago
        alert("Redirigiendo a la página de pago...");
      } else {
        // Guardar intención de compra y redirigir a login
        sessionStorage.setItem("pendingPurchase", "true");
        const modal = new bootstrap.Modal(document.getElementById("modal-login-requerido"));
        modal.show();
      }
    });
  }
}

// ── Inicializar en página de carrito ──────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrito();
  manejarPago();
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
