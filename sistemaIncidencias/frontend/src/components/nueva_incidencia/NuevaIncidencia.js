// AL CARGAR LA PAGINA SE INYECTA EL FORMULARIO DE INCIDENCIA.
document.addEventListener("DOMContentLoaded", () => {
  cargarFormulario();
});

async function cargarFormulario() {
  const FORMULARIO_URL =
    "/src/components/nueva_incidencia/NuevaIncidencia.html";

  const placeholder = document.getElementById("formulario-placeholder");
  try {
    const res = await fetch(FORMULARIO_URL, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al pedir ${FORMULARIO_URL}`);
    }

    const html = await res.text();
    placeholder.innerHTML = html;
  } catch (err) {
    console.error(
      "NuevaIncidencia.js: no se pudo cargar el formulario de incidencias ->",
      err,
    );
  }
}
