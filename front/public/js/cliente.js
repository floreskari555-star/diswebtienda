/**
 * cliente.js - Panel del cliente: perfil, compras y facturas
 * LibrosLibres Librería - Frontend
 */

let usuario = null;
let token = null;
let facturaActual = null;

// ── Inicialización ────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const userData = sessionStorage.getItem("user");
  if (!userData) {
    window.location.href = "login.html";
    return;
  }

  usuario = JSON.parse(userData);
  token = usuario.token;

  if (usuario.rol !== "cliente" && !["super", "admin"].includes(usuario.rol)) {
    alert("No tienes permisos de cliente");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("user-info").innerHTML = `
    <strong>${usuario.nombre} ${usuario.apellido_paterno || usuario.apellido || ""}</strong><br>
    <span class="badge bg-success">${usuario.rol}</span>
  `;

  configurarTabs();
  cargarPerfil();
  cargarCompras();
  cargarFacturas();
});

// ── Configurar tabs ───────────────────────────────────
function configurarTabs() {
  document.querySelectorAll("[data-tab]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      document.querySelectorAll(".tab-content").forEach(t => t.classList.add("d-none"));
      document.getElementById("tab-" + tab).classList.remove("d-none");
    });
  });
}

// ── API helper ────────────────────────────────────────
async function api(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };
  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  if (config.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, config);
  return response.json();
}

// ── Cargar y mostrar perfil ───────────────────────────
async function cargarPerfil() {
  try {
    const data = await api("/api/auth/perfil");
    const p = data.perfil;

    document.getElementById("perfil-nombre").textContent = `${p.nombre} ${p.apellido_paterno || ""} ${p.apellido_materno || ""}`;
    document.getElementById("perfil-email").textContent = p.correo || usuario.email;
    document.getElementById("perfil-rol").textContent = p.rol;

    // Llenar formulario
    document.getElementById("perfil-nombre-input").value = p.nombre || "";
    document.getElementById("perfil-paterno").value = p.apellido_paterno || "";
    document.getElementById("perfil-materno").value = p.apellido_materno || "";
    document.getElementById("perfil-num-doc").value = p.numero_documento || "";
    document.getElementById("perfil-telefono").value = p.telefono || "";
    document.getElementById("perfil-direccion").value = p.direccion || "";

    // Cargar selects de tipo documento y ubigeo
    await cargarTiposDocumento();
    if (p.tipo_documento) document.getElementById("perfil-tipo-doc").value = p.tipo_documento;

    await cargarDepartamentos();
    if (p.departamento) {
      document.getElementById("perfil-departamento").value = p.departamento;
      await cargarProvincias(p.departamento);
      if (p.provincia) {
        document.getElementById("perfil-provincia").value = p.provincia;
        await cargarDistritos(p.provincia);
        if (p.distrito) document.getElementById("perfil-distrito").value = p.distrito;
      }
    }

    // Guardar datos en sessionStorage para uso futuro
    usuario.tipo_documento = p.tipo_documento || "";
    usuario.numero_documento = p.numero_documento || "";
    usuario.apellido_paterno = p.apellido_paterno || "";
    usuario.apellido_materno = p.apellido_materno || "";
    usuario.direccion = p.direccion || "";
    sessionStorage.setItem("user", JSON.stringify(usuario));

    configurarFormularioPerfil();
    configurarCascadaUbigeo();
  } catch (err) {
    console.error("Error al cargar perfil:", err);
  }
}

// ── Cargar tipos de documento ─────────────────────────
async function cargarTiposDocumento() {
  try {
    const data = await fetch(`${CONFIG.BACKEND_URL}/api/tablas-maestras/TipoDocumento`);
    const json = await data.json();
    const select = document.getElementById("perfil-tipo-doc");
    (json.items || []).forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.clave;
      opt.textContent = item.valor;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar tipos de documento:", err);
  }
}

