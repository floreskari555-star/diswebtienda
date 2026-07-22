/**
 * app.js - Lógica principal del catálogo de libros
 * DisWebTienda - Frontend
 */

// ── Configuración ────────────────────────────────────
const API_URL = "https://diswebtienda.onrender.com";

// ── Datos de ejemplo (catálogo simulado) ──────────────
const catalogoEjemplo = [
  {
    id: "1",
    titulo: "El Arte de la Guerra",
    autor: "Sun Tzu",
    sinopsis: "Un tratado militar clásico que ha influido en la estrategia durante más de 2000 años.",
    anio: 2020,
    editorial: "Editorial Clásicos",
    precio: 29.90,
    portada: "https://via.placeholder.com/300x450/0F172A/FFFFFF?text=El+Arte+de+la+Guerra"
  },
  {
    id: "2",
    titulo: "Cien Años de Soledad",
    autor: "Gabriel García Márquez",
    sinopsis: "La obra maestra del realismo mágico que narra la historia de la familia Buendía.",
    anio: 2018,
    editorial: "Editorial Literaria",
    precio: 45.00,
    portada: "https://via.placeholder.com/300x450/D97706/FFFFFF?text=Cien+Años+de+Soledad"
  },
  {
    id: "3",
    titulo: "Don Quijote de la Mancha",
    autor: "Miguel de Cervantes",
    sinopsis: "La aventura del ingenioso hidalgo que soñaba con ser caballero andante.",
    anio: 2021,
    editorial: "Editorial Clásicos",
    precio: 35.50,
    portada: "https://via.placeholder.com/300x450/166534/FFFFFF?text=Don+Quijote"
  },
  {
    id: "4",
    titulo: "La Sombra del Viento",
    autor: "Carlos Ruiz Zafón",
    sinopsis: "Un misterio literario en la Barcelona de posguerra.",
    anio: 2019,
    editorial: "Editorial Moderna",
    precio: 38.00,
    portada: "https://via.placeholder.com/300x450/991B1B/FFFFFF?text=La+Sombra+del+Viento"
  },
  {
    id: "5",
    titulo: "Rayuela",
    autor: "Julio Cortázar",
    sinopsis: "Una novela experimental que desafía la estructura narrativa tradicional.",
    anio: 2022,
    editorial: "Editorial Literaria",
    precio: 42.00,
    portada: "https://via.placeholder.com/300x450/334155/FFFFFF?text=Rayuela"
  },
  {
    id: "6",
    titulo: "El Principito",
    autor: "Antoine de Saint-Exupéry",
    sinopsis: "Un piloto se encuentra varado en el desierto del Sahara y conoce a un pequeño príncipe.",
    anio: 2020,
    editorial: "Editorial Infantil",
    precio: 25.00,
    portada: "https://via.placeholder.com/300x450/D97706/FFFFFF?text=El+Principito"
  }
];

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

// ── Cargar catálogo de libros ─────────────────────────
function cargarCatalogo(libros = catalogoEjemplo) {
  const grid = document.getElementById("catalogo-grid");
  if (!grid) return;

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
        <img src="${libro.portada}" class="card-img-top" alt="${libro.titulo}" 
             style="height: 250px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <div class="mb-2">
            <span class="badge" style="background-color: var(--brand-primary);">${libro.editorial}</span>
            <span class="text-muted small ms-2">${libro.anio}</span>
          </div>
          <h5 class="card-title" style="font-family: 'Playfair Display', serif; color: var(--brand-primary);">
            ${libro.titulo}
          </h5>
          <p class="text-muted small mb-1">
            <i class="bi bi-person me-1"></i>${libro.autor}
          </p>
          <p class="card-text flex-grow-1">${libro.sinopsis}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto pt-3" style="border-top: 1px solid var(--border-color);">
            <span class="fs-4 fw-bold" style="color: var(--accent-color);">S/ ${libro.precio.toFixed(2)}</span>
            <button class="btn btn-comprar btn-add-cart" 
                    data-id="${libro.id}" 
                    data-titulo="${libro.titulo}"
                    data-precio="${libro.precio}"
                    data-portada="${libro.portada}"
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

  // Cargar editoriales en el select
  if (filterEditorial) {
    const editoriales = [...new Set(catalogoEjemplo.map(l => l.editorial))];
    editoriales.forEach(ed => {
      const option = document.createElement("option");
      option.value = ed;
      option.textContent = ed;
      filterEditorial.appendChild(option);
    });
  }

  // Filtros de búsqueda
  const aplicarFiltros = () => {
    let resultado = [...catalogoEjemplo];

    if (filterSearch && filterSearch.value) {
      const busqueda = filterSearch.value.toLowerCase();
      resultado = resultado.filter(l => 
        l.titulo.toLowerCase().includes(busqueda) || 
        l.autor.toLowerCase().includes(busqueda)
      );
    }

    if (filterEditorial && filterEditorial.value) {
      resultado = resultado.filter(l => l.editorial === filterEditorial.value);
    }

    if (filterPrecio && filterPrecio.value) {
      const [min, max] = filterPrecio.value.split("-").map(Number);
      if (filterPrecio.value.includes("+")) {
        resultado = resultado.filter(l => l.precio >= 50);
      } else {
        resultado = resultado.filter(l => l.precio >= min && l.precio <= max);
      }
    }

    cargarCatalogo(resultado);
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
