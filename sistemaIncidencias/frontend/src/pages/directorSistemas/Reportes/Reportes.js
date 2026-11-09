import { apiDescargar, mostrarAlerta } from '../director.js';

const form = document.getElementById('form-reporte');
const inputDesde = document.getElementById('reporte-desde');
const inputHasta = document.getElementById('reporte-hasta');
const selectEstado = document.getElementById('reporte-estado');
const btnDescargar = document.getElementById('btn-descargar');
const btnLimpiar = document.getElementById('btn-limpiar');
const alertas = document.getElementById('alertas');

const TEXTO_BOTON = btnDescargar.innerHTML;

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const desde = inputDesde.value;
  const hasta = inputHasta.value;
  const estado = selectEstado.value;

  if (desde && hasta && desde > hasta) {
    mostrarAlerta(alertas, 'La fecha "desde" no puede ser posterior a "hasta".', 'warning');
    inputDesde.focus();
    return;
  }

  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  if (estado) params.set('estado', estado);
  const consulta = params.toString() ? `?${params}` : '';

  // Generar el PDF tarda alrededor de un segundo: se deshabilita el boton mientras tanto
  btnDescargar.disabled = true;
  btnDescargar.textContent = 'Generando PDF…';
  alertas.replaceChildren();

  try {
    const nombre = await apiDescargar(`/incidencias/informe${consulta}`, 'reporte-incidencias.pdf');
    mostrarAlerta(alertas, `Reporte descargado: ${nombre}`);
  } catch (error) {
    mostrarAlerta(alertas, error.message, 'danger');
  } finally {
    btnDescargar.disabled = false;
    btnDescargar.innerHTML = TEXTO_BOTON;
  }
});

btnLimpiar.addEventListener('click', () => {
  form.reset();
  alertas.replaceChildren();
});
