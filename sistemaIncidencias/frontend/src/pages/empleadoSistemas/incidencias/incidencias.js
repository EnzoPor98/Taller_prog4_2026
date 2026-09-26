const BACKEND_URL = 'http://localhost:3000/api/incidencias';
const token = localStorage.getItem('token');
// Bootstrap viene expuesto en window.bootstrap desde /src/main.js
// (cargado como módulo, así que se garantiza antes que este script).
const { Modal } = window.bootstrap;

let incidencias = [];


// Referencias al DOM
const tbody = document.getElementById('incidencias-tbody');
// const modal = document.getElementById('createModal');

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
    if (!confirm(`¿Cerrar la incidencia #${id}?`)) return;
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
    console.log('Ver Incidencia:', id);
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
        console.log(inc);

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

        const modal = new Modal(document.getElementById('viewModal'));
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

    tbody.innerHTML = incidencias.map((incidencia) => {
        return `
    <tr>
      <td>${incidencia.id_incidencia}</td>
      <td>
        <span class="badge bg-${mapBadge(incidencia.prioridad)}">${mapPriority(incidencia.prioridad)}</span>
      </td>
      <td>${incidencia.descripcion_pedido}</td>
      <td>${incidencia.creador.nombres} ${incidencia.creador.apellidos}</td>
      <td>${incidencia.asignado_a.nombres} ${incidencia.asignado_a.apellidos}</td>
      <td>${formatearFecha(incidencia.creado)}</td>
      <td>${incidencia.estado.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-action="ver" data-id="${incidencia.id_incidencia}">
          <i class="fa fa-eye fa-lg"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="cerrar" data-id="${incidencia.id_incidencia}">
          <i class="fa fa-lock fa-lg"></i>
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

renderTabla();

window.verIncidencia = verIncidencia;
window.cerrarIncidencia = cerrarIncidencia;
window.goToMenu = goToMenu;
