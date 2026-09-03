
(function () {
  // Ruta ABSOLUTA desde la raíz del proyecto (funciona sin importar
  // desde qué página/nivel de carpetas se cargue este script).
  const NAVBAR_URL = "/src/components/navbar/navbar.html";
  const PLACEHOLDER_ID = "navbar-placeholder";

  async function loadNavbar() {
    const placeholder = document.getElementById(PLACEHOLDER_ID);
    try {
      const res = await fetch(NAVBAR_URL);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} al pedir ${NAVBAR_URL}`);
      }

      const html = await res.text();
      placeholder.innerHTML = html;

    } catch (err) {
      console.error("navbar.js: no se pudo cargar el navbar ->", err);
    }
  }


  document.addEventListener("DOMContentLoaded", loadNavbar);
})();