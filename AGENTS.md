# AGENTS.md — Información del proyecto

## ¿Qué es este proyecto?

Un **videojuego de 3 en raya (Tic-Tac-Toe)** para Android, pensado como proyecto de portfolio. Sencillo de realizar pero con acabado visual cuidado. Multilenguaje: **español, valenciano y inglés**.

- **Objetivo:** juego completo publicado (PWA + APK) en 6-7 días de trabajo.
- **Público:** usuarios casuales + revisores de portfolio.
- **Idioma del código y la documentación:** español.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Build | Vite |
| Render | DOM + CSS (no Canvas) |
| Estilo | CSS con variables (arquitectura de temas) |
| i18n | Sistema propio con JSON (`es`, `ca`, `en`) |
| Persistencia | `localStorage` |
| Sonido | WebAudio (tonos generados, sin assets externos) |
| Empaquetado Android | PWA + Bubblewrap (sin Android Studio) |
| Entorno | Solo VSCode (sin IDE específico) |

## Estructura de directorios

```
PROY_01/
├── index.html
├── package.json
├── vite.config.ts
├── PLAN.md                   # Plan completo del proyecto
├── MEMORY.md                 # Memoria de cambios y problemas (referenciada abajo)
├── README.md                 # README del portfolio
├── .github/
│   └── workflows/despliegue.yml  # CI: pruebas + build + deploy en GitHub Pages
├── docs/
│   └── capturas/             # imágenes y GIFs para el README
├── scripts/
│   └── generar-iconos.mjs    # genera los PNG del PWA (npm.cmd run iconos)
├── pruebas/
│   ├── logica.ts             # pruebas de reglas y CPU (npm.cmd run prueba)
│   └── i18n.ts               # paridad de claves entre idiomas
├── public/
│   ├── manifest.json          # PWA
│   ├── sw.js                  # service worker (red con respaldo en caché)
│   └── icons/                 # SVG fuentes + PNG generados
├── src/
│   ├── main.ts                # arranque + router de pantallas
│   ├── vite-env.d.ts          # tipos de Vite (import.meta.env)
│   ├── persistencia.ts        # acceso centralizado a localStorage
│   ├── efectos.ts             # sonido WebAudio, vibración y botón 🔊
│   ├── styles/
│   │   ├── base.css           # variables de tema
│   │   └── animations.css     # animaciones
│   ├── game/
│   │   ├── board.ts           # estado del tablero (3×3)
│   │   ├── rules.ts           # detección ganador/empate
│   │   ├── ai.ts              # minimax con dificultades
│   │   └── score.ts           # marcador persistente
│   ├── i18n/
│   │   ├── index.ts           # setLang(), t('key')
│   │   ├── es.json
│   │   ├── ca.json            # valenciano
│   │   └── en.json
│   └── ui/
│       ├── menu.ts
│       ├── game.ts
│       ├── result.ts
│       ├── lang.ts           # selector de idioma (ES · VA · EN)
│       └── confeti.ts        # confeti de victoria
│
│ # ── Empaquetado Android (Fase 6, Bubblewrap) ──
├── twa-manifest.json          # manifiest TWA (paquete, colores, iconos remotos)
├── manifest-checksum.txt      # checksums que usa `bubblewrap build` p/ detectar cambios
├── android.keystore           # clave de firma (GITIGNORED — contraseña FUERA del repo)
├── store_icon.png             # icono 512 descargado para la ficha de Play Store
├── build.gradle / settings.gradle / gradle.properties
├── gradlew / gradlew.bat      # wrapper de Gradle
├── gradle/                    # ← proyecto Android generados por Bubblewrap
├── app/                       #   (código TWA: manifest, splash, assetlinks)
└── README.md
```

> ⚠️ `app/`, `gradle/`, `build.gradle`... son **generados** por `bubblewrap build` a partir de `twa-manifest.json`. No editarlos a mano: se regeneran cuando cambia el manifest. `build/`, `.gradle/`, `local.properties` y los `*.apk/aab` están en `.gitignore`.

## Convenciones del proyecto

- **Todo el texto visible al usuario pasa por `t('clave')`** — nunca cadenas hardcodeadas en el código.
- **Colores y tipografía SIEMPRE vía variables CSS** (`--bg`, `--accent`...), nunca valores fijos. Esto permite cambiar de tema sin tocar lógica.
- **Código, comentarios y documentación en español.**
- Nombres de archivos en minúscula/sin espacios.
- Las claves i18n son planas y en inglés (`menu.play`, `game.turn`).
- Persistencia (`localStorage`) centralizada, no llamadas sueltas por el código.

## Modos de juego

1. **2 jugadores locales** (X y O en el mismo dispositivo).
2. **vs CPU** — minimax con dos dificultades: fácil y normal (invencible).

## Idiomas soportados

| Código ISO | Idioma | Nota |
|---|---|---|
| `es` | Español | Idioma por defecto (`fallback`) |
| `ca` | Valencià | Código ISO del catalán/valenciano; el nombre visible es "Valencià" |
| `en` | English | |

Detección de idioma: `localStorage` → `navigator.language` → `es`.

**Estado:** los 3 idiomas están implementados (`es`, `ca`, `en`) con selector `ES · VA · EN` en menú y partida; el repintado no pierde el estado de la partida.

## Comandos útiles

> ⚠️ En PowerShell la política de ejecución bloquea `npm.ps1`; usar siempre la variante **`npm.cmd`** (ver `MEMORY.md`).

```bash
npm.cmd install        # instalar dependencias
npm.cmd run dev        # servidor de desarrollo
npm.cmd run build      # build de producción (tsc + vite)
npm.cmd run preview    # previsualizar build (localhost:4173)
npm.cmd run prueba     # pruebas de lógica (reglas + minimax invencible)
npm.cmd run iconos     # regenerar iconos PNG del PWA desde SVG
```

### Publicación (Fase 6)

> ⚠️ Igual que `npm`: usar **`bubblewrap.cmd`** (la política de PowerShell bloquea `bubblewrap.ps1`). Ver `MEMORY.md` para el contexto completo (JDK, SDK, keystore).

```bash
# El PWA se despliega solo en GitHub Pages en cada push a main (ver .github/workflows)
gh run list                       # estado del último despliegue
gh workflow run despliegue.yml    # lanzar el despliegue a mano

bubblewrap.cmd doctor             # valida JDK + Android SDK (~/.bubblewrap/config.json)
bubblewrap.cmd build              # genera APK + AAB (gradle) — requiere las 2 variables:
#   BUBBLEWRAP_KEYSTORE_PASSWORD / BUBBLEWRAP_KEY_PASSWORD
#   valor en %USERPROFILE%\.bubblewrap\keystore-pass.txt (FUERA del repo — nunca en ficheros versionados)
```

**URLs:** web → `https://andreu-marbor.github.io/tres-en-raya/` · repo → `https://github.com/andreu-marbor/tres-en-raya`

## ⚠️ Memoria del proyecto

Existe un archivo **[MEMORY.md](./MEMORY.md)** que registra:

- Cambios relevantes realizados.
- Problemas encontrados y sus soluciones.
- Estado actual de las fases del plan.

**Instrucción para agentes:** tras cada cambio relevante o incidencia, **actualizar `MEMORY.md`** añadiendo una entrada con fecha, descripción del cambio/problema y solución aplicada. No borrar entradas anteriores; solo añadir.

## Plan

El plan completo (fases, alcance, decisiones) está en **[PLAN.md](./PLAN.md)**.
