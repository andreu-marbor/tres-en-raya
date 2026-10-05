/* ============================================================
   board.ts — Estado del tablero 3×3
   Representación: array de 9 posiciones (0..8), fila por fila.
     0 | 1 | 2
     3 | 4 | 5
     6 | 7 | 8
   ============================================================ */

export type Jugador = 'X' | 'O';
export type Celda = Jugador | null;
export type Tablero = Celda[];

/** Crea un tablero vacío de 9 celdas. */
export function crearTablero(): Tablero {
  return Array<Celda>(9).fill(null);
}

/** Indica si la casilla está libre. */
export function casillaLibre(tablero: Tablero, indice: number): boolean {
  return tablero[indice] === null;
}

/** Marca una casilla. Devuelve false si ya estaba ocupada. */
export function marcar(tablero: Tablero, indice: number, jugador: Jugador): boolean {
  if (!casillaLibre(tablero, indice)) return false;
  tablero[indice] = jugador;
  return true;
}

/** Índices de las casillas vacías. */
export function casillasLibres(tablero: Tablero): number[] {
  return tablero.reduce<number[]>((acum, celda, i) => {
    if (celda === null) acum.push(i);
    return acum;
  }, []);
}

/** Devuelve el jugador contrario. */
export function contrario(jugador: Jugador): Jugador {
  return jugador === 'X' ? 'O' : 'X';
}
