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
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  return { subtotal, igv, total };
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
  const { subtotal, igv, total } = calcularTotales(carrito);

  if (totalItemsEl) totalItemsEl.textContent = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  if (subtotalEl) subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
  if (impuestosEl) impuestosEl.textContent = `S/ ${igv.toFixed(2)}`;
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

// ── Cargar tipos de comprobante ───────────────────────
async function cargarTiposComprobante() {
  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/api/tablas-maestras/tipoComprobante`);
    const data = await res.json();
    const select = document.getElementById("tipo-comprobante");
    if (!select) return;

    data.items.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.clave;
      opt.textContent = item.valor;
      select.appendChild(opt);
    });

    aplicarReglaComprobante();
  } catch (err) {
    console.error("Error al cargar tipos de comprobante:", err);
  }
}

// ── Aplicar regla DNI → solo BOLETA ──────────────────
function aplicarReglaComprobante() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const select = document.getElementById("tipo-comprobante");
  const hint = document.getElementById("comprobante-hint");
  if (!select || !user) return;

  if (user.tipo_documento === "DNI") {
    select.value = "BOLETA";
    select.disabled = true;
    if (hint) hint.textContent = "Solo puedes emitir Boleta con DNI";
  } else {
    select.disabled = false;
    if (hint) hint.textContent = "";
  }
}

// ── Generar ticket HTML ───────────────────────────────
function generarTicketHTML(tipo, numero, carrito, totales, user) {
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, "0");
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const anio = ahora.getFullYear();
  const hora = ahora.toLocaleTimeString("es-PE");

  const nombreCliente = `${user.nombre || ""} ${user.apellido_paterno || ""} ${user.apellido_materno || ""}`.trim();
  const numDoc = user.numero_documento || "---";
  const direccion = user.direccion || "---";

  const itemsHTML = carrito.map((item, i) => `
    <div class="d-flex justify-content-between mb-1">
      <span>${i + 1}. ${item.titulo}</span>
      <span>S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
    </div>
  `).join("");

  return `
    <div class="text-center mb-3">
      <strong style="font-size: 1.1em;">LIBROSLIBRES LIBRERIA</strong><br>
      <small>RUC: 20512345678</small><br>
      <small>Av. Principal 123, Lima - Lima</small><br>
      <small>Tel: (01) 123-4567</small>
    </div>
    <hr style="border-top: 1px dashed #000;">
    <div class="mb-2">
      <strong>${tipo}</strong> N° <strong>${numero}</strong>
    </div>
    <div class="mb-2">
      <small>Fecha: ${dia}/${mes}/${anio} ${hora}</small>
    </div>
    <hr style="border-top: 1px dashed #000;">
    <div class="mb-2">
      <small><strong>Cliente:</strong> ${nombreCliente}</small><br>
      <small><strong>${user.tipo_documento || "DOC"}:</strong> ${numDoc}</small><br>
      <small><strong>Dirección:</strong> ${direccion}</small>
    </div>
    <hr style="border-top: 1px dashed #000;">
    <div class="mb-3">
      <small><strong>DETALLE DE LA VENTA</strong></small>
      ${itemsHTML}
    </div>
    <hr style="border-top: 1px dashed #000;">
    <div class="d-flex justify-content-between mb-1">
      <span>Subtotal:</span>
      <span>S/ ${totales.subtotal.toFixed(2)}</span>
    </div>
    <div class="d-flex justify-content-between mb-1">
      <span>IGV (18%):</span>
      <span>S/ ${totales.igv.toFixed(2)}</span>
    </div>
    <div class="d-flex justify-content-between mb-2" style="font-size: 1.1em;">
      <strong>TOTAL:</strong>
      <strong>S/ ${totales.total.toFixed(2)}</strong>
    </div>
    <hr style="border-top: 1px dashed #000;">
    <div class="text-center">
      <small>Gracias por su compra</small><br>
      <small>www.libroslibres.com</small>
    </div>
  `;
}

// ── Descargar comprobante como PDF ────────────────────
function descargarComprobantePDF(tipo, numero, carritoItems, totales, user) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: [80, 200] });

  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, "0");
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const anio = ahora.getFullYear();
  const hora = ahora.toLocaleTimeString("es-PE");

  const nombreCliente = `${user.nombre || ""} ${user.apellido_paterno || ""} ${user.apellido_materno || ""}`.trim();
  const numDoc = user.numero_documento || "---";
  const direccion = user.direccion || "---";

  let y = 10;
  const lineH = 5;
  const centerX = 40;

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text("LIBROSLIBRES LIBRERIA", centerX, y, { align: "center" }); y += lineH;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("RUC: 20512345678", centerX, y, { align: "center" }); y += lineH - 1;
  doc.text("Av. Principal 123, Lima - Lima", centerX, y, { align: "center" }); y += lineH - 1;
  doc.text("Tel: (01) 123-4567", centerX, y, { align: "center" }); y += lineH + 1;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y); y += lineH + 1;

  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.text(`${tipo} N° ${numero}`, 5, y); y += lineH;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text(`Fecha: ${dia}/${mes}/${anio} ${hora}`, 5, y); y += lineH + 1;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y); y += lineH + 1;

  doc.setFontSize(7);
  doc.text(`Cliente: ${nombreCliente}`, 5, y); y += lineH - 1;
  doc.text(`${user.tipo_documento || "DOC"}: ${numDoc}`, 5, y); y += lineH - 1;
  doc.text(`Direccion: ${direccion}`, 5, y); y += lineH + 1;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y); y += lineH + 1;

  doc.setFont("courier", "bold");
  doc.text("DETALLE DE LA VENTA", 5, y); y += lineH + 1;
  doc.setFont("courier", "normal");

  carritoItems.forEach((item, i) => {
    const precioTotal = (item.precio * item.cantidad).toFixed(2);
    const nombreCorto = item.titulo.length > 28 ? item.titulo.substring(0, 28) + "..." : item.titulo;
    doc.text(`${i + 1}. ${nombreCorto}`, 5, y); y += lineH - 1;
    doc.text(`    x${item.cantidad}  S/ ${precioTotal}`, 5, y); y += lineH;
  });

  y += 1;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y); y += lineH + 1;

  doc.setFontSize(7);
  doc.text(`Subtotal:`, 5, y);
  doc.text(`S/ ${totales.subtotal.toFixed(2)}`, 75, y, { align: "right" }); y += lineH - 1;
  doc.text(`IGV (18%):`, 5, y);
  doc.text(`S/ ${totales.igv.toFixed(2)}`, 75, y, { align: "right" }); y += lineH - 1;
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.text(`TOTAL:`, 5, y);
  doc.text(`S/ ${totales.total.toFixed(2)}`, 75, y, { align: "right" }); y += lineH + 1;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y); y += lineH + 1;

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Gracias por su compra", centerX, y, { align: "center" }); y += lineH - 1;
  doc.text("www.libroslibres.com", centerX, y, { align: "center" });

  doc.save(`${tipo}_${numero}.pdf`);
}

// ── Guardar factura y detalles en backend ─────────────
async function guardarFactura(tipo, carrito, totales, user) {
  try {
    const ahora = new Date();
    const payload = {
      tipo_comprobante: tipo,
      cliente_id: user.id || null,
      cliente_email: user.email || "",
      cliente_nombre: user.nombre || "",
      cliente_apellido_paterno: user.apellido_paterno || "",
      cliente_apellido_materno: user.apellido_materno || "",
      cliente_numero_doc: user.numero_documento || "",
      cliente_direccion: user.direccion || "",
      subtotal: totales.subtotal,
      igv: totales.igv,
      total: totales.total,
      dia: ahora.getDate(),
      mes: ahora.getMonth() + 1,
      anio: ahora.getFullYear(),
      detalles: carrito.map((item, i) => ({
        numero_item: i + 1,
        codigo: item.id || "",
        descripcion: item.titulo || "",
        precio_unitario: item.precio,
        cantidad: item.cantidad,
        total_item: item.precio * item.cantidad
      }))
    };

    const res = await fetch(`${CONFIG.BACKEND_URL}/api/facturas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.warn("No se pudo guardar la factura");
      return null;
    }

    const data = await res.json();
    return data.factura;
  } catch (err) {
    console.warn("Error al guardar factura:", err.message);
    return null;
  }
}

