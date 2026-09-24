document.addEventListener("DOMContentLoaded", () => {
  cargarTabla();
});


async function cargarTabla() {
  try {
    
    const resIncidencias = await fetch("http://localhost:3000/api/incidencias");
    const { incidencias } = await resIncidencias.json();

    // 2. Traemos la lista de empleados de sistemas para el select
    // (Asegurate de que exista un endpoint similar a este)
    const resEmpleados = await fetch("http://localhost:3000/api/empleados-sistemas");
    const { empleados } = await resEmpleados.json();

    const tbody = document.getElementById("bodyTable");
    tbody.innerHTML = ""; 

    for (let inc of incidencias) {
      const fila = document.createElement("tr");

      // Columnas de datos básicos
      const tdId = document.createElement("td");
      tdId.textContent = inc.id_incidencia;

      const tdArticulo = document.createElement("td");
      tdArticulo.textContent = inc.id_articulo;

      const tdEstado = document.createElement("td");
      tdEstado.textContent = inc.estado; 

      
      const tdAsignacion = document.createElement("td");
      tdAsignacion.className = "d-flex gap-2"; 
      
      const selectEmpleado = document.createElement("select");
      selectEmpleado.className = "form-select form-select-sm";
      selectEmpleado.innerHTML = `<option value="">Seleccionar técnico...</option>`;
      
      empleados.forEach(emp => {
        
        const seleccionado = inc.asignado_a === emp.id_empleado ? "selected" : "";
        selectEmpleado.innerHTML += `<option value="${emp.id_empleado}" ${seleccionado}>${emp.nombre}</option>`;
      });

      const btnAsignar = document.createElement("button");
      btnAsignar.textContent = "Asignar";
      btnAsignar.className = "btn btn-primary btn-sm";
      btnAsignar.onclick = () => asignarEmpleado(inc.id_incidencia, selectEmpleado.value);

      tdAsignacion.appendChild(selectEmpleado);
      tdAsignacion.appendChild(btnAsignar);

      
      const tdCancelar = document.createElement("td");
      const btnCancelar = document.createElement("button");
      btnCancelar.textContent = "CANCELAR";
      
      
      if (inc.estado && inc.estado.toLowerCase() === "pendiente") {
        btnCancelar.className = "btn btn-danger btn-sm";
        btnCancelar.onclick = () => cancelarIncidencia(inc.id_incidencia);
      } else {
        btnCancelar.className = "btn btn-secondary btn-sm";
        btnCancelar.disabled = true; 
      }
      
      tdCancelar.appendChild(btnCancelar);

      // Ensamblamos la fila
      fila.appendChild(tdId);
      fila.appendChild(tdArticulo);
      fila.appendChild(tdEstado);
      fila.appendChild(tdAsignacion);
      fila.appendChild(tdCancelar);

      tbody.appendChild(fila);
    }
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }
}


async function asignarEmpleado(idIncidencia, idEmpleado) {
  if (!idEmpleado) {
    alert("Por favor, seleccione un empleado de sistemas primero.");
    return;
  }

  try {
    await fetch(`http://localhost:3000/api/incidencias/${idIncidencia}/asignar`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asignado_a: idEmpleado })
    });
    alert("Incidencia asignada correctamente.");
    cargarTabla(); 
  } catch (error) {
    console.error("Error al asignar:", error);
  }
}

async function cancelarIncidencia(idIncidencia) {
  const confirmacion = confirm("¿Estás seguro de que deseas cancelar esta incidencia?");
  if (!confirmacion) return;

  try {
    await fetch(`http://localhost:3000/api/incidencias/${idIncidencia}/cancelar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    alert("Incidencia cancelada con éxito.");
    cargarTabla(); 
  } catch (error) {
    console.error("Error al cancelar:", error);
  }
}