/* ============================================================
   ui/confeti.ts — Confeti simple con DOM
   Chispas de color que caen tras una victoria.
   Se omite si el usuario pide menos movimiento.
   ============================================================ */

import { prefiereMovimientoReducido } from '../efectos';

/** Lanza `cantidad` piezas de confeti dentro de `contenedor`. */
export function lanzarConfeti(contenedor: HTMLElement, cantidad = 44): void {
  if (prefiereMovimientoReducido()) return;

  const colores = ['var(--accent)', 'var(--accent2)', 'var(--victoria)', 'var(--text-suave)'];
  const piezas: HTMLSpanElement[] = [];
  const fragmento = document.createDocumentFragment();

  for (let i = 0; i < cantidad; i++) {
    const pieza = document.createElement('span');
    pieza.className = 'confeti';
    pieza.style.left = `${Math.random() * 100}%`;
    pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
    pieza.style.animationDelay = `${Math.random() * 0.7}s`;
    pieza.style.animationDuration = `${1.8 + Math.random() * 1.5}s`;
    pieza.style.setProperty('--deriva', `${Math.random() * 140 - 70}px`);
    pieza.style.setProperty('--giro', `${Math.random() * 720 - 360}deg`);
    fragmento.appendChild(pieza);
    piezas.push(pieza);
  }

  contenedor.appendChild(fragmento);

  // Limpieza cuando todas han terminado de caer
  window.setTimeout(() => piezas.forEach((pieza) => pieza.remove()), 4200);
}
