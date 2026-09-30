  
  
  (function(){
  const FOOTER_URL = "/src/components/footer/footer.html";
  const PLACEHOLDER_ID = "footer-placeholder";


  
  async function loadFooter() {
    const placeholder = document.getElementById(PLACEHOLDER_ID);
    try {
      const res = await fetch(FOOTER_URL, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} al pedir ${FOOTER_URL}`);
      }

      placeholder.innerHTML = await res.text();

          // 2. AHORA SÍ el elemento existe en el DOM, procedemos a buscarlo y actualizarlo
      const yearSpan = document.getElementById('year');
      console.log("🚀 ~ loadFooter ~ yearSpan:", yearSpan);
      
      if (yearSpan) {
          yearSpan.textContent = new Date().getFullYear(); 
          console.log("🚀 ~ loadFooter ~ yearSpan.textContent:", yearSpan.textContent);
      }
    } catch (err) {
      console.error("navbar.js: no se pudo cargar el navbar ->", err);
    }
  }
  document.addEventListener("DOMContentLoaded", loadFooter);
  
})();