// ── Cargar departamentos ──────────────────────────────
async function cargarDepartamentos() {
  try {
    const data = await fetch(`${CONFIG.BACKEND_URL}/api/ubigeos/departamentos`);
    const json = await data.json();
    const select = document.getElementById("perfil-departamento");
    (json.departamentos || []).forEach(dep => {
      const opt = document.createElement("option");
      opt.value = dep.code;
      opt.textContent = dep.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar departamentos:", err);
  }
}

// ── Cargar provincias ─────────────────────────────────
async function cargarProvincias(departamentoCodigo) {
  const select = document.getElementById("perfil-provincia");
  select.innerHTML = '<option value="">Seleccionar...</option>';
  document.getElementById("perfil-distrito").innerHTML = '<option value="">Seleccionar...</option>';
  document.getElementById("perfil-distrito").disabled = true;

  if (!departamentoCodigo) {
    select.disabled = true;
    return;
  }

  try {
    const data = await fetch(`${CONFIG.BACKEND_URL}/api/ubigeos/provincias/${departamentoCodigo}`);
    const json = await data.json();
    (json.provincias || []).forEach(prov => {
      const opt = document.createElement("option");
      opt.value = prov.code;
      opt.textContent = prov.name;
      select.appendChild(opt);
    });
    select.disabled = false;
  } catch (err) {
    console.error("Error al cargar provincias:", err);
  }
}

// ── Cargar distritos ──────────────────────────────────
async function cargarDistritos(provinciaCodigo) {
  const select = document.getElementById("perfil-distrito");
  select.innerHTML = '<option value="">Seleccionar...</option>';

  if (!provinciaCodigo) {
    select.disabled = true;
    return;
  }

  try {
    const data = await fetch(`${CONFIG.BACKEND_URL}/api/ubigeos/distritos/${provinciaCodigo}`);
    const json = await data.json();
    (json.distritos || []).forEach(dist => {
      const opt = document.createElement("option");
      opt.value = dist.code;
      opt.textContent = dist.name;
      select.appendChild(opt);
    });
    select.disabled = false;
  } catch (err) {
    console.error("Error al cargar distritos:", err);
  }
}

// ── Configurar cascada ubigeo ─────────────────────────
function configurarCascadaUbigeo() {
  document.getElementById("perfil-departamento").addEventListener("change", function () {
    cargarProvincias(this.value);
  });
  document.getElementById("perfil-provincia").addEventListener("change", function () {
    cargarDistritos(this.value);
  });
}

// ── Configurar formulario de perfil ───────────────────
function configurarFormularioPerfil() {
  document.getElementById("form-perfil").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const body = {
        nombre: document.getElementById("perfil-nombre-input").value,
        apellido_paterno: document.getElementById("perfil-paterno").value,
        apellido_materno: document.getElementById("perfil-materno").value,
        tipo_documento: document.getElementById("perfil-tipo-doc").value,
        numero_documento: document.getElementById("perfil-num-doc").value,
        departamento: document.getElementById("perfil-departamento").value,
        provincia: document.getElementById("perfil-provincia").value,
        distrito: document.getElementById("perfil-distrito").value,
        telefono: document.getElementById("perfil-telefono").value,
        direccion: document.getElementById("perfil-direccion").value
      };

      const data = await api("/api/auth/perfil", { method: "PUT", body });
      if (data.error) {
        mostrarToast("Error: " + data.error, "danger");
        return;
      }

      // Actualizar sessionStorage
      Object.assign(usuario, body);
      sessionStorage.setItem("user", JSON.stringify(usuario));

      // Actualizar display
      document.getElementById("perfil-nombre").textContent = `${body.nombre} ${body.apellido_paterno} ${body.apellido_materno || ""}`;

      mostrarToast("Perfil actualizado exitosamente", "success");
    } catch (err) {
      mostrarToast("Error al actualizar perfil", "danger");
    }
  });
}

