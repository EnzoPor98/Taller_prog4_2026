import { EVENTOS, escucharEvento } from '../../../socket/socket-client.js';

const BACKEND_URL = `${import.meta.env.VITE_API_URL}/api/incidencias`;
const token = sessionStorage.getItem('token');
// Bootstrap viene expuesto en window.bootstrap desde /src/main.js
// (cargado como módulo, así que se garantiza antes que este script).
const { Modal } = window.bootstrap;

let incidencias = [];


// Referencias al DOM
const tbody = document.getElementById('incidencias-tbody');
// const modal = document.getElementById('createModal');

// Referencias del modal de nueva asignacion
const modalAsignacion = document.getElementById('asignacionModal');
const btnVerAsignacion = document.getElementById('asignacion-ver');
let idIncidenciaAsignada = null;

function goToMenu() {
    window.location.href = '/src/pages/empleadoSistemas/empleadoSistemas.html';
}
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-AR');
}
function mapBadge(prioridad) {
    switch (prioridad) {
        case 1:
            return 'danger';
        case 2:
            return 'warning';
        case 3:
            return 'success';
        default:
            return 'info';
    }
}
function mapPriority(prioridad) {
    switch (prioridad) {
        case 1:
            return 'Alta';
        case 2:
            return 'Media';
        case 3:
            return 'Baja';
        default:
            return 'Sin Prioridad';
    }
}

// Reemplazar los console.log por llamadas reales, por ejemplo:

async function cerrarIncidencia(id) {
    if (!confirm(`¿Finalizar incidencia #${id}?`)) return;
    const motivo="El usuario responsable dio por finalizada la tarea"
    try {
        const res = await fetch(`${BACKEND_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                descripcion_resolucion : motivo,
                finalizada:true
            })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await renderTabla(); // refrescar la lista
    } catch (err) {
        console.error('Error cerrando incidencia:', err);
    }
}
async function verIncidencia(id) {
    try {
        const response = await fetch(`${BACKEND_URL}/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const inc = await response.json();

        // Popular el modal
        document.getElementById('viewModalTitle').textContent = `Detalle de Incidencia #${inc.id_incidencia}`;

        const badge = document.getElementById('view-prioridad-badge');
        badge.className = `badge bg-${mapBadge(inc.prioridad)}`;
        badge.textContent = mapPriority(inc.prioridad);

        document.getElementById('view-estado').textContent = inc.estado?.descripcion ?? '-';
        document.getElementById('view-descripcion-pedido').textContent = inc.descripcion_pedido ?? '-';
        document.getElementById('view-descripcion-resolucion').textContent = inc.descripcion_resolucion ?? '-';
        document.getElementById('view-articulo').textContent = inc.articulo?.descripcion ?? '-';
        document.getElementById('view-creador').textContent = inc.creador
            ? `${inc.creador.nombres} ${inc.creador.apellidos}`
            : '-';
        document.getElementById('view-asignado').textContent = inc.asignado_a
            ? `${inc.asignado_a.nombres} ${inc.asignado_a.apellidos}`
            : '-';
        document.getElementById('view-creado').textContent = formatearFecha(inc.creado);

        // getOrCreateInstance reusa la instancia de Bootstrap del modal.
        // Con `new Modal(...)` se crearia una instancia nueva en cada llamada,
        // dejando la anterior huerfana y duplicando el backdrop.
        const modal = Modal.getOrCreateInstance(document.getElementById('viewModal'));
        modal.show();
    } catch (err) {
        console.error('Error obteniendo incidencia:', err);
    }
}
// --- Render de la tabla ----------------------------------------------

async function renderTabla() {
    try {
        const response = await fetch(`${BACKEND_URL}`,
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
        incidencias = await response.json();
    } catch (error) {
        console.error('Ocurrio un error al recuperar las categorias')
    }
    
    // <td>${incidencia.asignado_a.nombres} ${incidencia.asignado_a.apellidos}</td>

    // NOTA: Se controla el disabled con resuela(asi esta en el dump original de la base), y resuelta. 
    // Para nada optimo y suceptible a errores
    tbody.innerHTML = incidencias.map((incidencia) => {
        return `
    <tr>
      <td>${incidencia.id_incidencia}</td>
      <td>
        <span class="badge bg-${mapBadge(incidencia.prioridad)}">${mapPriority(incidencia.prioridad)}</span>
      </td>
      <td>${incidencia.descripcion_pedido}</td>
      <td>${incidencia.creador.nombres} ${incidencia.creador.apellidos}</td>
      <td class="mobile-hide">${formatearFecha(incidencia.creado)}</td>
      <td class="mobile-hide">${incidencia.estado.descripcion}</td>
      <td class="mobile-buttons">
        <button class="btn btn-sm btn-outline-primary" data-action="ver" data-id="${incidencia.id_incidencia}" title="Ver">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="cerrar" data-id="${incidencia.id_incidencia}" 
        ${["Resuelta", "Resuela"].includes(incidencia.estado.descripcion) ? "disabled" : ""}
        title="Cerrar">
          <i class="bi bi-lock"></i>
        </button>
      </td>
    </tr>
  `;
    }).join('');

}

tbody.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;

    const id = el.dataset.id;
    const action = el.dataset.action;

    if (action === 'ver') {
        verIncidencia(id);
    } else if (action === 'cerrar') {
        cerrarIncidencia(id);
    }
});

