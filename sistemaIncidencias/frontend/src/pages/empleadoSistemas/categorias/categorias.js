const BACKEND_URL = 'http://localhost:3000/api/categories';


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
async function abrirModalEditar(idx) {
  let cat
  try {
    const response = await fetch(`http://localhost:3000/api/categories/${idx}`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    cat = await response.json();
    console.log("🚀 ~ renderTabla ~ cats:", cat);
  } catch (error) {
    console.error('Ocurrio un error al recuperar las categorias')
  }


  document.getElementById('createModalTitle').textContent = 'Editar Categoria';
  document.getElementById('descripcion').value = cat.descripcion;
  document.getElementById('flexCheckChecked').checked = cat.activo;

  modal.dataset.modo = 'editar';
  modal.dataset.idx = idx;
  new bootstrap.Modal(modal).show();
}

// --- Acciones de la tabla --------------------------------------------

async function eliminarCategoria(idx) {
  if (!confirm(`¿Eliminar la categoría?`)) return;

  try {
    const respuesta = await fetch(`http://localhost:3000/api/categories/${idx}`, {
      method: 'DELETE'
    });

    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    
    console.log('Categoría eliminada con éxito:', resultado);

  } catch (error) {
    console.error('Ocurrió un error al eliminar la categoría', error);
  }

  renderTabla();
}

// Se llama cuando el usuario aprieta "Guardar" en el modal
async function guardarCategoria(e) {
  e.preventDefault();

  const descripcion = document.getElementById('descripcion').value.trim();
  const activo = document.getElementById('flexCheckChecked').checked;
  const id = document.getElementById('flexCheckChecked').checked;


  if (!descripcion) {
    alert('La descripción no puede estar vacía');
    return;
  }

  const categoria = {
    descripcion,
    activo
  };
  if (modal.dataset.modo === 'crear') {

    try {
      const respuesta = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });

      if (!respuesta.ok) {
        throw new Error(`Error en la petición: ${respuesta.status}`);
      }

    } catch (error) {
      console.error('Ocurrio un error al guardar la categoria')
    }


  } else {
    const idx = Number(modal.dataset.idx);

    try {
      const respuesta = await fetch(`http://localhost:3000/api/categories/${idx}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });

      if (!respuesta.ok) {
        throw new Error(`Error en la petición: ${respuesta.status}`);
      }

    } catch (error) {
      console.error('Ocurrio un error al actualizar la categoria')

    }
  }

  document.getElementById('categoria-form').reset();
  bootstrap.Modal.getInstance(modal).hide();
  renderTabla();
}

// --- Render de la tabla ----------------------------------------------

async function renderTabla() {
  let categorias = [];
  try {
    const response = await fetch('http://localhost:3000/api/categories');

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    categorias = await response.json();
    console.log("🚀 ~ renderTabla ~ categorias:", categorias);
  } catch (error) {
    console.error('Ocurrio un error al recuperar las categorias')
  }

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
  if (el.dataset.action === 'editar') abrirModalEditar(idx);
});

document.getElementById('categoria-form').addEventListener('submit', guardarCategoria);

// Pintar la tabla al cargar
renderTabla();

// Funciones que el HTML usa con onclick
window.abrirModalCrear = abrirModalCrear;
window.abrirModalEditar = abrirModalEditar;
window.eliminarCategoria = eliminarCategoria;