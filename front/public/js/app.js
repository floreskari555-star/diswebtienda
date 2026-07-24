/**
 * app.js - Lógica principal del catálogo de libros
 * LibrosLibres Librería - Frontend
 */

// ── Configuración ────────────────────────────────────
const API_URL = CONFIG.BACKEND_URL;

// ── Inicialización ────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
  cargarCatalogo();
  actualizarContadorCarrito();
  configurarFiltros();
  configurarLogout();
});

// ── Verificar si hay sesión activa ────────────────────
function verificarSesion() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const btnLogin = document.getElementById("btn-login");
  const userMenu = document.getElementById("user-menu");
  const userName = document.getElementById("user-name");

  if (user && btnLogin && userMenu && userName) {
    btnLogin.classList.add("d-none");
    userMenu.classList.remove("d-none");
    userName.textContent = user.nombre || user.email;
  }
}

// ── Cargar catálogo de libros (desde API) ─────────────
async function cargarCatalogo(libros = null) {
  const grid = document.getElementById("catalogo-grid");
  if (!grid) return;

  // Si no se proporcionan libros, cargar desde la API
  if (!libros) {
    try {
      const response = await fetch(`${API_URL}/api/libros?activo=true`);
      const data = await response.json();
      libros = data.libros || [];
    } catch (err) {
      console.error("Error al cargar catálogo:", err);
      libros = [];
    }
  }

  if (libros.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search display-1 text-muted"></i>
        <h4 class="mt-3 text-muted">No se encontraron libros</h4>
        <p class="text-muted">Intenta con otros filtros de búsqueda.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = libros.map(libro => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100 card-libro">
        <img src="${libro.portada_url || 'https://via.placeholder.com/300x450/0F172A/FFFFFF?text=Sin+Portada'}" 
             class="card-img-top" alt="${libro.titulo}" 
             style="height: 250px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <div class="mb-2">
            <span class="badge" style="background-color: var(--brand-primary);">${libro.editoriales?.nombre || 'Sin editorial'}</span>
            ${libro.anio ? `<span class="text-muted small ms-2">${libro.anio}</span>` : ''}
          </div>
          <h5 class="card-title" style="font-family: 'Playfair Display', serif; color: var(--brand-primary);">
            ${libro.titulo}
          </h5>
          <p class="text-muted small mb-1">
            <i class="bi bi-person me-1"></i>${libro.autor}
          </p>
          <p class="card-text flex-grow-1">${libro.sinopsis || libro.descripcion || ''}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto pt-3" style="border-top: 1px solid var(--border-color);">
            <span class="fs-4 fw-bold" style="color: var(--accent-color);">S/ ${parseFloat(libro.precio).toFixed(2)}</span>
            <button class="btn btn-comprar btn-add-cart" 
                    data-id="${libro.id}" 
                    data-titulo="${libro.titulo}"
                    data-precio="${libro.precio}"
                    data-portada="${libro.portada_url || ''}"
                    data-autor="${libro.autor}">
              <i class="bi bi-cart-plus me-1"></i>Añadir
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  // Agregar event listeners a los botones de "Añadir al carrito"
  document.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const item = {
        id: btn.dataset.id,
        titulo: btn.dataset.titulo,
        precio: parseFloat(btn.dataset.precio),
        portada: btn.dataset.portada,
        autor: btn.dataset.autor,
        cantidad: 1
      };
      agregarAlCarrito(item);
    });
  });
}

// ── Configurar filtros ────────────────────────────────
function configurarFiltros() {
  const filterSearch = document.getElementById("filter-search");
  const filterEditorial = document.getElementById("filter-editorial");
  const filterPrecio = document.getElementById("filter-precio");

  // Cargar editoriales desde la API
  if (filterEditorial) {
    fetch(`${API_URL}/api/editoriales`)
      .then(res => res.json())
      .then(data => {
        if (data.editoriales) {
          data.editoriales.forEach(ed => {
            const option = document.createElement("option");
            option.value = ed.id;
            option.textContent = ed.nombre;
            filterEditorial.appendChild(option);
          });
        }
      })
      .catch(err => console.error("Error al cargar editoriales:", err));
  }

  // Filtros de búsqueda
  const aplicarFiltros = async () => {
    let url = `${API_URL}/api/libros?activo=true`;
    const params = new URLSearchParams();

    if (filterSearch && filterSearch.value) {
      params.append("search", filterSearch.value);
    }

    if (filterEditorial && filterEditorial.value) {
      params.append("editorial_id", filterEditorial.value);
    }

    const queryString = params.toString();
    if (queryString) url += "&" + queryString;

    try {
      const response = await fetch(url);
      const data = await response.json();
      cargarCatalogo(data.libros || []);
    } catch (err) {
      console.error("Error al filtrar:", err);
    }
  };

  if (filterSearch) filterSearch.addEventListener("input", aplicarFiltros);
  if (filterEditorial) filterEditorial.addEventListener("change", aplicarFiltros);
  if (filterPrecio) filterPrecio.addEventListener("change", aplicarFiltros);
}

// ── Configurar logout ─────────────────────────────────
function configurarLogout() {
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("pendingPurchase");
      window.location.href = "index.html";
    });
  }
}
