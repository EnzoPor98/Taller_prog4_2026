const BACKEND_URL = 'http://localhost:3000/api/categories';


// Referencias al DOM
const tbody = document.getElementById('categorias-tbody');
const modal = document.getElementById('createModal');

function goToMenu() {
  window.location.href = '/src/pages/empleadoSistemas/empleadoSistemas.html';
}

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
<<<<<<< HEAD
    const response = await fetch(`http://localhost:3000/api/categories/${idx}`);
=======
    const response = await fetch(`${BACKEND_URL}/${idx}`);
>>>>>>> origin/main

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    cat = await response.json();
<<<<<<< HEAD
    console.log("🚀 ~ renderTabla ~ cats:", cat);
=======
>>>>>>> origin/main
  } catch (error) {
    console.error('Ocurrio un error al recuperar las categorias')
  }

<<<<<<< HEAD

  document.getElementById('createModalTitle').textContent = 'Editar Categoria';
  document.getElementById('descripcion').value = cat.descripcion;
  document.getElementById('flexCheckChecked').checked = cat.activo;
=======
  document.getElementById('createModalTitle').textContent = 'Editar Categoria';
  document.getElementById('descripcion').value = cat[0].descripcion;
  document.getElementById('flexCheckChecked').checked = cat[0].activo;
>>>>>>> origin/main

  modal.dataset.modo = 'editar';
  modal.dataset.idx = idx;
  new bootstrap.Modal(modal).show();
}

// --- Acciones de la tabla --------------------------------------------

<<<<<<< HEAD
async function eliminarCategoria(idx) {
  if (!confirm(`¿Eliminar la categoría?`)) return;

  try {
    const respuesta = await fetch(`http://localhost:3000/api/categories/${idx}`, {
=======
async function eliminarCategoria(categoriaId) {

  if (!confirm(`¿Eliminar la categoría?`)) return;
  try {
    const respuesta = await fetch(`${BACKEND_URL}/${categoriaId}`, {
>>>>>>> origin/main
      method: 'DELETE'
    });

    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
<<<<<<< HEAD
    
    console.log('Categoría eliminada con éxito:', resultado);
=======

    alert('Categoría eliminada con éxito');
>>>>>>> origin/main

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
<<<<<<< HEAD
      const respuesta = await fetch('http://localhost:3000/api/categories', {
=======
      const respuesta = await fetch(`${BACKEND_URL}`, {
>>>>>>> origin/main
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });

      if (!respuesta.ok) {
        throw new Error(`Error en la petición: ${respuesta.status}`);
      }
<<<<<<< HEAD

    } catch (error) {
      console.error('Ocurrio un error al guardar la categoria')
=======
      alert('Categoria creada correctamente')

    } catch (error) {
      alert
      ('Ocurrio un error al guardar la categoria')
>>>>>>> origin/main
    }


  } else {
    const idx = Number(modal.dataset.idx);

    try {
<<<<<<< HEAD
      const respuesta = await fetch(`http://localhost:3000/api/categories/${idx}`, {
=======
      const respuesta = await fetch(`${BACKEND_URL}/${idx}`, {
>>>>>>> origin/main
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });

      if (!respuesta.ok) {
        throw new Error(`Error en la petición: ${respuesta.status}`);
      }
<<<<<<< HEAD

    } catch (error) {
      console.error('Ocurrio un error al actualizar la categoria')
=======
      alert('Categoria actualizada correctamente')

    } catch (error) {
      alert('Ocurrio un error al actualizar la categoria')
>>>>>>> origin/main

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
<<<<<<< HEAD
    const response = await fetch('http://localhost:3000/api/categories');
=======
    const response = await fetch(`${BACKEND_URL}`);
>>>>>>> origin/main

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    categorias = await response.json();
  } catch (error) {
    console.error('Ocurrio un error al recuperar las categorias')
  }

<<<<<<< HEAD
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
=======
  tbody.innerHTML = categorias.map((cat) => {
    return `
    <tr>
      <th scope="row">${cat.id_categoria}</th>
      <td>${cat.descripcion}</td>
      <td>
        ${cat.activo
        ? '<span class="badge bg-success">Activa</span>'
        : '<span class="badge bg-secondary">Inactiva</span>'}
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEditar(${cat.id_categoria})">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCategoria(${cat.id_categoria})">
>>>>>>> origin/main
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
<<<<<<< HEAD
  `).join('');
=======
  `;
  }).join('');
>>>>>>> origin/main
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
window.goToMenu = goToMenu;