// ── Cargar compras del cliente ────────────────────────
async function cargarCompras() {
  const container = document.getElementById("compras-lista");
  try {
    const data = await api("/api/facturas/mi-historial");
    if (!data.facturas || data.facturas.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-bag-x display-1 text-muted"></i>
          <h4 class="mt-3 text-muted">No tienes compras registradas</h4>
          <p class="text-muted">Explora nuestro catálogo y realiza tu primera compra.</p>
          <a href="index.html" class="btn px-4 mt-2" style="background-color: var(--accent-color); color: #fff;">
            <i class="bi bi-collection me-2"></i>Ver Catálogo
          </a>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead style="background-color: var(--brand-primary); color: white;">
            <tr>
              <th>Tipo</th>
              <th>N° Comprobante</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${data.facturas.map(f => `
              <tr>
                <td><span class="badge bg-${f.tipo_comprobante === 'FACTURA' ? 'primary' : 'info'}">${f.tipo_comprobante}</span></td>
                <td>${f.numero_documento}</td>
                <td>${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')}/${f.anio}</td>
                <td><strong>S/ ${parseFloat(f.total).toFixed(2)}</strong></td>
                <td><span class="badge bg-${f.estado === 'Valido' ? 'success' : 'danger'}">${f.estado}</span></td>
                <td>
                  <button class="btn btn-outline-primary btn-sm" onclick="verFactura('${f.id}')">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm" onclick="descargarFacturaPDF('${f.id}')">
                    <i class="bi bi-file-earmark-pdf"></i>
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error al cargar compras</div>`;
    console.error(err);
  }
}

// ── Cargar facturas del cliente ───────────────────────
async function cargarFacturas() {
  const container = document.getElementById("facturas-lista");
  try {
    const data = await api("/api/facturas/mi-historial");
    if (!data.facturas || data.facturas.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-receipt-cutoff display-1 text-muted"></i>
          <h4 class="mt-3 text-muted">No tienes facturas o boletas</h4>
          <p class="text-muted">Las facturas y boletas de tus compras aparecerán aquí.</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="row">
        ${data.facturas.map(f => `
          <div class="col-md-6 col-lg-4 mb-3">
            <div class="card factura-card h-100" onclick="verFactura('${f.id}')">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span class="badge bg-${f.tipo_comprobante === 'FACTURA' ? 'primary' : 'info'} fs-6">${f.tipo_comprobante}</span>
                  <span class="badge bg-${f.estado === 'Valido' ? 'success' : 'danger'}">${f.estado}</span>
                </div>
                <h6 class="card-title">${f.numero_documento}</h6>
                <p class="card-text text-muted mb-1">
                  <small>${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')}/${f.anio}</small>
                </p>
                <p class="card-text fw-bold fs-5 mb-0" style="color: var(--accent-color);">S/ ${parseFloat(f.total).toFixed(2)}</p>
              </div>
              <div class="card-footer bg-white text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); descargarFacturaPDF('${f.id}')">
                  <i class="bi bi-file-earmark-pdf me-1"></i>PDF
                </button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error al cargar facturas</div>`;
    console.error(err);
  }
}

// ── Ver detalle de factura ────────────────────────────
async function verFactura(facturaId) {
  try {
    const data = await api(`/api/facturas/${facturaId}`);
    facturaActual = data.factura;
    const f = facturaActual;

    const detalle = `
      <div class="text-center mb-3">
        <strong style="font-size: 1.1em;">LIBROSLIBRES LIBRERIA</strong><br>
        <small>RUC: 20512345678</small><br>
        <small>Av. Principal 123, Lima - Lima</small><br>
        <small>Tel: (01) 123-4567</small>
      </div>
      <hr style="border-top: 1px dashed #000;">
      <div class="mb-2">
        <strong>${f.tipo_comprobante}</strong> N° <strong>${f.numero_documento}</strong>
      </div>
      <div class="mb-2">
        <small>Fecha: ${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')}/${f.anio}</small>
      </div>
      <hr style="border-top: 1px dashed #000;">
      <div class="mb-2">
        <small><strong>Cliente:</strong> ${f.cliente_nombre} ${f.cliente_apellido_paterno || ""} ${f.cliente_apellido_materno || ""}</small><br>
        <small><strong>Doc:</strong> ${f.cliente_numero_doc || "---"}</small><br>
        <small><strong>Direccion:</strong> ${f.cliente_direccion || "---"}</small>
      </div>
      <hr style="border-top: 1px dashed #000;">
      <div class="mb-3">
        <small><strong>DETALLE DE LA VENTA</strong></small>
        ${(f.facturas_detalles || []).map(d => `
          <div class="d-flex justify-content-between mb-1">
            <span>${d.numero_item}. ${d.descripcion}</span>
            <span>S/ ${parseFloat(d.total_item).toFixed(2)}</span>
          </div>
        `).join("")}
      </div>
      <hr style="border-top: 1px dashed #000;">
      <div class="d-flex justify-content-between mb-1">
        <span>Subtotal:</span>
        <span>S/ ${parseFloat(f.subtotal).toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between mb-1">
        <span>IGV (18%):</span>
        <span>S/ ${parseFloat(f.igv).toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between mb-2" style="font-size: 1.1em;">
        <strong>TOTAL:</strong>
        <strong>S/ ${parseFloat(f.total).toFixed(2)}</strong>
      </div>
    `;

    document.getElementById("factura-detalle").innerHTML = detalle;

    // Configurar botón PDF
    document.getElementById("btn-descargar-factura-pdf").onclick = () => {
      descargarFacturaPDF(facturaId);
    };

    new bootstrap.Modal(document.getElementById("modalFactura")).show();
  } catch (err) {
    console.error("Error al obtener factura:", err);
    mostrarToast("Error al cargar factura", "danger");
  }
}

// ── Descargar factura como PDF ────────────────────────
async function descargarFacturaPDF(facturaId) {
  try {
    const data = await api(`/api/facturas/${facturaId}`);
    const f = data.factura;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: [80, 200] });

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
    doc.text(`${f.tipo_comprobante} N° ${f.numero_documento}`, 5, y); y += lineH;
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.text(`Fecha: ${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')}/${f.anio}`, 5, y); y += lineH + 1;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, 75, y); y += lineH + 1;

    doc.setFontSize(7);
    doc.text(`Cliente: ${f.cliente_nombre} ${f.cliente_apellido_paterno || ""} ${f.cliente_apellido_materno || ""}`, 5, y); y += lineH - 1;
    doc.text(`Doc: ${f.cliente_numero_doc || "---"}`, 5, y); y += lineH - 1;
    doc.text(`Direccion: ${f.cliente_direccion || "---"}`, 5, y); y += lineH + 1;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, 75, y); y += lineH + 1;

    doc.setFont("courier", "bold");
    doc.text("DETALLE DE LA VENTA", 5, y); y += lineH + 1;
    doc.setFont("courier", "normal");

    (f.facturas_detalles || []).forEach((d, i) => {
      const nombreCorto = d.descripcion && d.descripcion.length > 28 ? d.descripcion.substring(0, 28) + "..." : (d.descripcion || "");
      doc.text(`${d.numero_item}. ${nombreCorto}`, 5, y); y += lineH - 1;
      doc.text(`    x${d.cantidad}  S/ ${parseFloat(d.total_item).toFixed(2)}`, 5, y); y += lineH;
    });

    y += 1;
    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, 75, y); y += lineH + 1;

    doc.setFontSize(7);
    doc.text(`Subtotal:`, 5, y);
    doc.text(`S/ ${parseFloat(f.subtotal).toFixed(2)}`, 75, y, { align: "right" }); y += lineH - 1;
    doc.text(`IGV (18%):`, 5, y);
    doc.text(`S/ ${parseFloat(f.igv).toFixed(2)}`, 75, y, { align: "right" }); y += lineH - 1;
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.text(`TOTAL:`, 5, y);
    doc.text(`S/ ${parseFloat(f.total).toFixed(2)}`, 75, y, { align: "right" }); y += lineH + 1;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, 75, y); y += lineH + 1;

    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.text("Gracias por su compra", centerX, y, { align: "center" }); y += lineH - 1;
    doc.text("www.libroslibres.com", centerX, y, { align: "center" });

    doc.save(`${f.tipo_comprobante}_${f.numero_documento}.pdf`);
  } catch (err) {
    console.error("Error al descargar PDF:", err);
    mostrarToast("Error al generar PDF", "danger");
  }
}

// ── Toast de notificación ─────────────────────────────
function mostrarToast(mensaje, tipo = "success") {
  const toastEl = document.getElementById("toast-cliente");
  const messageEl = document.getElementById("toast-message");
  if (toastEl && messageEl) {
    messageEl.textContent = mensaje;
    toastEl.className = `toast align-items-center text-white bg-${tipo} border-0`;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// ── Logout ────────────────────────────────────────────
function logout() {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("pendingPurchase");
  window.location.href = "login.html";
}
