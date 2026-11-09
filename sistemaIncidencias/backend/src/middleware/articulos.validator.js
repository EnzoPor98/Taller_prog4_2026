import { body, param } from "express-validator";
import { validate } from "./validate.middleware.js";

export const validarId = [
  param("id")
    .notEmpty()
    .withMessage("ID obligatorio")
    .isInt()
    .withMessage("ID debe ser numérico"),

  validate,
];

export const validarArticulo = [
  body("areaId")
    .notEmpty()
    .withMessage("Area obligatoria")
    .isInt()
    .withMessage("Area debe ser numérica"),

  body("categoriaId")
    .notEmpty()
    .withMessage("Categoria obligatoria")
    .isInt()
    .withMessage("Categoria debe ser numérica"),

  body("descripcion")
    .notEmpty()
    .withMessage("Descripcion obligatoria")
    .isString()
    .withMessage("Descripcion debe ser texto"),

  validate,
];
