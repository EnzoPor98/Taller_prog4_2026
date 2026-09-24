document.addEventListener("DOMContentLoaded", () => {
  cargarPanel();
  cargarTabla();
});

async function cargarPanel() {
  try {
    const respuesta = await fetch(
      "http://localhost:3000/src/pages/empleadoMunicipal/Incidencias",
    );
    const { incidencias } = await respuesta.json();

    const pendientes = document.getElementById("cuadro_pendientes");
    const en_proceso = document.getElementById("cuadro_en_proceso");

    let pendiente = 0;
    let proceso = 0;

    for (let inc of incidencias) {
      if (inc.creado_por != 4) {
        continue;
      }

      switch (inc.id_estado) {
        case 1:
          pendiente += 1;
          break;
        case 2:
          proceso += 1;
          break;
        default:
          continue;
      }
    }

    pendientes.textContent = pendiente + " PENDIENTES";
    en_proceso.textContent = proceso + " EN PROCESO";
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}

async function cargarTabla() {
  try {
    const respuesta = await fetch(
      "http://localhost:3000/src/pages/empleadoMunicipal/Incidencias",
    );
    const { incidencias } = await respuesta.json();

    const tbody = document.getElementById("bodyTable");

    tbody.textContent = "";

    for (let inc of incidencias) {
      if (inc.creado_por != 4) {
        continue;
      }

      const atributos_inc = [
        inc.id_incidencia,
        inc.id_articulo,
        inc.id_estado,
        inc.asignado_a,
        inc.creado,
        inc.prioridad,
        inc.descripcion_pedido,
        inc.descripcion_resolucion,
      ];

      const fila = document.createElement("tr");

      for (let atr of atributos_inc) {
        const columna = document.createElement("td");
        columna.textContent = atr;
        fila.appendChild(columna);
      }

      tbody.appendChild(fila);
    }
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}
