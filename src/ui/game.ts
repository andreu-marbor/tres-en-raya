/* ============================================================
   ui/game.ts — Pantalla de partida
   - Modo local: 2 jugadores en el mismo dispositivo.
   - Modo CPU: humano = X, CPU = O (minimax según dificultad).
   Incluye marcador persistente y superposición de resultado.
   ============================================================ */

import { t } from '../i18n';
import { contrario, crearTablero, marcar, type Jugador, type Tablero } from '../game/board';
import { buscarGanador, hayEmpate } from '../game/rules';
import { elegirMovimiento } from '../game/ai';
import {
  cargarMarcador,
  htmlMarcador,
  reiniciarMarcador,
  registrarResultado,
  type Marcador,
} from '../game/score';
import { mostrarResultado, ocultarResultado } from './result';
import { crearSelectorIdioma } from './lang';
import { crearBotonSonido, prefiereMovimientoReducido, reproducir, vibrar } from '../efectos';
import { lanzarConfeti } from './confeti';
import type { OpcionesPartida } from './menu';

/** Pausa antes de que la CPU mueva (da tiempo a leer el tablero). */
const RETRASO_CPU_MS = 450;

export function mostrarJuego(
  contenedor: HTMLElement,
  opciones: OpcionesPartida,
  alVolver: () => void,
): void {
  const vsCpu = opciones.modo === 'cpu';
  let tablero: Tablero = crearTablero();
  let turno: Jugador = 'X';
  let terminado = false;
  let pensando = false; // la CPU está "pensando"
  let marcador: Marcador = cargarMarcador();
  let resultadoActual: 'X' | 'O' | 'empate' | null = null; // para repintar el overlay

  /** Texto del título de cabecera según el modo de juego. */
  const tituloCabecera = () =>
    vsCpu
      ? `${t('menu.cpu')} · ${t(opciones.dificultad === 'facil' ? 'diff.easy' : 'diff.normal')}`
      : t('menu.local');

  // --- Estructura de la pantalla ---
  contenedor.innerHTML = `
    <main class="pantalla">
      <header class="cabecera">
        <button class="boton-icono" id="btn-volver" title="${t('game.back')}" aria-label="${t('game.back')}">←</button>
        <h2 id="titulo-cabecera">${tituloCabecera()}</h2>
        <button class="boton-icono" id="btn-reiniciar" title="${t('game.restart')}" aria-label="${t('game.restart')}">↻</button>
      </header>

      <p class="estado" id="estado" role="status" aria-live="polite"></p>

      <div class="tablero" id="tablero" role="grid" aria-label="${t('app.title')}">
        ${[0, 1, 2]
          .map(
            (fila) => `
          <div role="row">
            ${[0, 1, 2]
              .map((col) => {
                const i = fila * 3 + col;
                return `
              <button
                class="celda"
                role="gridcell"
                data-indice="${i}"
                aria-label="${t('game.cell', { n: i + 1 })}"
              ></button>`;
              })
              .join('')}
          </div>`,
          )
          .join('')}
      </div>

      <div class="marcador" id="marcador" title="${t('score.reset')}" role="button" tabindex="0">${htmlMarcador(marcador)}</div>

      <button class="boton" id="btn-ver-resultado" hidden>🏁 ${t('result.show')}</button>

      <div class="fila-ajustes" id="ajustes"></div>
    </main>
  `;

  const estado = contenedor.querySelector<HTMLElement>('#estado')!;
  const celdas = [...contenedor.querySelectorAll<HTMLButtonElement>('.celda')];
  const marcadorEl = contenedor.querySelector<HTMLElement>('#marcador')!;
  const tituloEl = contenedor.querySelector<HTMLElement>('#titulo-cabecera')!;
  const btnVolver = contenedor.querySelector<HTMLButtonElement>('#btn-volver')!;
  const btnReiniciar = contenedor.querySelector<HTMLButtonElement>('#btn-reiniciar')!;
  const btnVerResultado = contenedor.querySelector<HTMLButtonElement>('#btn-ver-resultado')!;
  const pantallaEl = contenedor.querySelector<HTMLElement>('.pantalla')!;

  /** true si la superposición de resultado está visible. */
  let overlayAbierto = false;

  /** Acciones compartidas de la superposición de resultado. */
  function accionesResultado() {
    return {
      onRevancha: reiniciar,
      onMenu: alVolver,
      onVerTablero: () => {
        // Dejar ver el tablero: se muestra el botón para volver al resultado
        overlayAbierto = false;
        btnVerResultado.hidden = false;
        btnVerResultado.focus();
      },
    };
  }

  /** (Re)abre la superposición de resultado. */
  function abrirResultado(): void {
    if (resultadoActual === null) return;
    mostrarResultado(contenedor, resultadoActual, marcador, accionesResultado());
    overlayAbierto = true;
    btnVerResultado.hidden = true;
  }

  // --- Dibujo de la marca X / O (SVG) ---
  function dibujarMarca(celda: HTMLButtonElement, jugador: Jugador): void {
    const svg =
      jugador === 'X'
        ? `<svg class="marca marca-x" viewBox="0 0 100 100" aria-hidden="true">
             <line x1="22" y1="22" x2="78" y2="78"></line>
             <line x1="78" y1="22" x2="22" y2="78"></line>
           </svg>`
        : `<svg class="marca marca-o" viewBox="0 0 100 100" aria-hidden="true">
             <circle cx="50" cy="50" r="30"></circle>
           </svg>`;
    celda.innerHTML = svg;
    // El lector de pantalla anuncia también la marca colocada
    const indice = Number(celda.dataset.indice);
    celda.setAttribute(
      'aria-label',
      `${t('game.cell', { n: indice + 1 })}, ${jugador}`,
    );
  }

  /** Etiqueta accesible de una casilla según su contenido actual. */
  function etiquetaCelda(indice: number): string {
    const contenido = tablero[indice];
    return contenido
      ? `${t('game.cell', { n: indice + 1 })}, ${contenido}`
      : t('game.cell', { n: indice + 1 });
  }

  /** Habilita/deshabilita las celdas según el estado de la partida. */
  function actualizarDisponibilidad(): void {
    const bloqueado = terminado || pensando;
    celdas.forEach((c) => (c.disabled = bloqueado));
  }

  // --- Actualización del indicador de turno ---
  function pintarEstado(): void {
    if (terminado) return;

    if (pensando) {
      estado.textContent = t('game.thinking');
      estado.dataset.activo = 'O';
    } else if (vsCpu) {
      estado.textContent = t('game.yourTurn');
      estado.dataset.activo = 'X';
    } else {
      estado.textContent = t('game.turn', { player: turno });
      estado.dataset.activo = turno;
    }

    // Pulso visual cada vez que cambia el texto
    estado.classList.remove('estado-pulso');
    void estado.offsetWidth; // reinicia la animación
    estado.classList.add('estado-pulso');
  }

  // --- Fin de partida ---
  function finalizar(): void {
    terminado = true;
    pensando = false;

    const victoria = buscarGanador(tablero);
    const resultado = victoria ? victoria.jugador : 'empate';

    if (victoria) {
      estado.textContent = t('game.wins', { player: victoria.jugador });
      estado.dataset.activo = victoria.jugador;
      victoria.casillas.forEach((i) => celdas[i].classList.add('ganadora'));
    } else {
      estado.textContent = t('game.draw');
      delete estado.dataset.activo;
    }

    marcador = registrarResultado(marcador, resultado);
    marcadorEl.innerHTML = htmlMarcador(marcador);
    resultadoActual = resultado;

    // --- Game feel: sonido, vibración y efectos visuales ---
    if (victoria) {
      reproducir('victoria');
      vibrar([40, 60, 40]);
      dibujarLineaVictoria(victoria.casillas);
      lanzarConfeti(contenedor);
    } else {
      reproducir('empate');
      vibrar(60);
      sacudirTablero();
    }

    actualizarDisponibilidad();
    abrirResultado(); // superposición con "Ver tablero"
  }

  // --- Línea de victoria dibujada progresivamente sobre el tablero ---
  function dibujarLineaVictoria(casillas: number[]): void {
    const tableroEl = contenedor.querySelector<HTMLElement>('#tablero');
    if (!tableroEl) return;

    const a = celdas[casillas[0]].getBoundingClientRect();
    const b = celdas[casillas[2]].getBoundingClientRect();
    const rectTablero = tableroEl.getBoundingClientRect();

    const x1 = a.left + a.width / 2 - rectTablero.left;
    const y1 = a.top + a.height / 2 - rectTablero.top;
    const x2 = b.left + b.width / 2 - rectTablero.left;
    const y2 = b.top + b.height / 2 - rectTablero.top;
    const longitud = Math.hypot(x2 - x1, y2 - y1);

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'linea-victoria');
    svg.setAttribute('viewBox', `0 0 ${rectTablero.width} ${rectTablero.height}`);
    svg.setAttribute('aria-hidden', 'true');

    const linea = document.createElementNS(NS, 'line');
    linea.setAttribute('x1', String(x1));
    linea.setAttribute('y1', String(y1));
    linea.setAttribute('x2', String(x2));
    linea.setAttribute('y2', String(y2));
    linea.style.strokeDasharray = String(longitud);
    linea.style.strokeDashoffset = String(longitud);

    svg.appendChild(linea);
    tableroEl.appendChild(svg);

    // Forzar reflow y animar el trazo (la transición está en CSS)
    void svg.getBoundingClientRect();
    linea.style.strokeDashoffset = '0';
  }

  // --- Sacudida del tablero al empatar ---
  function sacudirTablero(): void {
    if (prefiereMovimientoReducido()) return;
    const tableroEl = contenedor.querySelector<HTMLElement>('#tablero');
    if (!tableroEl) return;
    tableroEl.classList.remove('sacudir');
    void tableroEl.offsetWidth;
    tableroEl.classList.add('sacudir');
    tableroEl.addEventListener('animationend', () => tableroEl.classList.remove('sacudir'), {
      once: true,
    });
  }

  // --- Reinicio de la partida ---
  function reiniciar(): void {
    ocultarResultado(contenedor);
    resultadoActual = null;
    overlayAbierto = false;
    btnVerResultado.hidden = true;
    contenedor.querySelector('#tablero .linea-victoria')?.remove();
    contenedor.querySelector('#tablero')?.classList.remove('sacudir');
    tablero = crearTablero();
    turno = 'X';
    terminado = false;
    pensando = false;
    celdas.forEach((c) => {
      c.innerHTML = '';
      c.classList.remove('ganadora');
      c.setAttribute('aria-label', etiquetaCelda(Number(c.dataset.indice)));
    });
    actualizarDisponibilidad();
    pintarEstado();
    // Tras una revancha devolver el foco al tablero (teclado/lector)
    celdas[0].focus();
  }

  // --- Turno de la CPU ---
  function turnoCpu(): void {
    pensando = true;
    actualizarDisponibilidad();
    pintarEstado();

    window.setTimeout(() => {
      if (terminado) return;
      const indice = elegirMovimiento(tablero, 'O', opciones.dificultad ?? 'normal');
      if (indice >= 0) {
        marcar(tablero, indice, 'O');
        dibujarMarca(celdas[indice], 'O');
        reproducir('marcarO');
        vibrar(10);
      }
      pensando = false;

      if (buscarGanador(tablero) || hayEmpate(tablero)) {
        finalizar();
        return;
      }
      turno = 'X';
      actualizarDisponibilidad();
      pintarEstado();
    }, RETRASO_CPU_MS);
  }

  // --- Clic en una casilla (solo turno humano) ---
  function alPulsar(celda: HTMLButtonElement): void {
    if (terminado || pensando) return;
    if (vsCpu && turno !== 'X') return; // nunca debería ocurrir

    const indice = Number(celda.dataset.indice);
    if (!marcar(tablero, indice, turno)) return; // ocupada

    dibujarMarca(celda, turno);
    reproducir(turno === 'X' ? 'marcarX' : 'marcarO');
    vibrar(10);

    if (buscarGanador(tablero) || hayEmpate(tablero)) {
      finalizar();
      return;
    }

    turno = contrario(turno);
    if (vsCpu && turno === 'O') {
      turnoCpu();
      return;
    }
    actualizarDisponibilidad();
    pintarEstado();
  }

  // --- Eventos ---
  celdas.forEach((celda) => celda.addEventListener('click', () => alPulsar(celda)));
  btnReiniciar.addEventListener('click', () => {
    reproducir('ui');
    reiniciar();
  });
  btnVolver.addEventListener('click', () => {
    reproducir('ui');
    alVolver();
  });
  btnVerResultado.addEventListener('click', () => {
    reproducir('ui');
    abrirResultado();
  });

  // Clic en el marcador → reiniciar estadísticas
  function alReiniciarMarcador(): void {
    reproducir('ui');
    marcador = reiniciarMarcador();
    marcadorEl.innerHTML = htmlMarcador(marcador);
  }
  marcadorEl.addEventListener('click', alReiniciarMarcador);
  marcadorEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      alReiniciarMarcador();
    }
  });

  // Navegación del tablero con flechas (patrón ARIA grid)
  contenedor.querySelector<HTMLElement>('#tablero')!.addEventListener('keydown', (e) => {
    const foco = document.activeElement;
    if (!(foco instanceof HTMLElement) || !foco.classList.contains('celda')) return;

    const i = Number(foco.dataset.indice);
    let destino: number;
    switch (e.key) {
      case 'ArrowRight':
        destino = i % 3 < 2 ? i + 1 : i;
        break;
      case 'ArrowLeft':
        destino = i % 3 > 0 ? i - 1 : i;
        break;
      case 'ArrowDown':
        destino = i < 6 ? i + 3 : i;
        break;
      case 'ArrowUp':
        destino = i >= 3 ? i - 3 : i;
        break;
      case 'Home':
        destino = 0;
        break;
      case 'End':
        destino = 8;
        break;
      default:
        return;
    }
    e.preventDefault();
    celdas[destino].focus();
  });

  // --- Repintado de textos al cambiar de idioma (sin perder la partida) ---
  function repintarTextos(): void {
    tituloEl.textContent = tituloCabecera();
    btnVolver.title = btnVolver.ariaLabel = t('game.back');
    btnReiniciar.title = btnReiniciar.ariaLabel = t('game.restart');
    celdas.forEach((c, i) => c.setAttribute('aria-label', etiquetaCelda(i)));
    marcadorEl.title = t('score.reset');
    marcadorEl.innerHTML = htmlMarcador(marcador);
    btnVerResultado.innerHTML = `🏁 ${t('result.show')}`;

    if (terminado) {
      const victoria = buscarGanador(tablero);
      estado.textContent = victoria
        ? t('game.wins', { player: victoria.jugador })
        : t('game.draw');
      // Repintar la superposición SOLO si está visible
      // (si el usuario pidió "ver tablero", no volvemos a taparlo)
      if (overlayAbierto) abrirResultado();
    } else {
      pintarEstado();
    }
  }

  crearSelectorIdioma(pantallaEl.querySelector('#ajustes')!, repintarTextos);
  crearBotonSonido(pantallaEl.querySelector('#ajustes')!);

  // Estado inicial
  actualizarDisponibilidad();
  pintarEstado();
}
