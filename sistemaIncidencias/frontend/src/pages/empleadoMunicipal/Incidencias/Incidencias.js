const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('usuario'));


document.addEventListener("DOMContentLoaded", () => {
  cargarTabla();
});

async function cargarTabla() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/incidencias", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const incidencias = await respuesta.json();

    const tbody = document.getElementById("bodyTable");
    tbody.textContent = "";
    for (let inc of incidencias) {
      const asignadoA = inc.asignado_a?.nombres + ' ' + inc.asignado_a?.apellidos
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

      if (atributos_inc[2] === 1) {
        const columnaAcciones = document.createElement("td");
        const boton = document.createElement("button");
        boton.id = "botonFinalizar";
        boton.className = "btn btn-warning";
        boton.textContent = "Finalizar";

        columnaAcciones.appendChild(boton);
        fila.appendChild(columnaAcciones);
      }

      tbody.appendChild(fila);
    }
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}

// MODAL
const modal = new bootstrap.Modal(document.getElementById("modal"));
const btnCrearIncidencia = document.getElementById("btnCrearIncidencia");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnReportar = document.getElementById("btnReportar");
const alertaArticulo = document.getElementById("div-articulo");

btnCrearIncidencia.addEventListener("click", () => {
  modal.show();
  alertaArticulo.hidden = true;
});

btnReiniciar.addEventListener("click", () => {
  reiniciarFormulario();
});

function reiniciarFormulario() {
  const textArea = document.getElementById("pedidoInput");
  textArea.disabled = true;
  textArea.value = "";

  const buscarArticuloInput = document.getElementById("articuloInput");
  buscarArticuloInput.value = "";

  alertaArticulo.hidden = true;
}

// BUSCAR ARTICULO PARA CREAR INCIDENCIA
let articuloIncidencia = null;

document
  .getElementById("buscarArticulo")
  .addEventListener("click", async () => {
    try {
      const idArticulo = Number(document.getElementById("articuloInput").value);

      const respuesta = await fetch(
        `http://localhost:3000/api/articulos/${idArticulo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const articulo = await respuesta.json();

      //LIMPIAMOS CONTENIDO DE LA NOTA
      alertaArticulo.style.whiteSpace = "pre-line";
      alertaArticulo.textContent = "";

      const alerta = document.createElement("div");
      alerta.textContent = "";

      if (respuesta.status === 200) {
        const info = `Articulo encontrado:
                      Descripcion: ${articulo.descripcion}
                      Categoria: ${articulo.id_categoria}
                      Area: ${articulo.id_area}`;

        alerta.classList.add("alert", "alert-success");
        alerta.textContent = info;

        document.getElementById("pedidoInput").disabled = false;
        btnReportar.disabled = false;
      } else {
        alerta.classList.add("alert", "alert-danger");
        alerta.textContent = "Articulo no encontrado.";

        document.getElementById("pedidoInput").disabled = true;
        btnReportar.disabled = true;
      }

      alertaArticulo.appendChild(alerta);
      alertaArticulo.hidden = false;

      articuloIncidencia = articulo.id_articulo;
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    }
  });

// CREAR INCIDENCIA
const nuevaIncidencia = document
  .getElementById("btnReportar")
  .addEventListener("click", async () => {
    try {
      const pedido = document.getElementById("pedidoInput").value;

      const nuevaIncidencia = {
        id_articulo: articuloIncidencia,
        id_estado: 1,
        creado_por: user.id_usuario,
        asignado_a: 4, //Aca hay que ver logica en lo del director que asigna las incidencias.(estren@correo.com es empleado de sist). 
                        //Hasta que se haga la pantalla del director todo se asigna a ese usuario.
        creado: new Date().toISOString(),
        prioridad: 3,
        descripcion_pedido: pedido,
        descripcion_resolucion: "",
      };

      const respuesta = await fetch("http://localhost:3000/api/incidencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaIncidencia),
      });

      cargarTabla();
      reiniciarFormulario();
      modal.hide();
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    }
  });

document
  .getElementById("bodyTable")
  .addEventListener("click", async (event) => {
    if (event.target.id != "botonFinalizar") {
      return;
    }

    const fila = event.target.closest("tr");
    const idIncidencia = fila.cells[0].innerText;

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/incidencias/${idIncidencia}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_estado: 4 }),
        },
      );

      cargarTabla();
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    }
  });
