const usuario = {
  id_usuario: 123,
  id_area: 1,
  nombres: "Nombre_1 Nombre_2",
  apellidos: "Apellido_1 Apellido_2",
  usuario: "Correo@mail.com",
  contrasenia: "NomApe",
  avatar: "",
  rol: 3,
  activo: 1,
};

document.addEventListener("DOMContentLoaded", () => {
    cargarDatos(usuario);
});

function cargarDatos(usuario){
    document.getElementById('identificador').value = usuario.id_usuario;
    document.getElementById('area').value = usuario.id_area;
    document.getElementById('nombres').value = usuario.nombres;
    document.getElementById('apellidos').value = usuario.apellidos;
    document.getElementById('usuario').value = usuario.usuario;
    // document.getElementById('avatar').value = usuario.avatar;
    document.getElementById('rol').value = usuario.rol;
}