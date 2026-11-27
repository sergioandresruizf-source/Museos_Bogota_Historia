// Registro de minijuegos: cada tipo de `work.game.type` apunta a su módulo.
// Cada módulo exporta `meta` y `start(container, work, { onComplete, onExit })`.
import * as curador from "./curador.js";
import * as restaurador from "./restaurador.js";
import * as carrera from "./carrera.js";
import * as mensajero from "./mensajero.js";
import * as imprenta from "./imprenta.js";
import * as galeria from "./galeria.js";
import * as linea from "./linea.js";
import * as codigo from "./codigo.js";

export const GAMES = { curador, restaurador, carrera, mensajero, imprenta, galeria, linea, codigo };
