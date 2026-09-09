// Lista de áreas (podría venir de un backend en el futuro)
const areas = [
    { id: 1, descripcion: 'Secretaría de Gobierno', activo: true },
    { id: 2, descripcion: 'Secretaría de Hacienda', activo: true },
    { id: 3, descripcion: 'Obras Públicas', activo: true },
    { id: 4, descripcion: 'Desarrollo Social', activo: true },
    { id: 5, descripcion: 'Tránsito y Transporte', activo: true },
    { id: 6, descripcion: 'Recursos Humanos', activo: true },
    { id: 7, descripcion: 'Atención al Ciudadano', activo: true },
    { id: 8, descripcion: 'Sistemas / Informática', activo: true },
];

// Categorías desde localStorage (las que el módulo de categorías ya guardó)
const categorias = JSON.parse(localStorage.getItem("categorias")) || [];

// Datos persistidos de artículos en localStorage
let articulos = JSON.parse(localStorage.getItem("articulos")) || [];

// Referencias DOM
const tbody = document.getElementById('articulos-tbody');
const modal = document.getElementById('createModal');

// Funciones 
function poblarSelectCategorias() {
    const select = document.getElementById('categoria');
    // Dejamos solo la primera opción vacía
    select.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.descripcion;
        select.appendChild(opt);
    });
}

function poblarSelectAreas() {
    const select = document.getElementById('area');
    select.innerHTML = '<option value="" disabled selected>Selecciona un área</option>';
    areas.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.descripcion;
        select.appendChild(opt);
    });
}


function abrirModalCrear() {
    document.getElementById('createModalTitle').textContent = 'Crear Artículo';
    document.getElementById('articulo-form').reset();
    document.getElementById('flexCheckChecked').checked = true;

    poblarSelectCategorias();
    poblarSelectAreas();

    modal.dataset.modo = 'crear';
    new bootstrap.Modal(modal).show();
}

function abrirModalEditar(idx) {
    const art = articulos[idx];
    document.getElementById('createModalTitle').textContent = 'Editar Artículo';

    poblarSelectCategorias();
    poblarSelectAreas();

    // Cargamos los valores actuales del artículo
    document.getElementById('descripcion').value = art.descripcion;
    document.getElementById('categoria').value = art.categoria.id;
    document.getElementById('area').value = art.area.id;
    document.getElementById('flexCheckChecked').checked = art.activo;

    modal.dataset.modo = 'editar';
    modal.dataset.idx = idx;
    new bootstrap.Modal(modal).show();
}

// ----------------------------------------------------
// Acciones de la tabla
// ----------------------------------------------------
function eliminarArticulo(idx) {
    const art = articulos[idx];
    if (!confirm(`¿Eliminar el artículo "${art.descripcion}"?`)) return;
    articulos.splice(idx, 1);
    renderTabla();
}

// Se llama cuando el usuario aprieta "Guardar" en el modal
function guardarArticulo(e) {
    e.preventDefault();

    const descripcion = document.getElementById('descripcion').value.trim();
    const categoriaId = document.getElementById('categoria').value;
    const areaId = document.getElementById('area').value;
    const activo = document.getElementById('flexCheckChecked').checked;

    if (!descripcion) {
        alert('La descripción no puede estar vacía');
        return;
    }
    if (!categoriaId || !areaId) {
        alert('Debes seleccionar una categoría y un área');
        return;
    }

    const catObj = categorias.find(c => c.id == categoriaId);
    const areaObj = areas.find(a => a.id == areaId);

    if (!catObj || !areaObj) {
        alert('Selección inválida');
        return;
    }

    if (modal.dataset.modo === 'crear') {
        articulos.push({
            id: (articulos.at(-1)?.id ?? 0) + 1,
            descripcion,
            categoria: catObj,
            area: areaObj,
            activo,
        });
    } else {
        const idx = Number(modal.dataset.idx);
        articulos[idx].descripcion = descripcion;
        articulos[idx].categoria = catObj;
        articulos[idx].area = areaObj;
        articulos[idx].activo = activo;
    }

    document.getElementById('articulo-form').reset();
    bootstrap.Modal.getInstance(modal).hide();
    renderTabla();
}

// ----------------------------------------------------
// Render de la tabla
// ----------------------------------------------------
function renderTabla() {
    // Set LS
    localStorage.setItem("articulos", JSON.stringify(articulos));

    tbody.innerHTML = articulos.map((art, idx) => `
    <tr>
      <th scope="row">${art.id}</th>
      <td>${art.area.descripcion}</td>
      <td>${art.categoria.descripcion}</td>
      <td>${art.descripcion}</td>
      <td>
        ${art.activo
            ? '<span class="badge bg-success">Activa</span>'
            : '<span class="badge bg-secondary">Inactiva</span>'}
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-action="editar" data-idx="${idx}">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-idx="${idx}">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Click de las filas
tbody.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const idx = Number(el.dataset.idx);
    if (el.dataset.action === 'eliminar') eliminarArticulo(idx);
    if (el.dataset.action === 'editar') abrirModalEditar(idx);
});

document.getElementById('articulo-form').addEventListener('submit', guardarArticulo);


window.abrirModalCrear = abrirModalCrear;
window.abrirModalEditar = abrirModalEditar;
window.eliminarArticulo = eliminarArticulo;
window.guardarArticulo = guardarArticulo;


renderTabla();