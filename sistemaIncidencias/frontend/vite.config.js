
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
    base: '/',

    build: {
        outDir: 'dist',
        emptyOutDir: true,

        rollupOptions: {
            input: {
                main: resolve(process.cwd(), 'index.html'),

                // Registro
                registro: resolve(process.cwd(), 'src/pages/registro/registro.html'),

                // Empleado de sistemas
                empleadoSistemas: resolve(process.cwd(), 'src/pages/empleadoSistemas/empleadoSistemas.html'),
                incidenciasSistemas: resolve(process.cwd(), 'src/pages/empleadoSistemas/incidencias/incidencias.html'),
                articulosSistemas: resolve(process.cwd(), 'src/pages/empleadoSistemas/articulos/articulos.html'),
                categoriasSistemas: resolve(process.cwd(), 'src/pages/empleadoSistemas/categorias/categorias.html'),

                // Empleado municipal
                inicioMunicipal: resolve(process.cwd(), 'src/pages/empleadoMunicipal/Inicio/Inicio.html'),
                perfilMunicipal: resolve(process.cwd(), 'src/pages/empleadoMunicipal/Perfil/Perfil.html'),
                incidenciasMunicipal: resolve(process.cwd(), 'src/pages/empleadoMunicipal/Incidencias/Incidencias.html'),
                articulosMunicipal: resolve(process.cwd(), 'src/pages/empleadoMunicipal/Articulos/Articulos.html'),

                // Director de sistemas
                dashboardDirector: resolve(process.cwd(), 'src/pages/directorSistemas/Dashboard/Inicio.html'),
                asignarIncidencias: resolve(process.cwd(), 'src/pages/directorSistemas/Incidencias/asignarIncidencias.html'),
                reportesDirector: resolve(process.cwd(), 'src/pages/directorSistemas/Reportes/Reportes.html')
            }
        }
    }
});
