// Estado en memoria: la "fuente de verdad" de la tabla
const incidencias = [
  { id: 1, nombre: 'Mark',  apellido: 'Otto' },
  { id: 2, nombre: 'Jacob', apellido: 'Thornton' },
  { id: 3, nombre: 'Larry', apellido: 'Bird' },
];

const tbody = document.getElementById('incidencias-tbody');

// --- Acciones ---------------------------------------------------------

function verIncidencia(idx) {
  const inc = incidencias[idx];
  console.log('Ver:', inc);
}

function editarIncidencia(idx) {
  const inc = incidencias[idx];
  console.log('Editar:', inc);
}

function eliminarIncidencia(idx) {
  const inc = incidencias[idx];
  if (!confirm(`¿Eliminar la incidencia #${inc.id} de ${inc.nombre}?`)) return;
  incidencias.splice(idx, 1);   // mutamos el array
  renderTabla();                // repintamos la lista
}

function registrarIncidencia() {
  const nueva = {
    id: (incidencias.at(-1)?.id ?? 0) + 1,
    nombre:  document.getElementById('input-nombre').value.trim(),
    apellido: document.getElementById('input-apellido').value.trim(),
  };
  if (!nueva.nombre || !nueva.apellido) return;

  incidencias.push(nueva);
  document.getElementById('input-nombre').value = '';
  document.getElementById('input-apellido').value = '';
  renderTabla();
}

// --- Render -----------------------------------------------------------

function renderTabla() {
  tbody.innerHTML = incidencias.map((item, idx) => `
    <tr>
      <th scope="row">${item.id}</th>
      <td>${item.nombre}</td>
      <td>${item.apellido}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1"
                title="Ver" data-action="ver" data-idx="${idx}">
          <i class="fa fa-search"></i>
        </button>
        <button class="btn btn-sm btn-outline-warning me-1"
                title="Editar" data-action="editar" data-idx="${idx}">
          <i class="fa fa-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger"
                title="Eliminar" data-action="eliminar" data-idx="${idx}">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  switch (btn.dataset.action) {
    case 'ver':      verIncidencia(idx); break;
    case 'editar':   editarIncidencia(idx); break;
    case 'eliminar': eliminarIncidencia(idx); break;
  }
});

// Pintar la tabla al cargar
renderTabla();