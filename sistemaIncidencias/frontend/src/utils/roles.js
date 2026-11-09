// Los ids de rol NO se hardcodean: viven en la tabla roles de la base.
// Aca solo se guardan los nombres (columna roles.nombre), que son la clave estable.
// - El login devuelve rol_nombre junto con el usuario.
// - GET /api/roles devuelve { id_rol, nombre, descripcion } para resolver ids.
export const ROLES = Object.freeze({
    DIRECTOR: 'Director',
    MUNICIPAL: 'Municipal',
    SISTEMAS: 'Sistemas'
});

// Pagina de inicio de cada rol (se usa despues del login), por nombre de rol
export const INICIO_POR_ROL = Object.freeze({
    [ROLES.DIRECTOR]: '/src/pages/directorSistemas/Dashboard/Inicio.html',
    [ROLES.MUNICIPAL]: '/src/pages/empleadoMunicipal/Inicio/Inicio.html',
    [ROLES.SISTEMAS]: '/src/pages/empleadoSistemas/empleadoSistemas.html'
});

// Busca el id de un rol por nombre dentro de la lista que devuelve GET /api/roles
export const idRolPorNombre = (roles, nombre) =>
    roles.find((r) => r.nombre === nombre)?.id_rol;
