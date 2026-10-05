# Plan: 3 en raya trilingüe (es · va · en)

Juego de 3 en raya para Android, sencillo, visualmente bonito y pensado para portfolio.

## 1. Decisiones confirmadas

| Aspecto | Decisión |
|---|---|
| Stack | Vite + TypeScript + DOM/CSS (solo VSCode, sin IDE específico) |
| Modos de juego | 2 jugadores locales **y** vs CPU (minimax, 2 dificultades) |
| Idiomas | Español, Valencià, English — selector persistente + detección automática |
| Estética base | Minimalista claro (fondo hueso, tipografía fina, acentos de color) |
| Publicación | PWA primero, APK con Bubblewrap después |
| Tiempo estimado | 6-7 días de trabajo real |

## 2. Stack técnico

| Elección | Motivo |
|---|---|
| **Vite + TypeScript** | Arranque instantáneo, todo desde VSCode/terminal, build optimizado |
| **DOM + CSS** (no Canvas) | Para un tablero 3×3 el DOM da mejor acabado: animaciones CSS baratas, texto i18n nativo, accesibilidad |
| **JSON de idiomas** | Sistema i18n propio de ~40 líneas (no hace falta i18next para 15 textos) |
| **PWA + Bubblewrap** | Empaquetado a APK sin abrir Android Studio (fase final) |

## 3. Estructura del proyecto

```
PROY_01/
├── index.html
├── package.json
├── vite.config.ts
├── public/
│   ├── manifest.json          # PWA
│   └── icons/
├── src/
│   ├── main.ts                # arranque + router de pantallas
│   ├── styles/
│   │   ├── base.css           # variables de tema (colores, tipografía)
│   │   └── animations.css     # caída de ficha, línea victoria, confeti
│   ├── game/
│   │   ├── board.ts           # estado del tablero (3×3)
│   │   ├── rules.ts           # detección ganador/empate + línea ganadora
│   │   ├── ai.ts              # minimax con dificultades
│   │   └── score.ts           # marcador X / O / empates (localStorage)
│   ├── i18n/
│   │   ├── index.ts           # setLang(), t('key'), persistencia
│   │   ├── es.json
│   │   ├── ca.json            # valenciano/catalán
│   │   └── en.json
│   └── ui/
│       ├── menu.ts            # pantalla inicio: idiomas + modo de juego
│       ├── game.ts            # tablero + indicador de turno
│       └── result.ts          # modal fin: quién gana + revancha
└── README.md
```

## 4. Sistema i18n (diseño)

```ts
// Uso: t('game.turn', { player: 'X' }) → "Turno de X" / "Torn de X" / "Turn of X"
setLang('ca')          // guarda en localStorage
// Detección inicial: localStorage → navigator.language → 'es'
```

- Claves planas: `menu.play`, `menu.vsPlayer`, `menu.vsCpu`, `game.turn`, `game.wins`, `game.draw`, `result.rematch`, `lang.name`...
- Selector de idioma en el menú y visible durante la partida (códigos `ES · VA · EN`).
- Nota: para valenciano se usa el código ISO **`ca`** (el valenciano es variedad del catalán en ISO 639); el nombre visible será **"Valencià"**.
- Todos los textos (incluidos títulos y aria-labels) pasan por `t()`.

## 5. Fases de trabajo

### Fase 1 — Núcleo jugable (día 1)
- Setup Vite + TS, pantalla de menú y tablero 3×3.
- Click en celda → marca X/O, turno alternado.
- Lógica de victoria (8 líneas) y empate.
- Definir variables CSS del tema desde el principio.
- ✅ *Resultado: se juega entre 2 personas en local.*

### Fase 2 — Arquitectura de pantallas y CPU (día 2)
- Router simple: `menú → juego → resultado → revancha`.
- Marcador acumulado (X–O–empates) con persistencia en localStorage.
- Modo vs CPU con minimax (invencible) + dificultad fácil/normal.

### Fase 3 — i18n completo (día 3)
- Sistema de traducción + los 3 JSON (`es`, `ca`, `en`).
- Selector de idioma persistente, detección automática del navegador.
- Revisar que **todos** los textos pasan por `t()`.

### Fase 4 — Visual y "game feel" (día 4-5) ← valor de portfolio
- Estética minimalista con identidad.
- Animaciones: ficha que **cae con rebote**, línea de victoria **dibujada progresivamente**, screen shake en empate.
- Sonido con WebAudio (tonos generados: click, acierto, fanfarria) — sin descargar assets.
- Vibración háptica en móvil (`navigator.vibrate`).
- Indicador de turno animado y estado final con confeti simple.

### Fase 5 — Responsive y accesibilidad (día 6)
- Test en móvil real (Chrome DevTools + dispositivo físico).
- Tamaño táctil mínimo 44px, modo horizontal/vertical, `prefers-reduced-motion`.
- Teclado: navegar con Tab/Enter, anuncios ARIA de turno.

### Fase 6 — Publicación (día 6-7)
- `manifest.json` + iconos → PWA instalable (ya se puede jugar desde el móvil).
- Build de producción; APK con **Bubblewrap** desde terminal.
- README con capturas GIF (el portazo del portfolio) + publicación (itch.io / Play Store).

## 6. Configuraciones visuales futuras (arquitectura de temas)

Para poder ofrecer cambios de tema sin rehacer nada, desde la **Fase 1** se usan **variables CSS** para todo el diseño:

```css
:root {
  --bg: #faf9f7;
  --text: #1a1a1a;
  --accent: #e63946;      /* color de X */
  --accent2: #457b9d;     /* color de O */
  --board-line: #d8d8d8;
}
[data-theme="neon"] { --bg: #0a0a0f; --accent: #ff2d95; ... }
```

Un `<select>` en Ajustes cambia `data-theme` en `<html>` y se guarda en `localStorage`. Así una futura v2 (neón, oscuro, retro…) es añadir un bloque CSS + una entrada de traducción para el nombre del tema. Nada de reescritura.

## 7. Fuera del alcance de la versión básica (v2)

- Temas adicionales (neón, oscuro, retro...).
- Variante 5 en raya / suite de clásicos.
- Online/multijugador remoto.
- Ranking global.
