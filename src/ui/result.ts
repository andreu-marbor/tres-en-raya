/* ============================================================
   ui/result.ts — Superposición de fin de partida
   Muestra el resultado, el marcador y las acciones:
   revancha, VER TABLERO (para ver la última jugada) y menú.
   ============================================================ */

import { t } from '../i18n';
import { htmlMarcador, type Marcador, type Resultado } from '../game/score';
import { reproducir } from '../efectos';

export interface AccionesResultado {
  onRevancha: () => void;
  onMenu: () => void;
  /** Cierra la superposición para dejar ver el tablero. */
  onVerTablero: () => void;
}

export function mostrarResultado(
  contenedor: HTMLElement,
  resultado: Resultado,
  marcador: Marcador,
  acciones: AccionesResultado,
): void {
  ocultarResultado(contenedor); // por si ya había otra superposición

  const titulo =
    resultado === 'empate' ? t('game.draw') : t('game.wins', { player: resultado });

  const superposicion = document.createElement('div');
  superposicion.className = 'superposicion';
  superposicion.setAttribute('role', 'dialog');
  superposicion.setAttribute('aria-modal', 'true');
  superposicion.innerHTML = `
    <div class="tarjeta" data-resultado="${resultado}">
      <p class="tarjeta-titulo" data-activo="${resultado === 'empate' ? '' : resultado}">
        ${titulo}
      </p>
      <div class="marcador">${htmlMarcador(marcador)}</div>
      <div class="lista-botones">
        <button class="boton boton--principal" id="btn-revancha">🔄 ${t('game.again')}</button>
        <button class="boton" id="btn-tablero">👁 ${t('result.showBoard')}</button>
        <button class="boton boton--sutil" id="btn-menu">🏠 ${t('result.menu')}</button>
      </div>
    </div>
  `;

  superposicion.querySelector('#btn-revancha')!.addEventListener('click', () => {
    reproducir('ui');
    ocultarResultado(contenedor);
    acciones.onRevancha();
  });
  superposicion.querySelector('#btn-tablero')!.addEventListener('click', () => {
    reproducir('ui');
    ocultarResultado(contenedor);
    acciones.onVerTablero();
  });
  superposicion.querySelector('#btn-menu')!.addEventListener('click', () => {
    reproducir('ui');
    acciones.onMenu();
  });

  contenedor.appendChild(superposicion);
  // Foco en el botón principal para teclado/lector de pantalla
  superposicion.querySelector<HTMLButtonElement>('#btn-revancha')?.focus();
}

/** Elimina la superposición si existe. */
export function ocultarResultado(contenedor: HTMLElement): void {
  contenedor.querySelector('.superposicion')?.remove();
}
