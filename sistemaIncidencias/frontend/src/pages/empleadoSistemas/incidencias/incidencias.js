const BACKEND_URL = 'http://localhost:3000/api/incidencias';
const token = localStorage.getItem('token');

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
function verIncidencia(id) {
    console.log('Ver Incidencia:', id);
    // TODO: abrir modal con detalle o navegar al detalle
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
