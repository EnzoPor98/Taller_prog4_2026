import AreasRepository from "../repositories/areas.repository.js";

export default class AreasService {
  constructor() {
    this.areas = new AreasRepository();
  }

  getAreas() {
    return this.areas.getAreas();
  }
}
