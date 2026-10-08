document.addEventListener('DOMContentLoaded', () => {
    
    function goToMenu(seccion) {
        window.location.href = `./${seccion}/${seccion}.html`;
    }

    // Selecciona todos los elementos que tengan la clase 'botones'
    const botonesMenu = document.querySelectorAll('.botones');

    // Le asigna el evento de clic a cada uno dinámicamente
    botonesMenu.forEach(boton => {
        boton.addEventListener('click', () => {
            const seccion = boton.getAttribute('data-seccion'); // Lee "articulos", "clientes", etc.
            if (seccion) {
                goToMenu(seccion);
            }
        });
    });

    console.log(`DOM listo. Se configuraron ${botonesMenu.length} botones de navegación.`);
});