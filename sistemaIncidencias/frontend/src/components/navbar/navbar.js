import navbarHtml from "./navbar.html?raw";
import logoUrl from "../../assets/logoMunicipalidad.png";

const usuario = JSON.parse(sessionStorage.getItem("usuario"));

function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("usuario");
  window.location.href = "/index.html";
}
window.logout = logout;

(function () {
  // Ruta ABSOLUTA desde la raíz del proyecto (funciona sin importar
  // desde qué página/nivel de carpetas se cargue este script).
    const PLACEHOLDER_ID = "navbar-placeholder";

  function loadDataUser() {
    if (!usuario.nombres || !usuario.apellidos) return;
    const nameEl = document.getElementById("userName");
    const roleEl = document.querySelector(".user-role");
    if (nameEl) nameEl.textContent = `${usuario.nombres} ${usuario.apellidos}`;
    if (roleEl) roleEl.textContent = usuario.rol_descripcion || "Rol del usuario";


    const avatar = document.querySelector(".user-avatar");

    avatar.src = `https://api.dicebear.com/10.x/lorelei/svg?seed=${usuario.nombres}`;
    avatar.alt = `Avatar de ${usuario.nombres}`;
  }

  async function loadNavbar() {
    const placeholder = document.getElementById(PLACEHOLDER_ID);
    try {
      placeholder.innerHTML = navbarHtml;
      const logo = placeholder.querySelector(".logo");
      if (logo) logo.src = logoUrl;
      loadDataUser();

    } catch (err) {
      console.error("navbar.js: no se pudo cargar el navbar ->", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadNavbar);
})();