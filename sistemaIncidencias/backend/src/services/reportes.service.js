import { readFile } from 'node:fs/promises';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

// Genera un PDF a partir de una plantilla Handlebars:
// 1. Handlebars completa la plantilla con los datos y arma el HTML
// 2. Puppeteer abre ese HTML en un Chrome sin interfaz y lo "imprime" como PDF
// Devuelve el PDF como Buffer (no se guarda en disco).

const plantillasCompiladas = new Map();

const obtenerPlantilla = async (nombre) => {
    if (!plantillasCompiladas.has(nombre)) {
        const ruta = new URL(`../templates/reportes/${nombre}.hbs`, import.meta.url);
        const contenido = await readFile(ruta, 'utf8');
        plantillasCompiladas.set(nombre, Handlebars.compile(contenido));
    }
    return plantillasCompiladas.get(nombre);
};

const PIE_DE_PAGINA = `
    <div style="width:100%; font-size:8px; color:#64748b; padding:0 15mm; display:flex; justify-content:space-between;">
        <span>Sistema de Incidencias - Reporte generado automáticamente</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>`;

export const generarPdf = async (nombrePlantilla, datos) => {
    const plantilla = await obtenerPlantilla(nombrePlantilla);
    const html = plantilla(datos);

    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<span></span>',
            footerTemplate: PIE_DE_PAGINA,
            margin: { top: '15mm', bottom: '18mm', left: '12mm', right: '12mm' }
        });

        return Buffer.from(pdf);
    } finally {
        // Se cierra siempre, aunque falle la generacion, para no dejar procesos de Chrome abiertos
        await browser.close();
    }
};
