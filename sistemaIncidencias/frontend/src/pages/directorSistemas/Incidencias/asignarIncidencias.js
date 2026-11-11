import {
  apiFetch,
  ESTADOS,
  ESTADO_BADGE,
  PRIORIDAD_BADGE,
  crearBadge,
  formatearFecha,
  nombreCompleto,
  mostrarAlerta
} from '../director.js';

import { ROLES, idRolPorNombre } from '../../../utils/roles.js';

let incidencias = [];
let tecnicos = [];
let idRolSistemas = null; // se resuelve con GET /roles
let incidenciaSeleccionada = null;

// Referencias al DOM
const tbody = document.getElementById('tabla-incidencias');
const contador = document.getElementById('contador');
const alertas = document.getElementById('alertas');
const filtroEstado = document.getElementById('filtro-estado');
const filtroTexto = document.getElementById('filtro-texto');

const modalAsignar = new window.bootstrap.Modal(document.getElementById('modal-asignar'));
const formAsignar = document.getElementById('form-asignar');
const selectTecnico = document.getElementById('asignar-tecnico');
const asignarResumen = document.getElementById('asignar-resumen');
const asignarPedido = document.getElementById('asignar-pedido');
const asignarError = document.getElementById('asignar-error');
const btnConfirmarAsignar = document.getElementById('asignar-confirmar');

// ---------------------------------------------------------------------
// Carga de datos
// ---------------------------------------------------------------------

async function cargarDatos() {
  try {
    const [listaIncidencias, roles] = await Promise.all([
      apiFetch('/incidencias'),
      apiFetch('/roles')
    ]);
    idRolSistemas = idRolPorNombre(roles, ROLES.SISTEMAS);
    if (idRolSistemas === undefined) {
      throw new Error(`No existe el rol "${ROLES.SISTEMAS}" en la base de datos.`);
    }
    const listaTecnicos = await apiFetch(`/usuarios?rol=${idRolSistemas}`);
    // Mas nuevas primero
    incidencias = listaIncidencias.sort((a, b) => b.id_incidencia - a.id_incidencia);
    tecnicos = listaTecnicos;
    renderizarTabla();
  } catch (error) {
    mostrarAlerta(alertas, error.message, 'danger');
    mostrarFilaMensaje('No se pudieron cargar las incidencias.');
  }
}

// ---------------------------------------------------------------------
// Tabla
// ---------------------------------------------------------------------

// Mientras nadie de sistemas la tome, la incidencia queda asignada al director
function estaAsignadaATecnico(inc) {
  return inc.asignado_a?.rol === idRolSistemas;
}

function filtrarIncidencias() {
  const estado = Number(filtroEstado.value);
  const texto = filtroTexto.value.trim().toLowerCase();

  return incidencias.filter((inc) => {
    if (estado && inc.estado?.id_estado !== estado) return false;
    if (!texto) return true;

    const campos = [
      String(inc.id_incidencia),
      inc.articulo?.descripcion,
      inc.descripcion_pedido,
      nombreCompleto(inc.creador)
    ];
    return campos.some((campo) => campo?.toLowerCase().includes(texto));
  });
}

function crearCelda(contenido, clases = '') {
  const td = document.createElement('td');
  if (clases) td.className = clases;
  if (contenido instanceof Node) {
    td.appendChild(contenido);
  } else {
    td.textContent = contenido ?? '-';
  }
  return td;
}

function crearBoton({ accion, id, clase, icono, texto, habilitado, titulo }) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = `btn btn-sm ${clase}`;
  boton.dataset.accion = accion;
  boton.dataset.id = id;
  boton.disabled = !habilitado;
  boton.title = titulo;
  boton.setAttribute('aria-label', `${titulo} #${id}`);

  const i = document.createElement('i');
  i.className = `bi ${icono}`;
  i.setAttribute('aria-hidden', 'true');

  const span = document.createElement('span');
  span.className = 'texto-boton ms-1';
  span.textContent = texto;

  boton.append(i, span);
  return boton;
}

function crearFila(inc) {
  const idEstado = inc.estado?.id_estado;
  const fila = document.createElement('tr');

  const asignado = estaAsignadaATecnico(inc) ? nombreCompleto(inc.asignado_a) : 'Sin asignar';
  const celdaAsignado = crearCelda(asignado, 'd-none d-md-table-cell');
  if (!estaAsignadaATecnico(inc)) celdaAsignado.classList.add('text-body-secondary', 'fst-italic');

  const celdaPedido = crearCelda(inc.descripcion_pedido, 'd-none d-md-table-cell celda-texto');
  celdaPedido.title = inc.descripcion_pedido ?? '';

  const puedeAsignar = [ESTADOS.PENDIENTE, ESTADOS.EN_PROCESO].includes(idEstado);
  const puedeCancelar = idEstado === ESTADOS.PENDIENTE;

  const acciones = document.createElement('div');
  acciones.className = 'd-inline-flex gap-1';
  acciones.append(
    crearBoton({
      accion: 'asignar',
      id: inc.id_incidencia,
      clase: 'btn-outline-primary',
      icono: 'bi-person-check',
      texto: estaAsignadaATecnico(inc) ? 'Reasignar' : 'Asignar',
      habilitado: puedeAsignar,
      titulo: 'Asignar incidencia'
    }),
    crearBoton({
      accion: 'cancelar',
      id: inc.id_incidencia,
      clase: 'btn-outline-danger',
      icono: 'bi-x-circle',
      texto: 'Cancelar',
      habilitado: puedeCancelar,
      titulo: 'Cancelar incidencia'
    })
  );

  fila.append(
    crearCelda(`#${inc.id_incidencia}`, 'fw-semibold'),
    crearCelda(formatearFecha(inc.creado), 'd-none d-xl-table-cell text-nowrap'),
    crearCelda(inc.articulo?.descripcion),
    celdaPedido,
    crearCelda(nombreCompleto(inc.creador), 'd-none d-xl-table-cell'),
    crearCelda(crearBadge(PRIORIDAD_BADGE, inc.prioridad)),
    crearCelda(crearBadge(ESTADO_BADGE, idEstado)),
    celdaAsignado,
    crearCelda(acciones, 'text-end acciones')
  );
  return fila;
}

