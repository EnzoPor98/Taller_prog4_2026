// Modulo compartido por todas las paginas del Director de Sistemas:
// - protege las paginas (solo entra un usuario logueado con rol Director)
// - agrega los links de navegacion al navbar
// - helpers para llamar a la API y armar la interfaz

const API_URL = `${import.meta.env.VITE_API_URL}/api`;
import { ROLES } from '../../utils/roles.js';

const PAGINAS = [
    { texto: 'Dashboard', icono: 'bi-speedometer2', href: '/src/pages/directorSistemas/Dashboard/Inicio.html' },
    { texto: 'Incidencias', icono: 'bi-list-check', href: '/src/pages/directorSistemas/Incidencias/asignarIncidencias.html' },
    { texto: 'Reportes', icono: 'bi-file-earmark-pdf', href: '/src/pages/directorSistemas/Reportes/Reportes.html' },
];

export const ESTADOS = Object.freeze({
    PENDIENTE: 1,
    EN_PROCESO: 2,
    RESUELTA: 3,
    CANCELADA: 4
});

export const ESTADO_BADGE = {
    1: { texto: 'Pendiente', clase: 'text-bg-warning' },
    2: { texto: 'En Proceso', clase: 'text-bg-primary' },
    3: { texto: 'Resuelta', clase: 'text-bg-success' },
    4: { texto: 'Cancelada', clase: 'text-bg-secondary' }
};

export const PRIORIDAD_BADGE = {
    1: { texto: 'Alta', clase: 'text-bg-danger' },
    2: { texto: 'Media', clase: 'text-bg-warning' },
    3: { texto: 'Baja', clase: 'text-bg-success' }
};

// ---------------------------------------------------------------------
// Sesion y proteccion de la pagina
// ---------------------------------------------------------------------

const token = sessionStorage.getItem('token');
let usuario = null;
try {
    usuario = JSON.parse(sessionStorage.getItem('usuario'));
} catch {
    usuario = null;
}

export function cerrarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '/index.html';
}

if (!token || usuario?.rol_nombre !== ROLES.DIRECTOR) {
    cerrarSesion();
    // Corta la ejecucion del script de la pagina que importa este modulo
    throw new Error('Acceso no autorizado: se requiere rol Director');
}

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------

// fetch con el token y manejo de errores uniforme.
// Devuelve el JSON de la respuesta o lanza un Error con el mensaje de la API.
export async function apiFetch(ruta, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...opciones.headers
        }
    });

    const esJson = respuesta.headers.get('content-type')?.includes('application/json');
    const datos = esJson ? await respuesta.json() : null;

    const sesionInvalida = respuesta.status === 401
        || (respuesta.status === 403 && datos?.mensaje === 'Token inválido o expirado');
    if (sesionInvalida) {
        cerrarSesion();
        throw new Error('La sesión expiró. Volvé a iniciar sesión.');
    }

    if (!respuesta.ok) {
        throw new Error(datos?.mensaje || `Error HTTP ${respuesta.status}`);
    }

    return datos;
}

// Descarga un archivo (por ejemplo el PDF del informe) enviando el token.
// Como la descarga necesita el header Authorization, no alcanza con un <a href>:
// se pide con fetch, se arma un Blob y se dispara la descarga con un link temporal.
export async function apiDescargar(ruta, nombrePorDefecto = 'archivo') {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!respuesta.ok) {
        const esJson = respuesta.headers.get('content-type')?.includes('application/json');
        const datos = esJson ? await respuesta.json() : null;
        if (respuesta.status === 401 || datos?.mensaje === 'Token inválido o expirado') {
            cerrarSesion();
            throw new Error('La sesión expiró. Volvé a iniciar sesión.');
        }
        throw new Error(datos?.mensaje || `Error HTTP ${respuesta.status}`);
    }

    // El nombre viene en Content-Disposition: attachment; filename="..."
    const disposicion = respuesta.headers.get('content-disposition') ?? '';
    const nombre = disposicion.match(/filename="?([^"]+)"?/)?.[1] ?? nombrePorDefecto;

    const blob = await respuesta.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return nombre;
}

// ---------------------------------------------------------------------
// Helpers de interfaz
// ---------------------------------------------------------------------

export function crearBadge(mapa, valor) {
    const info = mapa[valor] ?? { texto: 'Desconocido', clase: 'text-bg-light' };
    const badge = document.createElement('span');
    badge.className = `badge ${info.clase}`;
    badge.textContent = info.texto;
    return badge;
}

export function formatearFecha(fechaIso) {
    if (!fechaIso) return '-';
    return new Date(fechaIso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

export function nombreCompleto(persona) {
    if (!persona) return '-';
    return `${persona.nombres} ${persona.apellidos}`;
}

// Muestra un alert de Bootstrap que se puede cerrar
export function mostrarAlerta(contenedor, mensaje, tipo = 'success') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute('role', tipo === 'danger' ? 'alert' : 'status');
    alerta.textContent = mensaje;

    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'btn-close';
    cerrar.setAttribute('data-bs-dismiss', 'alert');
    cerrar.setAttribute('aria-label', 'Cerrar');
    alerta.appendChild(cerrar);

    contenedor.replaceChildren(alerta);
}

// ---------------------------------------------------------------------
// Navegacion: agrega los links al navbar compartido
// ---------------------------------------------------------------------

function agregarLinks() {
    const nav = document.querySelector('#navbar-placeholder .navbar-nav');
    if (!nav || nav.dataset.director) return Boolean(nav);

    nav.dataset.director = 'true';
    for (const pagina of PAGINAS) {
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = pagina.href;

        const icono = document.createElement('i');
        icono.className = `bi ${pagina.icono} me-1`;
        icono.setAttribute('aria-hidden', 'true');
        link.append(icono, pagina.texto);

        if (window.location.pathname === pagina.href) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
        nav.appendChild(link);
    }
    return true;
}

// El navbar se inyecta en DOMContentLoaded; si todavia no esta, esperamos a que aparezca
document.addEventListener('DOMContentLoaded', () => {
    if (agregarLinks()) return;

    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    const observer = new MutationObserver(() => {
        if (agregarLinks()) observer.disconnect();
    });
    observer.observe(placeholder, { childList: true, subtree: true });
});
