/* ============================================================
   i18n/index.ts — Sistema de traducción propio
   Uso: t('game.turn', { player: 'X' }) → "Turno de X" / "Torn de X"

   Detección inicial: localStorage → navigator.language → 'es'
   Las pantallas se suscriben con onCambioIdioma() para repintarse.
   ============================================================ */

import { guardarTexto, leerTexto } from '../persistencia';
import ca from './ca.json';
import en from './en.json';
import es from './es.json';

export type Idioma = 'es' | 'ca' | 'en';
export const IDIOMAS: Idioma[] = ['es', 'ca', 'en'];
export const IDIOMA_POR_DEFECTO: Idioma = 'es';

const CLAVE_STORAGE = 'idioma';

const recursos: Record<Idioma, Record<string, string>> = { es, ca, en };

/** Códigos cortos mostrados en el selector (VA = valencià). */
export const CODIGOS: Record<Idioma, string> = { es: 'ES', ca: 'VA', en: 'EN' };

let actual: Idioma = IDIOMA_POR_DEFECTO;
const escuchadores = new Set<() => void>();

/** Se suscribe a los cambios de idioma. Devuelve la función de baja. */
export function onCambioIdioma(callback: () => void): () => void {
  escuchadores.add(callback);
  return () => escuchadores.delete(callback);
}

/** Cambia el idioma activo, lo persiste y notifica a los suscriptores. */
export function setLang(idioma: Idioma): void {
  if (!(idioma in recursos) || idioma === actual) return;
  actual = idioma;
  guardarTexto(CLAVE_STORAGE, idioma);
  document.documentElement.lang = idioma;
  escuchadores.forEach((callback) => callback());
}

/** Idioma activo. */
export function getLang(): Idioma {
  return actual;
}

/**
 * Detecta el idioma inicial: preferencia guardada → navegador → por defecto.
 * Solo acepta idiomas disponibles.
 */
export function detectarIdiomaInicial(): Idioma {
  const guardado = leerTexto(CLAVE_STORAGE);
  if (guardado && guardado in recursos) return guardado as Idioma;

  const delNavegador = navigator.language.slice(0, 2).toLowerCase();
  if (delNavegador in recursos) return delNavegador as Idioma;

  return IDIOMA_POR_DEFECTO;
}

/** Aplica el idioma inicial sin notificar (arranque de la app). */
export function aplicarIdiomaInicial(): Idioma {
  const idioma = detectarIdiomaInicial();
  actual = idioma;
  document.documentElement.lang = idioma;
  return idioma;
}

/**
 * Traduce una clave. Sustituye {param} por los valores de `params`.
 * Si falta la clave, devuelve la propia clave (visible en desarrollo).
 */
export function t(clave: string, params?: Record<string, string | number>): string {
  const textos = recursos[actual];
  let texto = textos[clave] ?? recursos[IDIOMA_POR_DEFECTO][clave] ?? clave;

  if (params) {
    for (const [nombre, valor] of Object.entries(params)) {
      texto = texto.replaceAll(`{${nombre}}`, String(valor));
    }
  }
  return texto;
}