// ── Mostrar modal de proceso de pago ──────────────────
function mostrarModalPago(claveMetodo) {
  const metodo = PASARELAS_PAGO[claveMetodo];
  if (!metodo) return;

  const user = JSON.parse(sessionStorage.getItem("user"));
  const carrito = obtenerCarrito();
  const totales = calcularTotales(carrito);
  const tipoComprobante = document.getElementById("tipo-comprobante")?.value || "BOLETA";

  // Actualizar contenido del modal
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

  // Configurar botón confirmar
  const btnContinuar = document.getElementById("btn-pago-continuar");
  btnContinuar.onclick = async () => {
    // Cerrar modal de pago
    const modalPago = bootstrap.Modal.getInstance(document.getElementById("modal-pago-proceso"));
    modalPago.hide();

    // Guardar en backend (genera el correlativo)
    const factura = await guardarFactura(tipoComprobante, carrito, totales, user);
    const numero = factura ? factura.numero_documento : "---";
    const fecha = factura
      ? `${String(factura.dia).padStart(2, "0")}/${String(factura.mes).padStart(2, "0")}/${factura.anio}`
      : `${String(new Date().getDate()).padStart(2, "0")}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`;

    // Generar y mostrar ticket
    const ticketHTML = generarTicketHTML(tipoComprobante, numero, carrito, totales, user);
    document.getElementById("ticket-content").innerHTML = ticketHTML;
    const modalTicket = new bootstrap.Modal(document.getElementById("modal-ticket"));
    modalTicket.show();

    // Configurar botón PDF
    document.getElementById("btn-descargar-pdf").onclick = () => {
      descargarComprobantePDF(tipoComprobante, numero, carrito, totales, user);
    };

    // Vaciar carrito
    vaciarCarrito();
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

      const tipoComprobante = document.getElementById("tipo-comprobante");
      if (!tipoComprobante || !tipoComprobante.value) {
        mostrarToast("Debes seleccionar un tipo de comprobante");
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
  cargarTiposComprobante();
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
