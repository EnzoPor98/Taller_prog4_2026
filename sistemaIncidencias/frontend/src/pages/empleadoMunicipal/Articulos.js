const articulos = [
  {
    id_articulo: 1,
    id_area: 3, // Soporte Técnico
    id_categoria: 12, // Periféricos
    descripcion: "Monitor LED 24''",
    activo: 1, // 1 = Disponible
  },
  {
    id_articulo: 2,
    id_area: 2,
    id_categoria: 15,
    descripcion: "Laptop Dell Latitude",
    activo: 1,
  },
  {
    id_articulo: 3,
    id_area: 1,
    id_categoria: 4,
    descripcion: "Impresora láser multifuncional",
    activo: 1,
  },
  {
    id_articulo: 4,
    id_area: 4,
    id_categoria: 9,
    descripcion: "Proyector HDMI de sala de reuniones",
    activo: NaN,
  },
  {
    id_articulo: 5,
    id_area: 3,
    id_categoria: 12,
    descripcion: null,
    activo: 0,
  },
];

document.addEventListener("DOMContentLoaded", () => {
  cargarTabla(articulos);
});

function cargarTabla(articulos) {
  const tbody = document.getElementById("bodyTable");

  tbody.textContent = "";

  for (let art of articulos) {
    const atributos_art = [
      art.id_articulo,
      art.id_area,
      art.id_categoria,
      art.descripcion,
      art.activo,
    ];

    const fila = document.createElement("tr");

    for (let atr of atributos_art) {
      const columna = document.createElement("td");
      columna.textContent = atr;
      fila.appendChild(columna);
    }

    tbody.appendChild(fila);
  }
}
