/* ============================================================
   ui/lang.ts — Selector de idioma (ES · VA · EN)
   Componente compacto reutilizable: se añade a la fila de
   ajustes de la pantalla actual.

   Los selectores vivos se registran y se repintan al cambiar
   de idioma (onCambioIdioma), de modo que la marca del idioma
   activo se actualiza también en partida, donde la pantalla
   NO se reconstruye entera.
   ============================================================ */

import {
  CODIGOS,
  getLang,
  IDIOMAS,
  onCambioIdioma,
  setLang,
  t,
  type Idioma,
} from '../i18n';

/** Selectores aún presentes en el DOM (los destruidos se purgan). */
const selectoresVivos = new Set<HTMLElement>();

/** Repinta el estado visual de un selector (activo, títulos, aria). */
function pintarSelector(selector: HTMLElement): void {
  selector.setAttribute('aria-label', t('lang.title'));

  for (const boton of selector.querySelectorAll<HTMLButtonElement>('button')) {
    const idioma = boton.dataset.idioma as Idioma;
    const activo = idioma === getLang();
    boton.textContent = CODIGOS[idioma]; // ES · VA · EN (código corto)
    boton.classList.toggle('activo', activo);
    boton.setAttribute('aria-pressed', String(activo));
    boton.title = t(`lang.${idioma}`);
    boton.setAttribute('aria-label', t(`lang.${idioma}`));
  }
}

// Repintar todos los selectores vivos cuando cambia el idioma
onCambioIdioma(() => {
  for (const selector of selectoresVivos) {
    if (selector.isConnected) pintarSelector(selector);
    else selectoresVivos.delete(selector);
  }
});

/**
 * Añade el selector de idioma al final de `contenedor`.
 * @param alCambiar se ejecuta tras cambiar de idioma (repintar textos).
 */
export function crearSelectorIdioma(contenedor: HTMLElement, alCambiar: () => void): void {
  const selector = document.createElement('div');
  selector.className = 'selector-idioma';
  selector.setAttribute('role', 'group');

  for (const idioma of IDIOMAS) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton-idioma'; // clase base: sin ella no aplica el CSS ni .activo
    boton.dataset.idioma = idioma;
    boton.addEventListener('click', () => {
      if (idioma !== getLang()) {
        setLang(idioma as Idioma); // notifica → repinta este selector
        alCambiar(); // y repinta los textos de la pantalla
      }
    });
    selector.appendChild(boton);
  }

  pintarSelector(selector); // estado inicial
  selectoresVivos.add(selector);
  contenedor.appendChild(selector);
}
