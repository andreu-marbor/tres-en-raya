/* ============================================================
   main.ts — Arranque y router de pantallas
   Flujo: menú → (elegir modo/dificultad) → partida → resultado
   (superposición) → revancha o menú.
   Cada pantalla repinta sus textos al cambiar de idioma.
   ============================================================ */

import './styles/base.css';
import './styles/animations.css';

import { aplicarIdiomaInicial, onCambioIdioma, t } from './i18n';
import { mostrarMenu, type OpcionesPartida } from './ui/menu';
import { mostrarJuego } from './ui/game';

const app = document.getElementById('app')!;

// Idioma inicial: preferencia guardada → navegador → 'es'
aplicarIdiomaInicial();

// El título del documento también cambia de idioma
function actualizarTitulo(): void {
  document.title = t('app.title');
}
onCambioIdioma(actualizarTitulo);
actualizarTitulo();

// PWA: registrar el service worker solo en producción
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker no registrado:', error);
    });
  });
}

// --- Router sencillo ---
function irAMenu(): void {
  mostrarMenu(app, irAJuego);
}

function irAJuego(opciones: OpcionesPartida): void {
  mostrarJuego(app, opciones, irAMenu);
}

irAMenu();
