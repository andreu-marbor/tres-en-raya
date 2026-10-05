/* ============================================================
   ai.ts — CPU del 3 en raya
   - 'normal': minimax óptimo (invencible: nunca pierde).
   - 'facil' : sobre todo aleatorio, con un 25% de jugadas óptimas
               para no ser completamente predecible.
   El tablero que recibe minimax se copia; nunca se modifica el real.
   ============================================================ */

import { casillasLibres, contrario, marcar, type Jugador, type Tablero } from './board';
import { buscarGanador } from './rules';

export type Dificultad = 'facil' | 'normal';

/**
 * Elige la casilla (0..8) para `jugador` según la dificultad.
 * Devuelve -1 si no hay casillas libres.
 */
export function elegirMovimiento(
  tablero: Tablero,
  jugador: Jugador,
  dificultad: Dificultad,
): number {
  const libres = casillasLibres(tablero);
  if (libres.length === 0) return -1;

  if (dificultad === 'facil') {
    // 25 % de jugada óptima, 75 % aleatoria
    if (Math.random() < 0.25) return mejorMovimiento(tablero, jugador);
    return libres[Math.floor(Math.random() * libres.length)];
  }

  return mejorMovimiento(tablero, jugador);
}

/** Mejor jugada posible vía minimax con poda alfa-beta. */
function mejorMovimiento(tablero: Tablero, jugador: Jugador): number {
  const copia = [...tablero];
  return minimax(copia, jugador, jugador, 0, -Infinity, Infinity).casilla;
}

interface Elegida {
  puntuacion: number;
  casilla: number;
}

/**
 * Minimax con poda alfa-beta: maximiza para la IA, minimiza para el rival.
 * Puntuación: +10−profundidad gana, −10+profundidad pierde, 0 empata.
 * (Ganar pronto = mejor; perder tarde = menos malo.)
 */
function minimax(
  tablero: Tablero,
  turno: Jugador,
  ia: Jugador,
  profundidad: number,
  alfa: number,
  beta: number,
): Elegida {
  const fin = buscarGanador(tablero);
  if (fin) {
    return {
      puntuacion: fin.jugador === ia ? 10 - profundidad : profundidad - 10,
      casilla: -1,
    };
  }
  if (tablero.every((celda) => celda !== null)) {
    return { puntuacion: 0, casilla: -1 };
  }

  const esMiTurno = turno === ia;
  let mejor: Elegida = {
    puntuacion: esMiTurno ? -Infinity : Infinity,
    casilla: -1,
  };
  let limiteAlfa = alfa;
  let limiteBeta = beta;

  for (const indice of casillasLibres(tablero)) {
    marcar(tablero, indice, turno);
    const respuesta = minimax(
      tablero,
      contrario(turno),
      ia,
      profundidad + 1,
      limiteAlfa,
      limiteBeta,
    );
    tablero[indice] = null; // deshacer para el siguiente intento

    if (esMiTurno) {
      if (respuesta.puntuacion > mejor.puntuacion) {
        mejor = { puntuacion: respuesta.puntuacion, casilla: indice };
      }
      limiteAlfa = Math.max(limiteAlfa, mejor.puntuacion);
    } else {
      if (respuesta.puntuacion < mejor.puntuacion) {
        mejor = { puntuacion: respuesta.puntuacion, casilla: indice };
      }
      limiteBeta = Math.min(limiteBeta, mejor.puntuacion);
    }

    // Poda: no explorar ramas que no mejorarían el resultado
    if (limiteBeta <= limiteAlfa) break;
  }
  return mejor;
}
