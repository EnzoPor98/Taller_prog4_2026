document.addEventListener("DOMContentLoaded", () => {
  cargarTabla();
});

async function cargarTabla() {
  try {
    const respuesta = await fetch(
      "http://localhost:3000/src/pages/empleadoMunicipal/Articulos",
    );
    const { articulos } = await respuesta.json();

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
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}
