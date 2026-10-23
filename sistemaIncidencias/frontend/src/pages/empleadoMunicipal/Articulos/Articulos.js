const token = sessionStorage.getItem('token');

document.addEventListener("DOMContentLoaded", () => {
  cargarTabla();
});

async function cargarTabla() {
  try {
    const respuesta = await fetch(`http://localhost:3000/api/articulos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const articulos = await respuesta.json();

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

      let contador = 0;
      for (let atr of atributos_art) {
        const columna = document.createElement("td");
        columna.textContent = atr;
        fila.appendChild(columna);

        contador++;
        if (contador === atributos_art.length) {
          const columnaAcciones = document.createElement("td");

          const botonEditar = document.createElement("button");
          botonEditar.textContent = "REPORTAR";
          botonEditar.classList.add("btn", "btn-warning");
          botonEditar.id = "botonReportar";

          columnaAcciones.appendChild(botonEditar);
          fila.appendChild(columnaAcciones);
        }
      }

      tbody.appendChild(fila);
    }
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}

// REPORTAR INCIDENCIA
document
  .getElementById("bodyTable")
  .addEventListener("click", async (event) => {
    if (event.target.id != "botonReportar") {
      return;
    }

    const fila = event.target.closest("tr");
    const columna = fila.querySelectorAll("td");
    const articulo = [columna[0].innerText, columna[3].innerText];

    localStorage.setItem("articuloIncidencia", articulo);

    window.location.href = "../Incidencias/Incidencias.html";
  });