// ---------------------------------------------------------------------
// Tiempo real: nueva incidencia asignada
// ---------------------------------------------------------------------

// Espera a que un modal de Bootstrap termine su transicion (apertura o cierre).
//
// Importante: Bootstrap ignora hide() y show() mientras el modal esta en
// transicion, asi que hay que esperarlo antes de llamar a cualquiera de los dos.
// Se sondea en lugar de esperar un evento porque la duracion de la animacion
// depende de si la pestana esta en primer plano (el navegador la frena en segundo plano).
const esperarTransicion = (elemento) => new Promise((resolve) => {
    const revisar = () => {
        const modal = Modal.getInstance(elemento);
        if (!modal || !modal._isTransitioning) {
            resolve();
            return;
        }
        setTimeout(revisar, 50);
    };
    revisar();
});

// Cierra un modal de Bootstrap y espera a que termine de cerrarse.
const cerrarModal = async (elemento) => {
    await esperarTransicion(elemento);

    const modal = Modal.getInstance(elemento);
    if (!modal || !modal._isShown) return;

    await new Promise((resolve) => {
        elemento.addEventListener('hidden.bs.modal', resolve, { once: true });
        modal.hide();
    });
};

// Muestra el modal con el detalle de la incidencia que acaba de asignarse.
async function mostrarModalAsignacion(datos) {
    idIncidenciaAsignada = datos.id_incidencia ?? null;

    document.getElementById('asignacion-id').textContent = `#${datos.id_incidencia ?? '-'}`;
    document.getElementById('asignacion-descripcion').textContent = datos.descripcion_pedido ?? '-';
    document.getElementById('asignacion-articulo').textContent = datos.articulo ?? '-';
    document.getElementById('asignacion-area').textContent = datos.area ?? '-';
    document.getElementById('asignacion-creador').textContent = datos.creador ?? '-';
    document.getElementById('asignacion-estado').textContent = datos.estado ?? '-';

    const badge = document.getElementById('asignacion-prioridad-badge');
    badge.className = `badge bg-${mapBadge(datos.prioridad)}`;
    badge.textContent = mapPriority(datos.prioridad);

    // Si el modal de detalle ya esta abierto, se cierra para no superponerlos
    await cerrarModal(document.getElementById('viewModal'));

    // getOrCreateInstance evita crear una instancia nueva en cada asignacion
    Modal.getOrCreateInstance(modalAsignacion).show();
}

// El boton "Ver incidencia" del modal abre el detalle de la incidencia asignada.
// Primero se cierra el modal de asignacion y recien despues se abre el de detalle,
// para que los dos modales de Bootstrap no queden superpuestos.
btnVerAsignacion.addEventListener('click', async () => {
    if (!idIncidenciaAsignada) return;

    await cerrarModal(modalAsignacion);
    await verIncidencia(idIncidenciaAsignada);
});

// Cuando el Director asigna una incidencia, este empleado recibe un evento
// dedicado: se recarga la tabla y se muestra el modal informativo.
escucharEvento(EVENTOS.INCIDENCIA_RECIBIDA, async (datos) => {
    // Primero se recarga la tabla para que la incidencia ya figure en la lista
    await renderTabla();
    await mostrarModalAsignacion(datos);
});

renderTabla();

window.verIncidencia = verIncidencia;
window.cerrarIncidencia = cerrarIncidencia;
window.goToMenu = goToMenu;
