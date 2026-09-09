// Los datos de la tabla
const categorias = [
  { id: 1, descripcion: 'Hardware', activo: true },
  { id: 2, descripcion: 'Software', activo: true },
  { id: 3, descripcion: 'Redes',    activo: true },
];


// Referencias al DOM
const tbody = document.getElementById('categorias-tbody');
const modal = document.getElementById('createModal');

// --- Modal -----------------------------------------------------------

// Abre el modal vacío para crear una categoría nueva
function abrirModalCrear() {
  document.getElementById('createModalTitle').textContent = 'Crear Categoria';
  document.getElementById('categoria-form').reset();
  document.getElementById('flexCheckChecked').checked = true;
  modal.dataset.modo = 'crear';
  new bootstrap.Modal(modal).show();
}

// Abre el modal con los datos de la fila cargados, para editar
function abrirModalEditar(idx) {
  const cat = categorias[idx];

  document.getElementById('createModalTitle').textContent = 'Editar Categoria';
  document.getElementById('descripcion').value       = cat.descripcion;
  document.getElementById('flexCheckChecked').checked = cat.activo;

  modal.dataset.modo = 'editar';
  modal.dataset.idx  = idx;
  new bootstrap.Modal(modal).show();
}

// --- Acciones de la tabla --------------------------------------------

function eliminarCategoria(idx) {
  const cat = categorias[idx];
  if (!confirm(`¿Eliminar la categoría "${cat.descripcion}"?`)) return;
  categorias.splice(idx, 1);
  renderTabla();
}

// Se llama cuando el usuario aprieta "Guardar" en el modal
function guardarCategoria(e) {
  e.preventDefault();

  const descripcion = document.getElementById('descripcion').value.trim();
  const activo      = document.getElementById('flexCheckChecked').checked;

  if (!descripcion) {
    alert('La descripción no puede estar vacía');
    return;
  }

  if (modal.dataset.modo === 'crear') {
    categorias.push({
      id: (categorias.at(-1)?.id ?? 0) + 1,
      descripcion,
      activo,
    });
  } else {
    const idx = Number(modal.dataset.idx);
    categorias[idx].descripcion = descripcion;
    categorias[idx].activo      = activo;
  }

  document.getElementById('categoria-form').reset();
  bootstrap.Modal.getInstance(modal).hide();
  renderTabla();
}

// --- Render de la tabla ----------------------------------------------

function renderTabla() {
  // En cada iteracion refrescar lista(simular backend) para selector en articulos
  localStorage.setItem("categorias", JSON.stringify(categorias));

  tbody.innerHTML = categorias.map((cat, idx) => `
    <tr>
      <th scope="row">${cat.id}</th>
      <td>${cat.descripcion}</td>
      <td>
        ${cat.activo
          ? '<span class="badge bg-success">Activa</span>'
          : '<span class="badge bg-secondary">Inactiva</span>'}
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEditar(${idx})">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCategoria(${idx})">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// --- Eventos ---------------------------------------------------------

tbody.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const idx = Number(el.dataset.idx);
  if (el.dataset.action === 'eliminar') eliminarCategoria(idx);
  if (el.dataset.action === 'editar')   abrirModalEditar(idx);
});

document.getElementById('categoria-form').addEventListener('submit', guardarCategoria);

// Pintar la tabla al cargar
renderTabla();

// Funciones que el HTML usa con onclick
window.abrirModalCrear   = abrirModalCrear;
window.abrirModalEditar  = abrirModalEditar;
window.eliminarCategoria = eliminarCategoria;