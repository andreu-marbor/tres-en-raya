/* Prueba temporal de lógica (se ejecuta con esbuild + node). */

import { casillasLibres, contrario, crearTablero, marcar, type Jugador } from '../src/game/board';
import { hayEmpate, buscarGanador, LINEAS_GANADORAS } from '../src/game/rules';
import { elegirMovimiento } from '../src/game/ai';

let fallos = 0;
function comprobar(condicion: boolean, mensaje: string): void {
  if (condicion) {
    console.log(`  ✅ ${mensaje}`);
  } else {
    fallos++;
    console.error(`  ❌ ${mensaje}`);
  }
}

// --- 1. Reglas básicas ---
console.log('\nReglas:');
comprobar(LINEAS_GANADORAS.length === 8, 'hay 8 líneas ganadoras');

{
  const t = crearTablero();
  marcar(t, 0, 'X'); marcar(t, 1, 'X'); marcar(t, 2, 'X');
  const v = buscarGanador(t);
  comprobar(v?.jugador === 'X' && v.casillas.join() === '0,1,2', 'detecta fila ganadora');
}
{
  const t = crearTablero();
  marcar(t, 0, 'X'); marcar(t, 4, 'X'); marcar(t, 8, 'X');
  comprobar(buscarGanador(t)?.jugador === 'X', 'detecta diagonal ganadora');
}
{
  const t = crearTablero();
  const jugadas: [number, Jugador][] = [
    [0, 'X'], [1, 'O'], [2, 'X'],
    [4, 'O'], [3, 'X'], [5, 'O'],
    [7, 'X'], [6, 'O'], [8, 'X'],
  ];
  for (const [i, j] of jugadas) marcar(t, i, j);
  comprobar(hayEmpate(t) && buscarGanador(t) === null, 'detecta empate');
}
{
  const t = crearTablero();
  comprobar(marcar(t, 3, 'X') && !marcar(t, 3, 'O'), 'no permite marcar casilla ocupada');
}

// --- 2. Simulador de partida ---
function partida(ia: Jugador | null, dificultad: 'facil' | 'normal'): Jugador | 'empate' {
  const tablero = crearTablero();
  let turno: Jugador = 'X';
  for (;;) {
    if (turno === ia) {
      marcar(tablero, elegirMovimiento(tablero, turno, dificultad), turno);
    } else {
      const libres = casillasLibres(tablero);
      marcar(tablero, libres[Math.floor(Math.random() * libres.length)], turno);
    }
    const v = buscarGanador(tablero);
    if (v) return v.jugador;
    if (tablero.every((c) => c !== null)) return 'empate';
    turno = contrario(turno);
  }
}

// --- 3. CPU normal: invencible frente a rivales aleatorios ---
console.log('\nCPU difícil (minimax) vs aleatorio (500 partidas):');
let derrotas = 0;
let victorias = 0;
let empates = 0;
for (let i = 0; i < 500; i++) {
  // La IA es X (empieza) y también probamos siendo O
  const r = partida('X', 'normal');
  if (r === 'O') derrotas++;
  else if (r === 'X') victorias++;
  else empates++;
}
comprobar(derrotas === 0, `nunca pierde (victorias: ${victorias}, empates: ${empates})`);

derrotas = 0; victorias = 0; empates = 0;
for (let i = 0; i < 500; i++) {
  const r = partida('O', 'normal');
  if (r === 'X') derrotas++;
  else if (r === 'O') victorias++;
  else empates++;
}
comprobar(derrotas === 0, `siendo O tampoco pierde (victorias: ${victorias}, empates: ${empates})`);

// --- 4. CPU difícil vs CPU difícil → siempre empate ---
console.log('\nCPU difícil vs CPU difícil (100 partidas):');
empates = 0;
for (let i = 0; i < 100; i++) {
  // simulamos que ambos son IA: usamos partida con ia en X y comprobamos
  // que con dos minimax el resultado es empate (sustituye el aleatorio)
  const tablero = crearTablero();
  let turno: Jugador = 'X';
  let r: Jugador | 'empate' = 'empate';
  for (;;) {
    marcar(tablero, elegirMovimiento(tablero, turno, 'normal'), turno);
    const v = buscarGanador(tablero);
    if (v) { r = v.jugador; break; }
    if (tablero.every((c) => c !== null)) break;
    turno = contrario(turno);
  }
  if (r === 'empate') empates++;
}
comprobar(empates === 100, `todos empatan (${empates}/100)`);

// --- 5. CPU fácil: pierde a veces (no es invencible) ---
console.log('\nCPU fácil vs aleatorio (500 partidas):');
let derrotasFacil = 0;
for (let i = 0; i < 500; i++) {
  if (partida('X', 'facil') === 'O') derrotasFacil++;
}
comprobar(derrotasFacil > 0, `a veces pierde (${derrotasFacil}/500) — es efectivamente fácil`);

console.log(fallos === 0 ? '\n🎉 TODO OK' : `\n💥 ${fallos} fallo(s)`);
if (fallos > 0) process.exit(1);
