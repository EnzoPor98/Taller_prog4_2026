const nombre = localStorage.getItem("nombre");
const apellido = localStorage.getItem("apellido");
const rol = localStorage.getItem("rol");




(function () {
  // Ruta ABSOLUTA desde la raíz del proyecto (funciona sin importar
  // desde qué página/nivel de carpetas se cargue este script).
  const NAVBAR_URL = "/src/components/navbar/navbar.html";
  const PLACEHOLDER_ID = "navbar-placeholder";

  function loadDataUser() {
    if (!nombre || !apellido) return;
    const nameEl = document.getElementById("userName");
    const roleEl = document.querySelector(".user-role");
    if (nameEl) nameEl.textContent = `${nombre} ${apellido}`;
    if (roleEl) roleEl.textContent = getRol(rol) || "Rol del usuario";
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
      case "sistemas":
        return "Empleado del área de sistemas";
      case "director":
        return "Director del área de sistemas";
      case "municipal":
        return "Empleado Municipal";
      default:
        return "Rol del usuario";
    }
  }
  document.addEventListener("DOMContentLoaded", loadNavbar);
})();