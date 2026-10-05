/* ============================================================
   ui/menu.ts — Pantalla de inicio
   Paso 1: elegir modo (2 jugadores / contra la CPU).
   Paso 2 (si CPU): elegir dificultad (fácil / normal).
   El selector de idioma repinta el paso actual sin retroceder.
   ============================================================ */

import { t } from '../i18n';
import type { Dificultad } from '../game/ai';
import { crearSelectorIdioma } from './lang';
import { crearBotonSonido, reproducir } from '../efectos';

export interface OpcionesPartida {
  modo: 'local' | 'cpu';
  dificultad?: Dificultad;
}

type Paso = 'modos' | 'dificultad';

export function mostrarMenu(
  contenedor: HTMLElement,
  alJugar: (opciones: OpcionesPartida) => void,
): void {
  let paso: Paso = 'modos';

  /** Repinta el paso visible (usado al cambiar de idioma). */
  function repintar(): void {
    if (paso === 'modos') pintarModos();
    else pintarDificultad();
  }

  /** Paso 1: selección de modo. */
  function pintarModos(): void {
    paso = 'modos';
    contenedor.innerHTML = `
      <main class="pantalla">
        <h1 class="titulo">${t('app.title')}</h1>
        <p class="subtitulo">${t('app.tagline')}</p>

        <div class="lista-botones">
          <button class="boton boton--principal" id="btn-cpu">🤖 ${t('menu.cpu')}</button>
          <button class="boton" id="btn-local">👥 ${t('menu.local')}</button>
        </div>

        <p class="ayuda">${t('menu.hint')}</p>

        <div class="fila-ajustes" id="ajustes"></div>
      </main>
    `;

    contenedor.querySelector('#btn-local')!.addEventListener('click', () => {
      reproducir('ui');
      alJugar({ modo: 'local' });
    });
    contenedor.querySelector('#btn-cpu')!.addEventListener('click', () => {
      reproducir('ui');
      pintarDificultad();
    });

    const fila = contenedor.querySelector<HTMLElement>('#ajustes')!;
    crearSelectorIdioma(fila, repintar);
    crearBotonSonido(fila);
  }

  /** Paso 2: selección de dificultad (solo modo CPU). */
  function pintarDificultad(): void {
    paso = 'dificultad';
    contenedor.innerHTML = `
      <main class="pantalla">
        <h1 class="titulo">${t('menu.cpu')}</h1>
        <p class="subtitulo">${t('diff.title')}</p>

        <div class="lista-botones">
          <button class="boton boton--principal" id="btn-normal">${t('diff.normal')}</button>
          <button class="boton" id="btn-facil">${t('diff.easy')}</button>
          <button class="boton boton--sutil" id="btn-atras">← ${t('menu.back')}</button>
        </div>

        <div class="fila-ajustes" id="ajustes"></div>
      </main>
    `;

    contenedor.querySelector('#btn-normal')!.addEventListener('click', () => {
      reproducir('ui');
      alJugar({ modo: 'cpu', dificultad: 'normal' });
    });
    contenedor.querySelector('#btn-facil')!.addEventListener('click', () => {
      reproducir('ui');
      alJugar({ modo: 'cpu', dificultad: 'facil' });
    });
    contenedor.querySelector('#btn-atras')!.addEventListener('click', () => {
      reproducir('ui');
      pintarModos();
    });

    const fila = contenedor.querySelector<HTMLElement>('#ajustes')!;
    crearSelectorIdioma(fila, repintar);
    crearBotonSonido(fila);
  }

  pintarModos();
}
