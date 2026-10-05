/* ============================================================
   persistencia.ts — Acceso centralizado a localStorage
   Todas las lecturas/escrituras pasan por aquí para manejar
   errores (modo incógnito, cuota llena...) en un solo sitio.
   ============================================================ */

/** Lee un texto. Devuelve null si no existe o no hay almacenamiento. */
export function leerTexto(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

/** Guarda un texto. Falla de forma silenciosa si no hay almacenamiento. */
export function guardarTexto(clave: string, valor: string): void {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento disponible: seguimos en memoria */
  }
}

/** Lee y parsea un JSON. Devuelve `defecto` si falta o está corrupto. */
export function leerJSON<T>(clave: string, defecto: T): T {
  const texto = leerTexto(clave);
  if (texto === null) return defecto;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return defecto;
  }
}

/** Serializa y guarda un valor como JSON. */
export function guardarJSON(clave: string, valor: unknown): void {
  guardarTexto(clave, JSON.stringify(valor));
}
