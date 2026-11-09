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
        const response = await fetch(`${BACKEND_URL}/areas`,{
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

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
        const response = await fetch(`${BACKEND_URL}/categories`,{
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

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

function crearOpcion(value, texto) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = texto;
    return opt;
}

function reiniciarSelect(select, textoPlaceholder) {
    const placeholder = crearOpcion('', textoPlaceholder);
    placeholder.disabled = true;
    placeholder.selected = true;
    select.replaceChildren(placeholder);
}

function poblarSelectCategorias() {
    const select = document.getElementById('categoria');
    reiniciarSelect(select, 'Selecciona una categoría');
    categorias.forEach(cat => {
        select.appendChild(crearOpcion(cat.id_categoria, cat.descripcion));
    });
}

function poblarSelectAreas() {
    const select = document.getElementById('area');
    reiniciarSelect(select, 'Selecciona un área');
    areas.forEach(a => {
        select.appendChild(crearOpcion(a.id_area, a.descripcion));
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
    // READ: pedimos el artículo puntual al backend (consume la API).
    let art = null;
    try {
        const response = await fetch(`${BACKEND_URL}/articulos/${idArticulo}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        art = await response.json();
    } catch (error) {
        console.error('Ocurrio un error al recuperar el articulo', error);
        return;
    }

    document.getElementById('createModalTitle').textContent = 'Editar Artículo';

    // Esperamos a que los <select> se pueblen antes de setear los valores
    poblarSelectCategorias();
    poblarSelectAreas();

    // Cargamos los valores actuales del artículo
    document.getElementById('descripcion').value = art.descripcion;
    document.getElementById('categoria').value = art.categoria?.id_categoria ?? art.id_categoria;
    document.getElementById('area').value = art.area?.id_area ?? art.id_area;
    document.getElementById('flexCheckChecked').checked = art.activo;

    // Mostramos el archivo que ya tiene el artículo (si tiene)
    limpiarPreview();
    if (art.archivo) mostrarArchivo(art.archivo);

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

        await respuesta.json();

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

const formData = new FormData();

formData.append('descripcion', descripcion);
formData.append('areaId', areaId);
formData.append('categoriaId', categoriaId);
formData.append('activo', activo);


const archivo = document.getElementById('formFile').files[0];

if (archivo) {
    formData.append('archivo', archivo);
}

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
  


    if (modal.dataset.modo === 'crear') {
        try {
            const respuesta = await fetch(`${BACKEND_URL}/articulos`, {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!respuesta.ok) {
                throw new Error(`Error en la petición: ${respuesta.status}`);
            }
            alert('Articulo creado correctamente')

        } catch (error) {
            alert
                ('Ocurrio un error al guardar el articulo')
        }
    } else {
        const idArticulo = modal.dataset.idx;
        // Solo pedimos borrar si el usuario quitó el archivo y no eligió uno nuevo
        // (si eligió uno nuevo, el backend ya reemplaza el anterior)
        if (eliminarArchivoActual && !archivo) {
            formData.append('eliminarArchivo', 'true');
        }
        try {
            const respuesta = await fetch(`${BACKEND_URL}/articulos/${idArticulo}`, {
                method: 'PATCH',
                headers: {
                    // Sin Content-Type: el navegador arma el multipart con su boundary
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!respuesta.ok) {
                throw new Error(`Error en la petición: ${respuesta.status}`);
            }
            alert('Articulo ACTUALIZADO correctamente')

        } catch (error) {
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
    // Vaciamos la tabla y armamos cada fila con nodos (textContent no interpreta HTML)
    tbody.replaceChildren();
    articulos.forEach(art => tbody.appendChild(crearFilaArticulo(art)));
}

function crearCelda(texto, tag = 'td') {
    const celda = document.createElement(tag);
    celda.textContent = texto ?? '';
    return celda;
}

function crearBotonAccion(accion, idArticulo, claseBtn, icono, titulo) {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm ${claseBtn}`;
    btn.dataset.action = accion;
    btn.dataset.idx = idArticulo;
    btn.title = titulo;

    const i = document.createElement('i');
    i.className = `bi ${icono}`;
    btn.appendChild(i);
    return btn;
}

function crearFilaArticulo(art) {
    const tr = document.createElement('tr');

    const th = crearCelda(art.id_articulo, 'th');
    th.scope = 'row';

    const tdEstado = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge ${art.activo ? 'bg-success' : 'bg-secondary'}`;
    badge.textContent = art.activo ? 'Activa' : 'Inactiva';
    tdEstado.appendChild(badge);

    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'mobile-buttons';
    tdAcciones.append(
        crearBotonAccion('editar', art.id_articulo, 'btn-outline-primary', 'bi-pencil-square', 'Editar'),
        ' ',
        crearBotonAccion('eliminar', art.id_articulo, 'btn-outline-danger', 'bi-trash', 'Eliminar')
    );

    tr.append(
        th,
        crearCelda(art?.area?.descripcion),
        crearCelda(art?.categoria?.descripcion),
        crearCelda(art.descripcion),
        tdEstado,
        tdAcciones
    );
    return tr;
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


const inputArchivo = document.getElementById('formFile');
const preview = document.getElementById('preview');
const previewOverlay = document.getElementById('preview-overlay');
const previewAmpliada = document.getElementById('preview-ampliada');
const archivoActual = document.getElementById('archivo-actual');
const archivoLink = document.getElementById('archivo-link');
const btnQuitarArchivo = document.getElementById('btn-quitar-archivo');

// true cuando el usuario quitó el archivo que ya tenía el artículo
let eliminarArchivoActual = false;

function limpiarPreview() {
    if (preview.src.startsWith('blob:')) URL.revokeObjectURL(preview.src);
    preview.removeAttribute('src');
    preview.hidden = true;
    archivoLink.removeAttribute('href');
    archivoLink.textContent = '';
    archivoLink.hidden = true;
    archivoActual.hidden = true;
    previewOverlay.hidden = true;
}

// Muestra miniatura si es imagen, o un link con el nombre si es otro tipo (ej. PDF)
function mostrarArchivo({ url, tipo, nombre }) {
    if (tipo?.startsWith('image/') && url) {
        preview.src = url;
        preview.hidden = false;
    } else {
        archivoLink.textContent = nombre ?? 'Ver archivo';
        if (url) archivoLink.href = url;
        archivoLink.hidden = false;
    }
    archivoActual.hidden = false;
}

inputArchivo.addEventListener('change', () => {
    const archivo = inputArchivo.files[0];
    limpiarPreview();
    if (!archivo) return;

    // El archivo nuevo reemplaza al actual
    eliminarArchivoActual = true;
    mostrarArchivo({
        url: archivo.type.startsWith('image/') ? URL.createObjectURL(archivo) : null,
        tipo: archivo.type,
        nombre: archivo.name
    });
});

// Quita el archivo: tanto el recién elegido como el que ya estaba guardado
btnQuitarArchivo.addEventListener('click', () => {
    inputArchivo.value = '';
    limpiarPreview();
    eliminarArchivoActual = true;
});

// Al tocar la miniatura se muestra la imagen ampliada
preview.addEventListener('click', () => {
    previewAmpliada.src = preview.src;
    previewOverlay.hidden = false;
});

// Cualquier click sobre la imagen ampliada la cierra
previewOverlay.addEventListener('click', () => {
    previewOverlay.hidden = true;
});

modal.addEventListener('hidden.bs.modal', () => {
    document.getElementById('articulo-form').reset();
    limpiarPreview();
    eliminarArchivoActual = false;
});

window.abrirModalCrear = abrirModalCrear;
window.abrirModalEditar = abrirModalEditar;
window.eliminarArticulo = eliminarArticulo;
window.guardarArticulo = guardarArticulo;
window.goToMenu = goToMenu;

renderTabla();