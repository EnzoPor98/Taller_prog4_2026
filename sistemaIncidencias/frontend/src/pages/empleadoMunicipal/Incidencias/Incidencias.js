const token = sessionStorage.getItem('token');
const user = JSON.parse(sessionStorage.getItem('usuario'));


document.addEventListener("DOMContentLoaded", () => {
  cargarTabla();

  if (localStorage.getItem("articuloIncidencia")) {
    document.getElementById("articuloInput").textContent = "";

    const articulo = localStorage.getItem("articuloIncidencia").split(",");
    const opcion = document.createElement("option");
    opcion.value = articulo[0];
    opcion.textContent = `${articulo[0]} - ${articulo[1]}`;
    document.getElementById("articuloInput").appendChild(opcion);

    modal.show();
  } else {
    cargarArticulos();
  }

  localStorage.removeItem("articuloIncidencia");
});

async function cargarTabla() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/incidencias", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const incidencias = await respuesta.json();

    const tbody = document.getElementById("bodyTable");
    tbody.textContent = "";
    for (let inc of incidencias) {
      const asignadoA =
        inc.asignado_a?.nombres + " " + inc.asignado_a?.apellidos;
      const articulo = inc.articulo?.descripcion;
      const estado = inc.estado?.descripcion;
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

      const columnaAcciones = document.createElement("td");
      if (inc?.estado?.id_estado === 1) {
        const boton = document.createElement("button");
        boton.id = "botonFinalizar";
        boton.className = "btn btn-warning";
        boton.textContent = "FINALIZAR";

        columnaAcciones.appendChild(boton);
      }
      fila.appendChild(columnaAcciones);

      tbody.appendChild(fila);
    }
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}

async function cargarArticulos() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/articulos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const articulos = await respuesta.json();

    const select = document.getElementById("articuloInput");
    select.textContent = "";

    for (let art of articulos) {
      const option = document.createElement("option");
      option.value = art.id_articulo;
      option.textContent = `${art.id_articulo} - ${art.descripcion}`;
      select.appendChild(option);
    }

    select.value = 0;
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}

// CANCELAR INCIDENCIA
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

// MODAL
const modal = new bootstrap.Modal(document.getElementById("modal"));

// ABRIR MODAL
const btnReportar = document.getElementById("btnReportar");
btnReportar.addEventListener("click", () => {
  document.getElementById("div-articulo").hidden = false;
  document.getElementById("div-pedido").hidden = false;
  document.getElementById("div-incidencia").hidden = true;

  btnContinuar.hidden = false;
  btnReiniciar.hidden = false;
  btnVolver.hidden = true;
  btnConfirmar.hidden = true;

  modal.show();
});

// BUSCAR ARTICULO
const btnBuscarArticulo = document.getElementById("buscarArticulo");
btnBuscarArticulo.addEventListener("click", async () => {
  window.location.href = "../Articulos/Articulos.html";
});

// REINICIAR FORMULARIO
const btnReiniciar = document.getElementById("btnReiniciar");
btnReiniciar.addEventListener("click", () => {
  const textArea = document.getElementById("pedidoInput");
  textArea.value = "";

  cargarArticulos();
});

// CONTINUAR
const btnContinuar = document.getElementById("btnContinuar");
btnContinuar.addEventListener("click", () => {
  const select = document.getElementById("articuloInput");
  let index = 0;
  let articuloIncidencia = "";

  if (select.options.length === 1) {
    index = select.value;
    articuloIncidencia = select.textContent;
  } else {
    index = select.value - 1;
    articuloIncidencia = select[index].textContent;
  }

  const pedidoIncidencia = document.getElementById("pedidoInput").value;

  document.getElementById("div-articulo").hidden = true;
  document.getElementById("div-pedido").hidden = true;
  document.getElementById("div-incidencia").hidden = false;

  btnContinuar.hidden = true;
  btnReiniciar.hidden = true;
  btnVolver.hidden = false;
  btnConfirmar.hidden = false;

  // MODAL DE CONFIRMACION.
  const datosIncidencia = document.getElementById("div-incidencia");
  datosIncidencia.textContent = "";

  const titulo = document.createElement("h3");
  titulo.textContent = "Datos de Incidencia";
  datosIncidencia.appendChild(titulo);

  const etiqueta2 = document.createElement("h6");
  etiqueta2.textContent = "Articulo";
  datosIncidencia.appendChild(etiqueta2);

  let input = document.createElement("input");
  input.className = "form-control";
  input.type = "text";
  input.disabled = true;
  input.readOnly = true;
  input.value = articuloIncidencia;
  datosIncidencia.appendChild(input);

  const etiqueta = document.createElement("h6");
  etiqueta.textContent = "Pedido";
  datosIncidencia.appendChild(etiqueta);

  input = document.createElement("textarea");
  input.className = "form-control";
  input.disabled = true;

  input.textContent = pedidoIncidencia;
  datosIncidencia.appendChild(input);
});

// VOLVER
const btnVolver = document.getElementById("btnVolver");
btnVolver.addEventListener("click", async () => {
  document.getElementById("div-articulo").hidden = false;
  document.getElementById("div-pedido").hidden = false;
  document.getElementById("div-incidencia").hidden = true;

  btnContinuar.hidden = false;
  btnReiniciar.hidden = false;
  btnVolver.hidden = true;
  btnConfirmar.hidden = true;
});

// CREAR INCIDENCIA
const btnConfirmar = document.getElementById("btnConfirmar");
btnConfirmar.addEventListener("click", async () => {
  try {
    const articulo = document.getElementById("articuloInput").value;
    const pedido = document.getElementById("pedidoInput").value;

    const nuevaIncidencia = {
      id_articulo: articulo,
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

function reiniciarFormulario() {
  document.getElementById("articuloInput").value = 0;
  document.getElementById("pedidoInput").value = "";

  document.getElementById("div-articulo").hidden = false;
  document.getElementById("div-pedido").hidden = false;
  document.getElementById("div-incidencia").hidden = true;

  btnContinuar.hidden = false;
  btnReiniciar.hidden = false;
  btnVolver.hidden = true;
  btnConfirmar.hidden = true;
}
