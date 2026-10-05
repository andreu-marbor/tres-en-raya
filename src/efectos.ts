/* ============================================================
   efectos.ts — Sonido (WebAudio), vibración háptica y utilidades
   Todo generado por código: cero assets externos.
   - El AudioContext se crea bajo demanda (política de autoplay).
   - El botón de sonido queda registrado para repintarse al
     cambiar de idioma.
   ============================================================ */

import { guardarTexto, leerTexto } from './persistencia';
import { onCambioIdioma, t } from './i18n';

const CLAVE_SONIDO = 'sonido';

/** Estado del sonido (persistido; por defecto activado). */
let sonidoActivo = leerTexto(CLAVE_SONIDO) !== 'off';

let contexto: AudioContext | null = null;

/** Crea (una sola vez) y despierta el AudioContext. */
function obtenerContexto(): AudioContext | null {
  try {
    if (!contexto) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      contexto = new Ctor();
    }
    if (contexto.state === 'suspended') void contexto.resume();
    return contexto;
  } catch {
    return null;
  }
}

/** Emite una nota con envolvente suave. */
function nota(
  frecuencia: number,
  inicio: number,
  duracion: number,
  tipo: OscillatorType,
  volumen: number,
): void {
  const ac = obtenerContexto();
  if (!ac) return;

  const t0 = ac.currentTime + inicio;
  const oscilador = ac.createOscillator();
  const ganancia = ac.createGain();

  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(frecuencia, t0);
  ganancia.gain.setValueAtTime(0.0001, t0);
  ganancia.gain.exponentialRampToValueAtTime(volumen, t0 + 0.015);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);

  oscilador.connect(ganancia).connect(ac.destination);
  oscilador.start(t0);
  oscilador.stop(t0 + duracion + 0.05);
}

export type Sonido = 'marcarX' | 'marcarO' | 'ui' | 'victoria' | 'empate';

/** Reproduce un efecto de sonido (si el sonido está activado). */
export function reproducir(efecto: Sonido): void {
  if (!sonidoActivo) return;

  switch (efecto) {
    case 'marcarX':
      nota(660, 0, 0.12, 'triangle', 0.16);
      break;
    case 'marcarO':
      nota(523.25, 0, 0.12, 'triangle', 0.16);
      break;
    case 'ui':
      nota(330, 0, 0.07, 'sine', 0.1);
      break;
    case 'victoria':
      // Fanfarria ascendente: Do – Mi – Sol – Do
      nota(523.25, 0, 0.12, 'triangle', 0.16);
      nota(659.25, 0.1, 0.12, 'triangle', 0.16);
      nota(783.99, 0.2, 0.12, 'triangle', 0.16);
      nota(1046.5, 0.3, 0.3, 'triangle', 0.18);
      break;
    case 'empate':
      // Dos tonos descendentes
      nota(392, 0, 0.16, 'sine', 0.14);
      nota(329.63, 0.15, 0.22, 'sine', 0.14);
      break;
  }
}

/** Vibración háptica (no disponible en todos los navegadores). */
export function vibrar(patron: number | number[]): void {
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(patron);
  } catch {
    /* el navegador ha bloqueado la vibración */
  }
}

/** true si el usuario pide menos movimiento (accesibilidad). */
export function prefiereMovimientoReducido(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// --- Botón de sonido (🔊 / 🔇) ---------------------------------------

const botonesSonido = new Set<HTMLButtonElement>();

function pintarBoton(boton: HTMLButtonElement): void {
  boton.textContent = sonidoActivo ? '🔊' : '🔇';
  boton.setAttribute('aria-pressed', String(sonidoActivo));
  boton.setAttribute('aria-label', t('sound.label'));
  boton.title = t('sound.label');
}

/** Añade el botón de activar/desactivar sonido a `fila`. */
export function crearBotonSonido(fila: HTMLElement): void {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton-idioma boton-sonido';
  pintarBoton(boton);

  boton.addEventListener('click', () => {
    sonidoActivo = !sonidoActivo;
    guardarTexto(CLAVE_SONIDO, sonidoActivo ? 'on' : 'off');
    pintarBoton(boton);
    if (sonidoActivo) reproducir('ui'); // feedback al reactivar
  });

  botonesSonido.add(boton);
  fila.appendChild(boton);
}

// Al cambiar de idioma, repintar los botones vivos (y limpiar los destruidos)
onCambioIdioma(() => {
  for (const boton of botonesSonido) {
    if (boton.isConnected) pintarBoton(boton);
    else botonesSonido.delete(boton);
  }
});
