import Chart from 'chart.js/auto';
import {
  apiFetch,
  ESTADO_BADGE,
  crearBadge,
  formatearFecha,
  mostrarAlerta
} from '../director.js';

// Mismos colores que los badges de Bootstrap usados en el resto de las pantallas
const COLOR_ESTADO = {
  1: '#ffc107', // Pendiente
  2: '#0d6efd', // En Proceso
  3: '#198754', // Resuelta
  4: '#6c757d'  // Cancelada
};

const ID_TOTAL_ESTADO = {
  1: 'total-pendientes',
  2: 'total-en-proceso',
  3: 'total-resueltas',
  4: 'total-canceladas'
};

const URL_INCIDENCIAS = '/src/pages/directorSistemas/Incidencias/asignarIncidencias.html';

// Referencias al DOM
const alertas = document.getElementById('alertas');
const formFechas = document.getElementById('form-fechas');
const inputDesde = document.getElementById('fecha-desde');
const inputHasta = document.getElementById('fecha-hasta');
const resumenFechas = document.getElementById('resumen-fechas');
const totalPrioritarias = document.getElementById('total-prioritarias');
const listaPrioritarias = document.getElementById('lista-prioritarias');

let graficoEstados = null;
let graficoFechas = null;

// ---------------------------------------------------------------------
// Carga de datos
// ---------------------------------------------------------------------

async function cargarDashboard({ desde, hasta } = {}) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const consulta = params.toString() ? `?${params}` : '';

  try {
    const datos = await apiFetch(`/incidencias/datos-dashboard${consulta}`);
    renderizarTotales(datos.porEstado);
    renderizarGraficoEstados(datos.porEstado, datos.total);
    renderizarGraficoFechas(datos.porFecha);
    renderizarPrioritarias(datos.prioritarias);
  } catch (error) {
    mostrarAlerta(alertas, error.message, 'danger');
  }
}

// ---------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------

function renderizarTotales(porEstado) {
  for (const fila of porEstado) {
    const elemento = document.getElementById(ID_TOTAL_ESTADO[fila.id_estado]);
    if (elemento) elemento.textContent = fila.total;
  }
}

function renderizarGraficoEstados(porEstado, total) {
  const datos = {
    labels: porEstado.map((fila) => fila.estado),
    datasets: [{
      data: porEstado.map((fila) => fila.total),
      backgroundColor: porEstado.map((fila) => COLOR_ESTADO[fila.id_estado] ?? '#adb5bd'),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  if (graficoEstados) {
    graficoEstados.data = datos;
    graficoEstados.options.plugins.title.text = `Total: ${total}`;
    graficoEstados.update();
    return;
  }

  graficoEstados = new Chart(document.getElementById('grafico-estados'), {
    type: 'doughnut',
    data: datos,
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: `Total: ${total}` }
      }
    }
  });
}

// "2026-11-09" -> "09/11"
const etiquetaDia = (fecha) => fecha.slice(8, 10) + '/' + fecha.slice(5, 7);
const fechaLegible = (fecha) => fecha.split('-').reverse().join('/');

function renderizarGraficoFechas(porFecha) {
  // El backend devuelve el rango usado (por defecto los ultimos 30 dias)
  inputDesde.value = porFecha.desde;
  inputHasta.value = porFecha.hasta;

  const totalRango = porFecha.datos.reduce((suma, dia) => suma + dia.total, 0);
  resumenFechas.textContent =
    `${totalRango} incidencias creadas del ${fechaLegible(porFecha.desde)} al ${fechaLegible(porFecha.hasta)}.`;

  const datos = {
    labels: porFecha.datos.map((dia) => etiquetaDia(dia.fecha)),
    datasets: [{
      label: 'Incidencias creadas',
      data: porFecha.datos.map((dia) => dia.total),
      backgroundColor: '#2C5C80',
      borderRadius: 4
    }]
  };

  if (graficoFechas) {
    graficoFechas.data = datos;
    graficoFechas.update();
    return;
  }

  graficoFechas = new Chart(document.getElementById('grafico-fechas'), {
    type: 'bar',
    data: datos,
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
        x: { ticks: { maxRotation: 0, autoSkip: true } }
      }
    }
  });
}

function renderizarPrioritarias(prioritarias) {
  totalPrioritarias.textContent = prioritarias.total;

  if (prioritarias.items.length === 0) {
    const vacio = document.createElement('li');
    vacio.className = 'list-group-item text-body-secondary';
    vacio.textContent = 'No hay incidencias de prioridad alta abiertas.';
    listaPrioritarias.replaceChildren(vacio);
    return;
  }

  const items = prioritarias.items.map((inc) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2';

    const info = document.createElement('div');
    const titulo = document.createElement('div');
    titulo.className = 'fw-semibold';
    titulo.textContent = `#${inc.id_incidencia} · ${inc.articulo}`;

    const detalle = document.createElement('div');
    detalle.className = 'small text-body-secondary';
    detalle.textContent =
      `${inc.descripcion_pedido ?? ''} — ${formatearFecha(inc.creado)} — ${inc.asignado_a ?? 'Sin asignar'}`;
    info.append(titulo, detalle);

    li.append(info, crearBadge(ESTADO_BADGE, inc.id_estado));
    return li;
  });

  if (prioritarias.total > prioritarias.items.length) {
    const mas = document.createElement('li');
    mas.className = 'list-group-item';
    const link = document.createElement('a');
    link.href = URL_INCIDENCIAS;
    link.textContent = `Ver las ${prioritarias.total} en Gestión de incidencias`;
    mas.appendChild(link);
    items.push(mas);
  }

  listaPrioritarias.replaceChildren(...items);
}

// ---------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------

formFechas.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const desde = inputDesde.value;
  const hasta = inputHasta.value;

  if (desde && hasta && desde > hasta) {
    mostrarAlerta(alertas, 'La fecha "desde" no puede ser posterior a "hasta".', 'warning');
    return;
  }
  alertas.replaceChildren();
  cargarDashboard({ desde, hasta });
});

cargarDashboard();
