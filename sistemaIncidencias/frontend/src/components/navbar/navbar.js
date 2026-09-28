const usuario = JSON.parse(localStorage.getItem("usuario"));

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "/index.html";
}

(function () {
  // Ruta ABSOLUTA desde la raíz del proyecto (funciona sin importar
  // desde qué página/nivel de carpetas se cargue este script).
  const NAVBAR_URL = "/src/components/navbar/navbar.html";
  const PLACEHOLDER_ID = "navbar-placeholder";

  function loadDataUser() {
    if (!usuario.nombres || !usuario.apellidos) return;
    const nameEl = document.getElementById("userName");
    const roleEl = document.querySelector(".user-role");
    if (nameEl) nameEl.textContent = `${usuario.nombres} ${usuario.apellidos}`;
    if (roleEl) roleEl.textContent = getRol(usuario.rol) || "Rol del usuario";


    const avatar = document.querySelector(".user-avatar");

    avatar.src = `https://api.dicebear.com/10.x/lorelei/svg?seed=${usuario.nombres}`;
    avatar.alt = `Avatar de ${usuario.nombres}`;
  }

  async function loadNavbar() {
    const placeholder = document.getElementById(PLACEHOLDER_ID);
    try {
      const res = await fetch(NAVBAR_URL, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} al pedir ${NAVBAR_URL}`);
      }

      placeholder.innerHTML = await res.text();
      loadDataUser();

    } catch (err) {
      console.error("navbar.js: no se pudo cargar el navbar ->", err);
    }
  }

  function getRol(rol) {
    switch (rol) {
      case 3:
        return "Empleado del área de sistemas";
      case 1:
        return "Director del área de sistemas";
      case 2:
        return "Empleado Municipal";
      default:
        return "Rol del usuario";
    }
  }
  document.addEventListener("DOMContentLoaded", loadNavbar);
})();