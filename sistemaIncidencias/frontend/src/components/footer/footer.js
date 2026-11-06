import footerHtml from "./footer.html?raw";
import "./footer.css";

  
  
  (function(){
    const PLACEHOLDER_ID = "footer-placeholder";


  
  async function loadFooter() {
    const placeholder = document.getElementById(PLACEHOLDER_ID);
    try {
      placeholder.innerHTML = footerHtml;

      // 2. AHORA SÍ el elemento existe en el DOM, procedemos a buscarlo y actualizarlo
      const yearSpan = document.getElementById('year');

      if (yearSpan) {
          yearSpan.textContent = new Date().getFullYear();
      }
    } catch (err) {
      console.error("footer.js: no se pudo cargar el footer ->", err);
    }
  }
  document.addEventListener("DOMContentLoaded", loadFooter);
  
})();


