import CategoriasRepository from "../repositories/categorias.repository.js";

const toBit = (value) => {
  if (value === true || value === 'true' || value === 1 || value === '1') return 1;
  if (value === false || value === 'false' || value === 0 || value === '0') return 0;
  return value;
};

export default class CategoriasService {
  constructor() {
    this.categorias = new CategoriasRepository();
  }

  getCategorias() {
    return this.categorias.getCategorias();
  }

  getCategoria(id) {
    return this.categorias.getCategoria(id);
  }

  createCategoria({ descripcion, activo }) {
    return this.categorias.createCategoria({ descripcion, activo: toBit(activo) });
  }

  updateCategoria({ id, descripcion, activo }) {
    return this.categorias.updateCategoria({ id, descripcion, activo: toBit(activo) });
  }

  deleteCategoria(id) {
    return this.categorias.deleteCategoria(id);
  }
}
