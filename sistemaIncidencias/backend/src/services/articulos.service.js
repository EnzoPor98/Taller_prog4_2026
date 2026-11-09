import articulosRepository from "../repositories/articulos.repository.js";

export default class ArticulosService {
  constructor() {
    this.articulos = new articulosRepository();
  }

  getArticulos() {
    return this.articulos.getArticulos();
  }

  getArticulo(id) {
    return this.articulos.getArticulo(id);
  }

  createArticulo(articulo) {
    return this.articulos.createArticulo(articulo);
  }

  updateArticulo(articulo) {
    return this.articulos.updateArticulo(articulo);
  }

  deleteArticulo(id) {
    return this.articulos.deleteArticulo(id);
  }
}
