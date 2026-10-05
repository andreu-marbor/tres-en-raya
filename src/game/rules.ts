/* ============================================================
   rules.ts — Reglas del 3 en raya
   Detección de victoria (8 líneas) y empate.
   ============================================================ */

import type { Jugador, Tablero } from './board';

/** Las 8 líneas ganadoras: 3 filas, 3 columnas y 2 diagonales. */
export const LINEAS_GANADORAS: readonly number[][] = [
  [0, 1, 2], // filas
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // columnas
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonales
  [2, 4, 6],
];

export interface Victoria {
  jugador: Jugador;
  /** Las 3 casillas que forman la línea (para resaltarlas). */
  casillas: number[];
}

/** Busca un ganador. Devuelve la línea o null si no hay. */
export function buscarGanador(tablero: Tablero): Victoria | null {
  for (const linea of LINEAS_GANADORAS) {
    const [a, b, c] = linea;
    const valor = tablero[a];
    if (valor !== null && valor === tablero[b] && valor === tablero[c]) {
      return { jugador: valor, casillas: [...linea] };
    }
  }
  return null;
}

/** Empate: sin ganador y sin casillas libres. */
export function hayEmpate(tablero: Tablero): boolean {
  return buscarGanador(tablero) === null && tablero.every((celda) => celda !== null);
}

/** Indica si la partida ha terminado (victoria o empate). */
export function partidaTerminada(tablero: Tablero): boolean {
  return buscarGanador(tablero) !== null || hayEmpate(tablero);
}
