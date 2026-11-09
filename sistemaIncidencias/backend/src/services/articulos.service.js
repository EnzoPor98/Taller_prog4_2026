import articulosRepository from "../repositories/articulos.repository.js";

export default class ArticulosService {
  constructor() {
    this.articulos = new articulosRepository();
  }

  buscarTodos() {
    return this.articulos.buscarTodos();
  }

  buscarPorId(id) {
    return this.articulos.buscarPorId(id);
  }

  crear(articulo) {
    return this.articulos.crear(articulo);
  }

  actualizar(articulo) {
    return this.articulos.actualizar(articulo);
  }

  eliminar(id) {
    return this.articulos.eliminar(id);
  }
}
