const token = localStorage.getItem('token');

document.addEventListener("DOMContentLoaded", () => {
  cargarPanel();
  cargarTabla();
});

async function cargarPanel() {
  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/incidencias",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const incidencias = await respuesta.json();

    if (!incidencias) return
    
    const pendientes = document.getElementById("cuadro_pendientes");
    const en_proceso = document.getElementById("cuadro_en_proceso");
    const resueltas = document.getElementById("cuadro_resueltas");


    let pendiente = 0;
    let proceso = 0;
    let resuelta = 0;


    for (let inc of incidencias) {

      switch (inc.estado?.id_estado) {
        case 1:
          pendiente += 1;
          break;
        case 2:
          proceso += 1;
          break;
           case 3:
          resuelta += 1;
          break;
        default:
          continue;
      }
    }

    pendientes.textContent = pendiente + " PENDIENTES";
    en_proceso.textContent = proceso + " EN PROCESO";
    resueltas.textContent = resuelta + " RESUELTAS";

  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}

async function cargarTabla() {
  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/incidencias",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const incidencias = await respuesta.json();

    if (!incidencias) return

    const tbody = document.getElementById("bodyTable");

    tbody.textContent = "";

    for (let inc of incidencias) {
      const asignadoA = inc.asignado_a?.nombres +' '+ inc.asignado_a?.apellidos
      const articulo = inc.articulo?.descripcion
      const estado = inc.estado?.descripcion

      const atributos_inc = [
        inc.id_incidencia,
        articulo,
        estado,
        asignadoA,
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
