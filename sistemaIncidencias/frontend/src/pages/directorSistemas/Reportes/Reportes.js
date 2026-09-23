let listaIncidenciasParaPDF = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarTabla();
  
  
  document.getElementById("btn-generar-reporte").addEventListener("click", descargarPDF);
});

async function cargarTabla() {
  try {
    const resIncidencias = await fetch("http://localhost:3000/api/incidencias");
    const { incidencias } = await resIncidencias.json();
    
    
    listaIncidenciasParaPDF = incidencias;


    function descargarPDF() {
  
  if (listaIncidenciasParaPDF.length === 0) {
    alert("No hay incidencias para generar el reporte.");
    return;
  }

  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  
  doc.text("Reporte de Incidencias - Director de Sistemas", 14, 15);

  
  const columnas = ["ID", "Artículo", "Estado", "Asignado A", "Prioridad"];
  
  
  const filas = listaIncidenciasParaPDF.map(inc => [
    inc.id_incidencia,
    inc.id_articulo,
    inc.estado ? inc.estado.toUpperCase() : "SIN ESTADO",
    inc.asignado_a ? inc.asignado_a : "Sin asignar",
    inc.prioridad ? inc.prioridad : "N/A"
  ]);

  
  doc.autoTable({
    head: [columnas],
    body: filas,
    startY: 25, 
    theme: 'grid',
    headStyles: { fillColor: [13, 110, 253] } 
  });

  
  doc.save("Reporte_Incidencias_Sistemas.pdf");
}
  


