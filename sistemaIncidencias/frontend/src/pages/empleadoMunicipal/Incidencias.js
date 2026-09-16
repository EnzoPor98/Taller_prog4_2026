const incidencias = [
  {
    id_incidencia: 1,
    id_articulo: 101,
    id_estado: 1,
    creado_por: 12,
    asignado_a: 5,
    creado: "2026-09-10T08:30:00Z",
    prioridad: 1,
    descripcion_pedido:
      "La pantalla presenta parpadeos intermitentes al encender.",
    descripcion_resolucion: null,
  },
  {
    id_incidencia: 2,
    id_articulo: 105,
    id_estado: 2,
    creado_por: 14,
    asignado_a: 3,
    creado: "2026-09-11T10:15:00Z",
    prioridad: 2,
    descripcion_pedido: "El teclado no responde tras conectar por puerto USB.",
    descripcion_resolucion:
      "Se realiza diagnóstico de controladores y prueba de puertos.",
  },
  {
    id_incidencia: 3,
    id_articulo: 202,
    id_estado: 3,
    creado_por: 8,
    asignado_a: 5,
    creado: "2026-09-12T14:45:00Z",
    prioridad: 3,
    descripcion_pedido:
      "Falta de suministro eléctrico en la fuente de alimentación.",
    descripcion_resolucion:
      "Se reemplazó el cable de alimentación defectuoso por uno nuevo.",
  },
  {
    id_incidencia: 4,
    id_articulo: 304,
    id_estado: 1,
    creado_por: 19,
    asignado_a: 2,
    creado: "2026-09-13T09:00:00Z",
    prioridad: 1,
    descripcion_pedido:
      "Error de lectura al intentar montar el disco duro externo.",
    descripcion_resolucion: null,
  },
  {
    id_incidencia: 5,
    id_articulo: 110,
    id_estado: 3,
    creado_por: 12,
    asignado_a: 3,
    creado: "2026-09-14T11:20:00Z",
    prioridad: 2,
    descripcion_pedido:
      "La batería de la computadora portátil no retiene la carga.",
    descripcion_resolucion:
      "Se instaló un repuesto original de módulo de batería.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  cargarTabla(incidencias);
});

function cargarTabla(incidencias) {
  const tbody = document.getElementById("bodyTable");

  tbody.textContent = "";

  for (let inc of incidencias) {
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

    let contador = 0;
    for (let atr of atributos_inc) {
      const columna = document.createElement("td");
      columna.textContent = atr;
      fila.appendChild(columna);

      contador += 1;
      if(contador == atributos_inc.length){
        const columnaAcciones = document.createElement("td");

        const boton = document.createElement('button');
        boton.textContent = "CANCELAR";
        boton.className = "btn btn-danger";

        columnaAcciones.appendChild(boton);
        fila.appendChild(columnaAcciones);
      }
    }

    tbody.appendChild(fila);
  }
}
