document.addEventListener("DOMContentLoaded", () => {
  cargarFormulario();
});

async function cargarFormulario() {
  try {
    const respuesta = await fetch(
      "http://localhost:3000/src/pages/empleadoMunicipal/Perfil",
    );

    const { usuario } = await respuesta.json();

    for (let usu of usuario) {
      document.getElementById("identificador").value = usu.id_usuario;
      document.getElementById("area").value = usu.id_area;
      document.getElementById("nombres").value = usu.nombres;
      document.getElementById("apellidos").value = usu.apellidos;
      document.getElementById("usuario").value = usu.usuario;
      // document.getElementById('avatar').value = usu.avatar;
      document.getElementById("rol").value = usu.rol;
    }
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
}