function mostrarFilaMensaje(mensaje) {
  const fila = document.createElement('tr');
  const celda = crearCelda(mensaje, 'text-center text-body-secondary py-4');
  celda.colSpan = 9;
  fila.appendChild(celda);
  tbody.replaceChildren(fila);
}

function renderizarTabla() {
  const visibles = filtrarIncidencias();
  contador.textContent = `${visibles.length} de ${incidencias.length} incidencias`;

  if (visibles.length === 0) {
    mostrarFilaMensaje(incidencias.length === 0
      ? 'Todavía no hay incidencias cargadas.'
      : 'No hay incidencias que coincidan con los filtros.');
    return;
  }

  tbody.replaceChildren(...visibles.map(crearFila));
}

// ---------------------------------------------------------------------
// Asignar
// ---------------------------------------------------------------------

function abrirModalAsignar(inc) {
  incidenciaSeleccionada = inc;
  asignarError.textContent = '';
  asignarResumen.textContent = `Incidencia #${inc.id_incidencia} · ${inc.articulo?.descripcion ?? ''}`;
  asignarPedido.textContent = inc.descripcion_pedido ?? '';

  const opciones = [new Option('Seleccioná un empleado…', '')];
  for (const tecnico of tecnicos) {
    opciones.push(new Option(nombreCompleto(tecnico), tecnico.id_usuario));
  }
  selectTecnico.replaceChildren(...opciones);

  if (estaAsignadaATecnico(inc)) {
    selectTecnico.value = String(inc.asignado_a.id_usuario);
  }

  const hayTecnicos = tecnicos.length > 0;
  selectTecnico.disabled = !hayTecnicos;
  btnConfirmarAsignar.disabled = !hayTecnicos;
  if (!hayTecnicos) {
    asignarError.textContent = 'No hay empleados de sistemas activos para asignar.';
  }

  modalAsignar.show();
}

formAsignar.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const idTecnico = Number(selectTecnico.value);

  if (!idTecnico) {
    asignarError.textContent = 'Elegí un empleado de sistemas.';
    selectTecnico.focus();
    return;
  }

  btnConfirmarAsignar.disabled = true;
  btnConfirmarAsignar.textContent = 'Asignando…';
  try {
    await apiFetch(`/incidencias/${incidenciaSeleccionada.id_incidencia}/asignar`, {
      method: 'PUT',
      body: JSON.stringify({ asignado_a: idTecnico })
    });
    const tecnico = tecnicos.find((t) => t.id_usuario === idTecnico);
    modalAsignar.hide();
    mostrarAlerta(alertas,
      `Incidencia #${incidenciaSeleccionada.id_incidencia} asignada a ${nombreCompleto(tecnico)}.`);
    await cargarDatos();
  } catch (error) {
    asignarError.textContent = error.message;
  } finally {
    btnConfirmarAsignar.disabled = false;
    btnConfirmarAsignar.textContent = 'Asignar';
  }
});

// ---------------------------------------------------------------------
// Cancelar
// ---------------------------------------------------------------------

async function cancelarIncidencia(inc, boton) {
  const confirmado = window.confirm(
    `¿Cancelar la incidencia #${inc.id_incidencia} (${inc.articulo?.descripcion ?? ''})?\n` +
    'Se le avisará por mail a quien la creó.'
  );
  if (!confirmado) return;

  boton.disabled = true;
  try {
    const respuesta = await apiFetch(`/incidencias/${inc.id_incidencia}/cancelar`, { method: 'PUT' });
    const aviso = respuesta.notificado
      ? 'Se notificó por mail al creador.'
      : 'No se pudo enviar el mail al creador.';
    mostrarAlerta(alertas, `Incidencia #${inc.id_incidencia} cancelada. ${aviso}`,
      respuesta.notificado ? 'success' : 'warning');
    await cargarDatos();
  } catch (error) {
    mostrarAlerta(alertas, error.message, 'danger');
    boton.disabled = false;
  }
}

// ---------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------

tbody.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  const inc = incidencias.find((i) => i.id_incidencia === Number(boton.dataset.id));
  if (!inc) return;

  if (boton.dataset.accion === 'asignar') abrirModalAsignar(inc);
  if (boton.dataset.accion === 'cancelar') cancelarIncidencia(inc, boton);
});

filtroEstado.addEventListener('change', renderizarTabla);
filtroTexto.addEventListener('input', renderizarTabla);

cargarDatos();
