  
  
  (function(){
  const FOOTER_URL = "/src/components/footer/footer.html";
  const PLACEHOLDER_ID = "footer-placeholder";


  
  async function loadFooter() {
    const placeholder = document.getElementById(PLACEHOLDER_ID);
    try {
      if (!document.querySelector('link[data-footer-css]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/components/footer/footer.css';
        link.setAttribute('data-footer-css', 'true');
        document.head.appendChild(link);
      }

      const res = await fetch(FOOTER_URL, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} al pedir ${FOOTER_URL}`);
      }

      placeholder.innerHTML = await res.text();

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


