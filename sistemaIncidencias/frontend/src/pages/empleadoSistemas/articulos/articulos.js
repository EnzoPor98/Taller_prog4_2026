// Lista de áreas (podría venir de un backend en el futuro)
const BACKEND_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Bootstrap viene expuesto en window.bootstrap desde /src/main.js
// (cargado como módulo, así que se garantiza antes que este script).
const { Modal } = window.bootstrap;

function goToMenu() {
    window.location.href = '../empleadoSistemas.html';
}


async function getAreas() {
    let areas = [];
    try {
        const response = await fetch(`${BACKEND_URL}/areas`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        areas = await response.json();
    } catch (error) {
        console.error('Ocurrio un error al recuperar las areas')
    }
    return areas;
}

// Categorías desde localStorage (las que el módulo de categorías ya guardó)
async function getCategorias() {
    let categorias = [];
    try {
        const response = await fetch(`${BACKEND_URL}/categories`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        categorias = await response.json();
    } catch (error) {
        console.error('Ocurrio un error al recuperar las categorias')
    }
    return categorias;
}

//Resolver juntas las 2 promesas(Funciones asincronas)
let areas = [];
let categorias = [];
(async () => {
    [areas, categorias] = await Promise.all([getAreas(), getCategorias()]);
})();

// RenderTabla hace el get de todos los articulos.
let articulos = []

// Referencias DOM
const tbody = document.getElementById('articulos-tbody');
const modal = document.getElementById('createModal');

function poblarSelectCategorias() {
    const select = document.getElementById('categoria');
    // Dejamos solo la primera opción vacía
    select.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id_categoria;
        opt.textContent = cat.descripcion;
        select.appendChild(opt);
    });
}

function poblarSelectAreas() {
    const select = document.getElementById('area');
    select.innerHTML = '<option value="" disabled selected>Selecciona un área</option>';
    areas.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id_area;
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
    new Modal(modal).show();
}

async function abrirModalEditar(idArticulo) {
    const art = articulos.find(art => art.id_articulo == idArticulo);
    document.getElementById('createModalTitle').textContent = 'Editar Artículo';

    // Esperamos a que los <select> se pueblen antes de setear los valores
    poblarSelectCategorias();
    poblarSelectAreas();

    // Cargamos los valores actuales del artículo
    document.getElementById('descripcion').value = art.descripcion;
    document.getElementById('categoria').value = art.categoria?.id_categoria;
    document.getElementById('area').value = art.area?.id_area;
    document.getElementById('flexCheckChecked').checked = art.activo;

    modal.dataset.modo = 'editar';
    modal.dataset.idx = idArticulo;
    new Modal(modal).show();
}

// ----------------------------------------------------
// Acciones de la tabla
// ----------------------------------------------------
async function eliminarArticulo(idArticulo) {
    const art = articulos.find(art => art.id_articulo == idArticulo);

    if (!confirm(`¿Eliminar el artículo "${art.descripcion}"?`)) return;

    try {
        const respuesta = await fetch(`${BACKEND_URL}/articulos/${idArticulo}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

        });

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();

        alert('Articulo eliminado con éxito');

    } catch (error) {
        console.error('Ocurrió un error al eliminar el articulo', error);
    }
    renderTabla();
}

// Se llama cuando el usuario aprieta "Guardar" en el modal
async function guardarArticulo(e) {
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

    // Guardamos el objeto entero (categoría y área) para que la tabla
    // pueda mostrar la descripción sin tener que volver a buscarla
    const articulo = {
        areaId,
        categoriaId,
        descripcion,
        activo
    }


    if (modal.dataset.modo === 'crear') {
        try {
            const respuesta = await fetch(`${BACKEND_URL}/articulos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(articulo)
            });

            if (!respuesta.ok) {
                throw new Error(`Error en la petición: ${respuesta.status}`);
            }
            alert('Categoria creada correctamente')

        } catch (error) {
            alert
                ('Ocurrio un error al guardar la categoria')
        }
    } else {
        const idArticulo = modal.dataset.idx;
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`${BACKEND_URL}/articulos/${idArticulo}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(articulo)
            });

            if (!respuesta.ok) {
                throw new Error(`Error en la petición: ${respuesta.status}`);
            }
            alert('Categoria ACTUALIZADA correctamente')

        } catch (error) {
            console.log("🚀 ~ guardarArticulo ~ error:", error)
            alert
                ('Ocurrio error al actualizar el articulo')
        }
    }

    document.getElementById('articulo-form').reset();
    Modal.getInstance(modal).hide();
    renderTabla();
}

// ----------------------------------------------------
// Render de la tabla
// ----------------------------------------------------
async function renderTabla() {
    try {
        const response = await fetch(`${BACKEND_URL}/articulos`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        articulos = await response.json();
    } catch (error) {
        console.error('Ocurrio un error al recuperar las categorias')
    }
    tbody.innerHTML = articulos.map((art, idx) => {
        // Soporta ambas formas: objeto entero (nuevo) o solo id (viejo)
        return `
        <tr>
          <th scope="row">${art.id_articulo}</th>
          <td>${art?.area?.descripcion}</td>
          <td>${art?.categoria?.descripcion}</td>
          <td>${art.descripcion}</td>
          <td>
            ${art.activo
                ? '<span class="badge bg-success">Activa</span>'
                : '<span class="badge bg-secondary">Inactiva</span>'}
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary" data-action="editar" data-idx="${art.id_articulo}">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-idx="${art.id_articulo}">
              <i class="fa fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
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
window.goToMenu = goToMenu;

renderTabla();