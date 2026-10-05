/* ============================================================
   score.ts — Marcador acumulado (X / O / empates)
   Se guarda en localStorage y sobrevive entre sesiones.
   ============================================================ */

import { guardarJSON, leerJSON } from '../persistencia';
import { t } from '../i18n';

const CLAVE_MARCADOR = 'marcador';

export type Resultado = 'X' | 'O' | 'empate';

export interface Marcador {
  X: number;
  O: number;
  empates: number;
}

export function marcadorVacio(): Marcador {
  return { X: 0, O: 0, empates: 0 };
}

/** Carga el marcador guardado (tolerante a datos corruptos). */
export function cargarMarcador(): Marcador {
  const guardado = leerJSON<Partial<Marcador>>(CLAVE_MARCADOR, {});
  return {
    X: Number.isFinite(guardado.X) ? guardado.X! : 0,
    O: Number.isFinite(guardado.O) ? guardado.O! : 0,
    empates: Number.isFinite(guardado.empates) ? guardado.empates! : 0,
  };
}

/** Registra un resultado, lo persiste y devuelve el marcador actualizado. */
export function registrarResultado(marcador: Marcador, resultado: Resultado): Marcador {
  const nuevo: Marcador = { ...marcador };
  if (resultado === 'empate') nuevo.empates += 1;
  else nuevo[resultado] += 1;
  guardarJSON(CLAVE_MARCADOR, nuevo);
  return nuevo;
}

/** Reinicia el marcador a cero y lo persiste. */
export function reiniciarMarcador(): Marcador {
  const vacio = marcadorVacio();
  guardarJSON(CLAVE_MARCADOR, vacio);
  return vacio;
}

/** HTML del marcador: "X 3 · Empates 2 · O 1" (textos por i18n). */
export function htmlMarcador(marcador: Marcador): string {
  return `
    <span class="marcador-item"><b class="marcador-x">X</b> ${marcador.X}</span>
    <span class="marcador-item">${t('score.draws')} <b>${marcador.empates}</b></span>
    <span class="marcador-item"><b class="marcador-o">O</b> ${marcador.O}</span>
  `;
}
