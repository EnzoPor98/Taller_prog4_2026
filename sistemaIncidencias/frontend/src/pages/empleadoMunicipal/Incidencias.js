document.addEventListener("DOMContentLoaded", () => {
  cargarTabla();
});

async function cargarTabla() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/incidencias");
    const { incidencias } = await respuesta.json();

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
        if (contador == atributos_inc.length) {
          const columnaAcciones = document.createElement("td");

          const boton = document.createElement("button");
          boton.textContent = "CANCELAR";
          boton.className = "btn btn-danger";

          columnaAcciones.appendChild(boton);
          fila.appendChild(columnaAcciones);
        }
      }

      tbody.appendChild(fila);
    }
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}

const articulo = document
  .getElementById("buscarArticulo")
  .addEventListener("click", async () => {
    try {
      const idArticulo = Number(document.getElementById("articuloInput").value);

      const respuesta = await fetch(
        `http://localhost:3000/api/articulos/${idArticulo}`,
      );

      const divAlerta = document.getElementById("div-articulo");
      const alerta = document.createElement("div");

      divAlerta.style.whiteSpace = "pre-line";
      divAlerta.textContent = "";
      alerta.textContent = "";

      if (respuesta.status === 200) {
        const articulo = await respuesta.json();

        const info = `Articulo encontrado:
                      Descripcion: ${articulo.descripcion}
                      Categoria: ${articulo.id_categoria}
                      Area: ${articulo.id_area}`;

        alerta.classList.add("alert", "alert-success");
        alerta.textContent = info;
        divAlerta.appendChild(alerta);

        document.getElementById("pedidoInput").disabled = false;
        document.getElementById("botonReportar").disabled = false;
      } else {
        alerta.classList.add("alert", "alert-danger");
        alerta.textContent = "No se encontro el articulo.";
        divAlerta.appendChild(alerta);
      }

      divAlerta.hidden = false;
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    }
  });
