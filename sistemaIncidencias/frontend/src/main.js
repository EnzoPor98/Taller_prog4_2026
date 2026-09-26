// Side-effect imports: registran CSS y exponen APIs globales.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import * as bootstrap from 'bootstrap';

// Expone Bootstrap globalmente. Como este archivo se carga como módulo,
// todos los imports resuelven antes que los scripts `defer` de la página,
// por lo que `window.bootstrap` está garantizado al ejecutarse los .js.
window.bootstrap = bootstrap;