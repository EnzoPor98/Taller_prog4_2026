// Utilidades de fechas. Las fechas "YYYY-MM-DD" se manejan como texto para evitar
// corrimientos de dia por zona horaria.

export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

// Fecha de hoy (YYYY-MM-DD) en la zona horaria del municipio
export const hoyEnZona = () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(new Date());

// Suma (o resta) dias a una fecha YYYY-MM-DD
export const sumarDias = (fecha, dias) => {
    const base = new Date(`${fecha}T00:00:00Z`);
    base.setUTCDate(base.getUTCDate() + dias);
    return base.toISOString().slice(0, 10);
};

// Cantidad de dias entre dos fechas YYYY-MM-DD, contando ambas
export const diasEntre = (desde, hasta) =>
    Math.round((new Date(`${hasta}T00:00:00Z`) - new Date(`${desde}T00:00:00Z`)) / 86400000) + 1;

// YYYY-MM-DD -> DD/MM/YYYY
export const formatearFechaCorta = (fecha) => fecha.split('-').reverse().join('/');

// Fecha y hora legible en la zona horaria del municipio
export const formatearFechaHora = (fecha) =>
    new Date(fecha).toLocaleString('es-AR', {
        timeZone: ZONA_HORARIA,
        dateStyle: 'short',
        timeStyle: 'short'
    });
