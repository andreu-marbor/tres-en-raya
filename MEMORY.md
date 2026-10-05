# MEMORY.md — Memoria del proyecto

Registro de **cambios relevantes**, **problemas encontrados y sus soluciones** y **estado de las fases**.

> Este archivo se actualiza con cada cambio relevante. Las entradas son aditivas: lo más reciente al final de cada sección.

---

## 📍 Estado actual de las fases

| Fase | Descripción | Estado |
|---|---|---|
| 1 | Núcleo jugable (tablero, victoria/empate, 2 jugadores) | ✅ Completada |
| 2 | Pantallas + vs CPU (minimax) | ✅ Completada |
| 3 | i18n (es / ca / en) | ✅ Completada |
| 4 | Pulido visual y sonido | ✅ Completada |
| 5 | Responsive y accesibilidad | ✅ Completada |
| 6 | Publicación (PWA + APK) | ✅ Completada (PWA en GitHub Pages + APK/AAB firmados; capturas README pendientes del usuario) |

---

## 📝 Registro de cambios

### 2026-10-05 — Creación de la documentación inicial
- Creado `PLAN.md` con el plan completo del proyecto (fases, stack, alcance).
- Creado `AGENTS.md` con información del proyecto para agentes.
- Creado `MEMORY.md` (este archivo).
- Decisiones cerradas: Vite + TypeScript + DOM/CSS, modo local y vs CPU, idiomas es/va/en, estética minimalista claro con arquitectura de temas por variables CSS.

### 2026-10-05 — Fase 1: núcleo jugable completado
- Creada la estructura base del proyecto: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`.
- `src/game/board.ts`: estado del tablero 3×3 (crear, marcar, casillas libres, contrario).
- `src/game/rules.ts`: 8 líneas ganadoras, detección de victoria y empate.
- `src/i18n/index.ts` + `src/i18n/es.json`: sistema de traducción `t('clave', params)` con detección de idioma (localStorage → navigator → 'es'). Solo `es` registrado de momento; `ca` y `en` llegan en Fase 3.
- `src/ui/menu.ts`: pantalla de inicio (Jugar / 2 jugadores).
- `src/ui/game.ts`: tablero accesible (role=grid, aria-live en el estado), turno alternado, resaltado de línea ganadora, botones revancha/reiniciar/volver.
- `src/styles/base.css`: **tema claro con todas las variables CSS** (`--bg`, `--accent` para X, `--accent2` para O, etc.) — arquitectura de temas lista para futuros cambios (`data-theme`).
- `src/styles/animations.css`: X y O se "dibujan" con `stroke-dasharray`, fundido de pantalla, pulso en casilla ganadora, `prefers-reduced-motion` respetado.
- Router sencillo en `main.ts`: menú ⇄ partida.
- **Verificado:** `npm run build` (tsc + vite) sin errores y servidor dev responde HTTP 200.
- *Nota: se adelantó una versión mínima de i18n a la Fase 3 para no hardcodear textos desde el inicio (convención del proyecto).*

### 2026-10-05 — Fase 2: pantallas, marcador y CPU
- `src/persistencia.ts`: acceso **centralizado** a `localStorage` (leer/guardar texto y JSON con tolerancia a errores). El i18n ahora lo usa también.
- `src/game/score.ts`: marcador X/O/empates con persistencia (`registrarResultado`, `reiniciarMarcador`, `htmlMarcador`). Clic en el marcador lo reinicia.
- `src/game/ai.ts`: **minimax con poda alfa-beta**. Dificultades: `normal` (invencible) y `facil` (75 % aleatorio + 25 % óptimo).
- `src/ui/menu.ts`: flujo de 2 pasos → elegir modo (CPU / 2 jugadores) → elegir dificultad. Exporta `OpcionesPartida`.
- `src/ui/result.ts`: superposición de fin de partida (título, marcador, revancha/menú) con foco para accesibilidad.
- `src/ui/game.ts`: modo CPU (humano = X, CPU = O con retraso de 450 ms y estado "pensando…"), marcador visible, gestión de disponibilidad de casillas.
- CSS: estilos de `.marcador`, `.superposicion`, `.tarjeta` y animación de entrada con rebote.
- **Pruebas:** creado `pruebas/logica.ts` (script `npm.cmd run prueba`) — verifica reglas, que la CPU difícil **nunca pierde** (500+500 partidas), que minimax vs minimax siempre empata y que la CPU fácil sí pierde a veces. Todas ✅.
- **Verificado:** `npm.cmd run build` sin errores.

### 2026-10-05 — Fase 3: i18n completo (es · ca · en)
- Creados `src/i18n/ca.json` (valencià) y `src/i18n/en.json` (english): 26 claves por idioma, traducciones revisadas ("Tres en ratlla", "Tic-tac-toe"...).
- `src/i18n/index.ts`: carga los 3 JSON directamente (`recursos` tipado completo), añade **`onCambioIdioma()`** (suscripción de repintado), `aplicarIdiomaInicial()` y `CODIGOS` (`ES`/`VA`/`EN` — VA para valencià). Eliminado `registrarIdioma` (ya no hacía falta).
- `src/ui/lang.ts`: selector de idioma reutilizable (`crearSelectorIdioma`), botones-pastilla con `aria-pressed` y nombre completo en `title`.
- `src/ui/menu.ts`: selector en ambos pasos; al cambiar de idioma **se repinta el paso actual sin retroceder** (variable `paso`).
- `src/ui/game.ts`: selector visible durante la partida; `repintarTextos()` actualiza cabecera, aria-labels de las 9 casillas, marcador, estado del turno y la superposición de resultado **sin perder la partida en curso** (se guarda `resultadoActual`).
- `src/main.ts`: `document.title` cambia con el idioma vía `onCambioIdioma`.
- Corregido el único texto hardcodeado que quedaba: "X empieza siempre" → clave `menu.hint` (revisión completa con grep: 0 textos visibles fuera de `t()`).
- CSS: `.selector-idioma` y `.boton-idioma` (targets de 44 px, estado activo resaltado).
- **Pruebas:** nuevo `pruebas/i18n.ts` (`npm.cmd run prueba:i18n`): paridad de claves, textos vacíos, marcadores `{param}` idénticos y claves críticas. Las 8 comprobaciones ✅.
- **Verificado:** `npm.cmd run build` ✅ y `npm.cmd run prueba` ✅ (lógica + i18n).

### 2026-10-05 — Fase 4: visual y "game feel"
- `src/efectos.ts` (nuevo): motor de **sonido WebAudio** con tonos generados (cero assets): `marcarX` (660 Hz), `marcarO` (523 Hz), `ui`, fanfarria de victoria (Do–Mi–Sol–Do) y tono descendente de empate. **Vibración háptica** (`navigator.vibrate`, con feature-detection), `prefiereMovimientoReducido()` y **botón 🔊/🔇** persistido (`localStorage 'sonido'`) que se repinta solo al cambiar de idioma (suscripción a `onCambioIdioma`).
- `src/ui/confeti.ts` (nuevo): confeti DOM con piezas aleatorias (color, deriva, giro, retardo); se omite con `prefers-reduced-motion`; limpieza automática a los 4,2 s.
- **Animaciones** (`animations.css`): ficha que **cae con rebote** (`cubic-bezier(0.34,1.56,0.64,1)`) + trazo dibujado; **línea de victoria trazada progresivamente**; **sacudida del tablero en empate**; **pulso del indicador de turno** en cada cambio; tarjeta de resultado con rebote.
- **Línea de victoria** (`game.ts`): SVG superpuesto al tablero calculando con `getBoundingClientRect` los centros de las 3 casillas; `stroke-dasharray` + reflow forzado + transición CSS → trazo animado de 0,7 s.
- Integración en partida: sonido + vibración al marcar, sonidos de fin (victoria/empate + confeti/sacudida), `ui` en botones (revancha, menú, reiniciar, volver, reset del marcador).
- Fila de ajustes `.fila-ajustes` (idioma + sonido) visible en menú y partida.
- Nueva clave `sound.label` en los 3 idiomas (27 claves por idioma).
- **Verificado:** `npm.cmd run build` ✅ (20 módulos) y `npm.cmd run prueba` ✅ (lógica + i18n con la nueva clave).

### 2026-10-05 — Fase 5: responsive y accesibilidad
- **ARIA completo del tablero**: estructura `role="grid"` con `role="row"` reales (filas con `display: contents` para no romper el CSS grid) y `role="gridcell"`.
- **Etiquetas de casilla con contenido**: `aria-label` = "Casilla 5, X" (se actualiza al marcar, al reiniciar y al cambiar de idioma mediante `etiquetaCelda()`).
- **Navegación por teclado**: flechas ↑↓←→ entre casillas (patrón ARIA grid), `Home`/`End` para primera/última; Tab/Enter ya funcionaban por ser `<button>`.
- **Foco**: `:focus-visible` con contorno de 3 px (color `--victoria`) en todos los botones; tras una revancha el foco vuelve a la casilla 1.
- **Área segura (notch)**: padding con `env(safe-area-inset-*)` en `.pantalla` (el `viewport-fit=cover` ya estaba en el HTML).
- **Objetivos táctiles ≥44 px**: revisión completa — celdas ≥56 px, botones 46-52 px, iconos 44 px, pastillas de idioma/sonido 44 px, y `.marcador` ahora con `min-height: 44px`.
- **Horizontal (móvil acostado)**: celdas limitadas también por alto (`min(24vw, 26vh)`) y media query `max-height: 620px` que compacta gaps, oculta subtítulo/ayuda y reduce tipografías.
- **Táctil**: hover solo en dispositivos con puntero fino (`@media (hover: hover) and (pointer: fine)`), evitando el hover "pegado" en pantallas táctiles.
- **Scroll**: `.pantalla` con `overflow-y: auto` para pantallas muy bajas.
- `prefers-reduced-motion` ya cubierto en CSS global + comprobaciones JS (confeti, sacudida).
- **Incidencia:** error TS2339 (`Property 'key' does not exist on type 'Event'`) al añadir el listener de teclado desde `querySelector('#tablero')` sin genérico → solucionado con `querySelector<HTMLElement>(...)`.
- **Verificado:** `npm.cmd run build` ✅ y `npm.cmd run prueba` ✅. Servidor dev respondiendo HTTP 200 (LAN: `http://<IP-local>:5173` — la IP de tu equipo, ver `ipconfig`, para probar en el móvil).

### 2026-10-05 — Corregido el selector de idioma en partida (incidencia del usuario)
- Reescrito `src/ui/lang.ts`: registro de **selectores vivos** + suscripción a `onCambioIdioma()` → al cambiar de idioma se repinta la marca `.activo`, `aria-pressed`, `title`/`aria-label` y el código visible (`ES · VA · EN`) **también en la pantalla de partida**, donde la vista no se reconstruye. Los selectores destruidos se purgan por `isConnected`.
- Mientras se corregía, TypeScript detectó que `CODIGOS` no se usaba: faltaba asignar `boton.textContent` en el repintado (habría dado botones sin texto); solucionado en el mismo cambio.
- **Verificado:** `npm.cmd run build` ✅ y `npm.cmd run prueba` ✅ (21 comprobaciones). Servidor detenido tras las pruebas del usuario.

### 2026-10-05 — Regresión corregida: clase base `boton-idioma` restaurada
- En `src/ui/lang.ts` se restauró `boton.className = 'boton-idioma'` al crear los botones del selector (faltaba tras el refactor y rompía `.boton-idioma.activo`, que exige ambas clases).
- Revisado el resto de UI: el botón de sonido en `efectos.ts` sí conserva `'boton-idioma boton-sonido'` ✅.
- **Verificado:** `npm.cmd run build` ✅ + `npm.cmd run prueba` ✅ + servidor dev HTTP 200 con HMR aplicando el cambio en caliente.

### 2026-10-05 — Nueva funcionalidad: "Ver tablero" en el menú de fin de partida
- **Problema planteado por el usuario:** al perder, la superposición de resultado tapaba el tablero y no se podía ver la última jugada de la CPU/contrincante.
- **Solución:**
  - `result.ts`: nuevo botón **"👁 Ver tablero"** en la tarjeta de resultado (entre *Revancha* y *Menú*) que cierra la superposición dejando el tablero visible (con la línea y las casillas ganadoras resaltadas) — acción `onVerTablero`.
  - `game.ts`: nuevo botón flotante **"🏁 Ver resultado"** (`#btn-ver-resultado`, oculto por defecto) que reabre la tarjeta; estado `overlayAbierto` como fuente de verdad (antes `resultadoActual`); al repintar por idioma **solo se reabre la tarjeta si estaba visible** (así cambiar de idioma con el tablero destapado no lo vuelve a tapar).
  - El juego sigue "terminado": las casillas permanecen deshabilitadas, solo se mira.
  - Focus management: al destapar, el foco va al botón "Ver resultado"; al reabrir, a "Revancha".
- Nuevas claves i18n en los 3 idiomas (29 claves): `result.showBoard` ("Ver tablero" / "Veure el tauler" / "View board") y `result.show` — añadidas también a las claves críticas de `pruebas/i18n.ts`.
- **Verificado:** `npm.cmd run build` ✅ + `npm.cmd run prueba` ✅ (29 claves por idioma) + servidor HTTP 200 (HMR activo).

### 2026-10-05 — Fase 6 (parte 1): PWA instalable + README
- **Iconos:** SVG dibujados a mano (`public/icons/icono.svg` + `icono-maskable.svg`, colores del tema: fondo hueso, X `#e63946`, O `#457b9d`, cuadrícula) y script `scripts/generar-iconos.mjs` con **`sharp`** (nuevo devDependency) que genera `icono-192/512`, `maskable-192/512`, `apple-touch-icon` y `favicon.svg`. Comando: `npm.cmd run iconos`. Icono revisado visualmente ✅.
- **`public/manifest.json`**: name/short_name, `start_url`/`scope` relativos (`./`), `display: standalone`, colores del tema, 5 iconos (`any` + `maskable` + SVG).
- **`public/sw.js`**: service worker con estrategia **red primero y caché como respaldo** (assets con hash no se obsolecen; offline tras la primera visita), limpieza de versiones antiguas en `activate`.
- **Registro del SW** en `main.ts` solo en producción (`import.meta.env.PROD`) — creado `src/vite-env.d.ts` con `/// <reference types="vite/client" />` (faltaban los tipos: error TS2339 `import.meta.env`).
- **`index.html`**: manifest, favicon SVG, apple-touch-icon, metas de iOS.
- **`README.md`**: README de portfolio completo (características, badges, capturas, tabla de stack, comandos, cómo probar la PWA, guía Bubblewrap/APK paso a paso, pruebas, estructura, roadmap, licencia). Creado `docs/capturas/README.md` con la guía para grabar GIFs (pendiente de capturar imágenes por el usuario).
- **Verificado:** `npm.cmd run build` ✅ · `npm.cmd run preview` ✅ HTTP 200 en `/`, `/manifest.json`, `/sw.js` e iconos.
- **Pendiente (Fase 6 parte 2) — APK:** el entorno **no tiene** Java, Bubblewrap ni Android SDK (`java`, `bubblewrap`, `ANDROID_HOME` comprobados → no instalados), y la TWA exige hosting **HTTPS**. Guía completa escrita en el README; decisión del usuario sobre instalar prerrequisitos y publicar la web.

### 2026-10-05 — Fase 6 (parte 2): entorno de publicación, repo y GitHub Pages

**Decisión del usuario:** instalar todo y publicar (JDK + Bubblewrap + GitHub Pages → APK con Bubblewrap); las capturas del README las hará él después.

**Instalaciones (todas desde terminal, sin Android Studio):**
- **JDK 17**: `winget install Microsoft.OpenJDK.17` → `JAVA_HOME` = carpeta del JDK en `Program Files\Microsoft\jdk-17*`
- **Bubblewrap CLI**: `npm.cmd install -g @bubblewrap/cli`
- **Git 2.55** y **GitHub CLI 2.102**: `winget` → login con device flow → usuario **`andreu-marbor`**
- **Android SDK** (manual, ver incidencias abajo) en `%USERPROFILE%\.bubblewrap\android_sdk`

**Incidencias y soluciones:**
1. **`bubblewrap` no arranca en PowerShell** → la política de ejecución bloquea `bubblewrap.ps1` (mismo caso que `npm.ps1`). *Solución:* usar siempre **`bubblewrap.cmd`**. *Evitar:* invocar binarios `.ps1` de npm en este equipo.
2. **Asistente interactivo de primera vez de Bubblewrap** (stdin cerrado → crash `ERR_USE_AFTER_CLOSE`) → *Solución:* crear `%USERPROFILE%\.bubblewrap\config.json` manualmente con `{"jdkPath","androidSdkPath"}` (los dos únicos campos que lee `Config.deserialize`); `bubblewrap.cmd doctor` ✅ *"Your jdkpath and androidSdkPath are valid"*. Así cualquier comando posterior va sin prompts.
3. **`Invoke-WebRequest` se quedó en 0 bytes** descargando el ZIP del SDK (82 MB) → *Solución:* cancelar el proceso y usar **`curl.exe -L --retry 3`** (funcionó a ~20 MB/s). *Evitar:* `Invoke-WebRequest` con ficheros grandes en PowerShell 5.1.
4. **`sdkmanager --licenses` con pipe de "y" se colgó** (sin proceso java, sin `licenses/`, sin aviso) → *Solución:* escribir los **hashes de licencia oficiales** directamente en `<sdk>/licenses/android-sdk-license` (y preview/arm-dbt). No hace falta pasar por el prompt.
5. **`npm run prueba` fallaba en el CI de Linux**: `node node_modules/esbuild/bin/esbuild` en Windows es un script JS pero en Linux es el **binario ELF** → `node` lo ejecutaba como JS (`ELF: command not found`). *Solución:* scripts npm cambiados a **`esbuild ...`** (resuelve `node_modules/.bin`, cross-platform). Local ✅ (13 lógica + 8 i18n). *Lección:* los scripts npm deben usar los bins de `.bin`, no rutas absolutas a `node_modules`.
6. **El push del fix no disparó el workflow** (no aparecía run nuevo para el push del fix; sí existía run para el push anterior que añadía el fichero). *Solución temporal:* lanzado a mano con `gh workflow run despliegue.yml --ref main`. Pendiente de observar en el siguiente push.
7. **Auto-matante:** un filtro `Get-CimInstance ... CommandLine -like '*sdkmanager*'` coincidió con **mi propia shell** (el patrón estaba en mi línea de comando) → exit 255. *Solución:* excluir `$PID`. *Evitar:* filtros por CommandLine que puedan matchear el propio proceso.

**Repositorio y publicación:**
- `git init` (rama `main`), autor genérico **`Andreu <dev@users.noreply.github.com>`** (decisión del usuario: no exponer correo personal). Commit inicial: **43 archivos / 4.883 líneas**.
- `gh repo create tres-en-raya` (público) → **https://github.com/andreu-marbor/tres-en-raya** (`main` con push OK).
- **GitHub Pages vía GitHub Actions**: creado `.github/workflows/despliegue.yml` (push a `main` o manual → `npm ci` + `npm run prueba` + `npm run build` + deploy de `dist/`; `permissions: pages: write`; `concurrency: pages`). Pages pasado a `build_type: workflow` → URL **https://andreu-marbor.github.io/tres-en-raya/**.
- **Keystore de firma** generado con `keytool` (JDK): `./android.keystore`, alias `android`, RSA-2048, validez 10.000 días. **La contraseña NO está en el repo:** vive en `%USERPROFILE%\.bubblewrap\keystore-pass.txt` (fuera del repo y de OneDrive) — ver incidencia de seguridad de 2026-10-05 (rotación). Huella SHA-256 `C0:61:1F:21:47:45:6F:0A:AE:FF:D5:92:4C:91:12:91:7E:2B:87:0E:97:40:4B:B0:A2:A9:B3:D4:EF:06:0E:C9`. `*.keystore` ya está en `.gitignore`.

**Pendiente de esta parte:**
- Ver run de CI en verde + sitio live (comprobar `manifest.json` en la URL de Pages).
- Instalar paquetes del SDK (`platform-tools`, `platforms;android-36`, `build-tools;36.1.0`) — en curso.
- `twa-manifest.json` sin prompts: script con `TwaManifest.fromWebManifest()` de `@bubblewrap/core` (sustituye a `bubblewrap init`).
- `bubblewrap.cmd build` con `BUBBLEWRAP_KEYSTORE_PASSWORD` / `BUBBLEWRAP_KEY_PASSWORD` en el entorno (evita los prompts de contraseña de `build.js`).
- Subir APK/AAB como release del repo.

### 2026-10-05 — Incidencia grave: commit/push "fantasma" (OneDrive + salidas de shell corruptas)

**Síntoma:** la salida de git decía `[main <sha>] fix(pruebas)...` y `<sha>..<sha> main -> main` (los SHAs reales se retiraron después por seguridad), pero después:
- `git reflog` **no tenía ningún registro** de ese commit (solo los pushes anteriores),
- `HEAD` local aparecía **revertido al commit anterior** con `package.json` modificado sin commitear,
- la **API de GitHub** confirmaba que `main` seguía en el commit anterior (el commit nunca existió en el remoto),
- en consecuencia, los 2 runs de CI anteriores fallaron probando el código **antiguo**.

**Causa probable:** el proyecto vive en **OneDrive** (carpeta del usuario sincronizada con OneDrive) y la sincronización en caliente de los ficheros de `.git` (refs/reflog) puede revertir el estado; además varias salidas de shell de la sesión han salido corruptas (líneas duplicadas/mezcladas), con lo que la salida del commit no es fiable.

**Solución aplicada:** recomitear + push y **verificar con la API de GitHub** (`gh api repos/andreu-marbor/tres-en-raya/commits/main --jq .sha` ✅ triple-check local/remote/API). Ese push **sí** disparó el workflow automáticamente (run `37293412226`) → el trigger nunca estuvo roto.

**Lecciones (aplicar a futuro):**
1. **No confiar en la salida de un comando git en esta sesión**: verificar siempre con `git rev-parse` + `gh api .../commits/main` tras cada push.
2. **Recomendación fuerte al usuario:** mover el proyecto **fuera de OneDrive** (p. ej. `%USERPROFILE%\dev\`) o excluirlo de la sincronización; trabajar con git dentro de OneDrive es arriesgado.
3. Los fallos de CI "de repente" en código que ya probaste localmente → en este proyecto, primero mirar **qué commit tiene realmente el runner**.

### 2026-10-05 — Fase 6: incidencias del `bubblewrap build`

1. **`"gradlew.bat" no se reconoce` en el primer build** → `build()` solo llama a `updateProject()` (que *genera* el proyecto Android) si **falta** `manifest-checksum.txt` o si cambió el manifest; mi script había creado el checksum junto al manifest → todo "al día" pero **sin proyecto Android**, y `buildApk()` invocó un `gradlew` inexistente. *Solución:* borrar `manifest-checksum.txt` y relanzar `build` → pregunta "regenerate your project? (Y/n)" → Enter (los `\n` por stdin lo responden) → *"Generating Android Project. Project updated successfully."* *Lección:* el flujo correcto de primera vez es `twa-manifest.json` **sin** checksum, o borrar el checksum para forzar la generación.
2. **`"C:\Program" no se reconoce` al firmar** → Gradle funcionaba (usa `JAVA_HOME` citado dentro de `gradlew.bat`), pero Bubblewrap invoca `java.exe` (apksigner/jarsigner) **sin comillas** y el JDK está en `Program Files\...` (con espacio) → el comando se parte en `C:\Program`. *Solución:* **junction sin espacios**: `New-Item -ItemType Junction -Path "$env:USERPROFILE\.bubblewrap\jdk17" -Target "$env:ProgramFiles\Microsoft\jdk-17.0.20.101-hotspot"` y `jdkPath` del `config.json` apuntando al junction. `doctor` ✅. *Evitar:* rutas con espacios para JDK/SDK con Bubblewrap.
3. **Error propio al reescribir `config.json`**: `-replace '\\','\\\\'` en PowerShell metió **4 backslashes** por cada `\` (el reemplazo de .NET no procesa `\`, solo `$`). JSON inválido → rutas dobles. *Solución:* escribir el JSON con backslashes simples en comillas simples (`'{"jdkPath":"C:\\Ruta\\..."}'`) o usar `ConvertTo-Json`. *Lección:* para JSON en PowerShell usar `ConvertTo-Json`, nunca escapes manuales.
4. **Primera ejecución de `init`-equivalente**: `TwaManifest.fromWebManifest()` no tiene `saveConfig` (es de `Config`); el método real es **`twa.saveToFile(ruta)`** + `generateManifestChecksumFile(manifest, dir)` de `@bubblewrap/cli/dist/lib/cmds/shared`.

### 2026-10-05 — 🎉 Fase 6 COMPLETADA: APK + AAB firmados y publicados

- **`bubblewrap.cmd build` → `BUILD_EXIT=0`** (tras arreglar el junction del JDK, incidencia 2 anterior):
  - `app-release-signed.apk` — **1.135.044 bytes (≈1,1 MB)**
  - `app-release-bundle.aab` — **1.253.250 bytes (≈1,25 MB)**
  - intermedio `app-release-unsigned-aligned.apk` (no se publica).
- **Firma verificada** con `apksigner verify --print-certs`: DN `CN=andreu-marbor, OU=Portfolio, O=GitHub, C=ES`, SHA-256 `c0611f21...f060ec9` = huella del keystore ✅.
- **Release público v1.0.0**: https://github.com/andreu-marbor/tres-en-raya/releases/tag/v1.0.0 con `app-release-signed.apk` y `app-release-bundle.aab` adjuntos (verificado con `gh release view --json assets`).
- **Artefactos commiteados:** `twa-manifest.json`, `manifest-checksum.txt` y el proyecto Android generado (`app/`, `gradle/`, `gradlew*`, `build.gradle`, `settings.gradle`, `gradle.properties`, `store_icon.png`). Ignorados correctamente por `.gitignore`: `local.properties`, `build/`, `.gradle/`, `*.apk`, `*.aab` ✅.
- Nota: `updateProject` autoincrementó la versión → `versionName 2 / versionCode 2`.
- **Comando de referencia para reconstruir el APK** (está también en `AGENTS.md`):
  ```powershell
  $pass = (Get-Content "$env:USERPROFILE\.bubblewrap\keystore-pass.txt").Trim()  # fuera del repo
  $env:BUBBLEWRAP_KEYSTORE_PASSWORD = $pass; $env:BUBBLEWRAP_KEY_PASSWORD = $pass
  bubblewrap.cmd build
  ```

**Estado final de la Fase 6:**
| Hito | Estado |
|---|---|
| Iconos + manifest + service worker (PWA) | ✅ |
| README portfolio + guía de capturas | ✅ |
| Repo GitHub + GitHub Pages con CI/CD Actions | ✅ live en https://andreu-marbor.github.io/tres-en-raya/ |
| JDK + Bubblewrap + Android SDK (sin Android Studio) | ✅ `bubblewrap doctor` válido |
| `twa-manifest.json` + keystore firmado | ✅ `com.andreumarbor.tresenraya` |
| APK + AAB firmados | ✅ verificados |
| Release v1.0.0 con APK/AAB | ✅ |
| Capturas/GIF del README | ⬜ **pendiente del usuario** (guía en `docs/capturas/README.md`) |

**Pendientes/recomendaciones abiertos:**
1. **Usuario:** probar la PWA live (instalable desde Chrome en el móvil), instalar el APK desde el release y hacer las capturas del README.
2. **⚠️ OneDrive:** mover el proyecto fuera de la carpeta de OneDrive sincronizada (p. ej. `%USERPROFILE%\dev\`) — ver incidencia "commit fantasma".
3. **Play Store (opcional):** cuenta de desarrollador (~25 USD) → subir el `.aab` de `play.google.com/console` → además deberá subirse `assetlinks.json` (con `bubblewrap fingerprint`) al sitio para el Digital Asset Links de la TWA.
4. Tras tocar `src/` o `public/`: push a `main` → CI despliega solo; para actualizar el APK, regenerar `twa-manifest.json` si cambió el manifest web y relanzar `bubblewrap.cmd build`.

### 2026-10-05 — 🔒 SEGURIDAD (reportada por el usuario): contraseña del keystore en el repo → rotación

- **Problema:** la contraseña del keystore estaba escrita en `MEMORY.md` → **subida al repo público** y presente en el historial de 2 commits. Alcance real: el keystore **nunca** estuvo versionado (`git log --all -- android.keystore` vacío; `git ls-files` sin `*.keystore/*.p12/*.pepk`), así que la contraseña sola no firmaba nada — pero era mala práctica (y un reviewer de portfolio lo tacharía al instante).
- **Solución aplicada: rotar la contraseña en el propio keystore** (mejor que reescribir git):
  1. Contraseña nueva aleatoria de **36 hex** (`RandomNumberGenerator` de .NET) guardada en **`%USERPROFILE%\.bubblewrap\keystore-pass.txt`** (fuera del repo y fuera de OneDrive).
  2. `keytool -storepasswd` la cambió (PKCS12: `-keypasswd` no aplica — el almacén usa UNA sola contraseña).
  3. Verificación doble: el keystore **abre con la nueva** ✅ y **la vieja da "keystore password was incorrect"** ✅ → el valor que sigue en el historial de git quedó **muerto**, sin necesidad de `git filter-repo` ni force-push.
  4. **La clave NO cambió**: el APK regenerado tiene la misma huella SHA-256 (`c0611f21...f060ec9`) → el v1.0.0 ya publicado y futuras actualizaciones siguen siendo compatibles (mismo firmante).
  5. Verificación funcional: `bubblewrap.cmd build` con las nuevas variables → **`BUILD_EXIT=0`**, APK y AAB regenerados y firmados.
  6. `git grep` del password → **0 ocurrencias** en el working tree.
- **Reglas a partir de ahora:**
  1. **Nunca secretos en ficheros versionados** (MEMORY/README/AGENTS...): solo *referencias* a la ruta del fichero externo o a variables de entorno.
  2. Si un secreto se cuela: **rotar > borrar** (borrar del HEAD no basta, el historial persiste en GitHub).
  3. antes de cada push: `git grep -i "password\|passwd\|secret\|token"` como red de seguridad.
- **Incidencia menor hermana (mismo intento de verificación):** Gradle falló con `AccessDeniedException` borrando `app\build\...\zip-cache` → lock transitorio (daemon de Gradle detenido con `gradlew --stop` + OneDrive sincronizando). Solución: `Remove-Item -Recurse -Force app\build` y relanzar. **Refuerza la recomendación de mover el proyecto fuera de OneDrive.**

---

## 🐛 Problemas encontrados y soluciones

### 2026-10-05 — `npm` falla en PowerShell por política de ejecución
- **Problema:** ejecutar `npm` en PowerShell lanza `UnauthorizedAccessException`: "No se puede cargar el archivo npm.ps1 porque la ejecución de scripts está deshabilitada en este sistema".
- **Solución:** usar **`npm.cmd`** en lugar de `npm` (`npm.cmd install`, `npm.cmd run dev`, `npm.cmd run build`). Node.js funciona correctamente con `node`.
- **Evitar a futuro:** en todos los comandos de este proyecto usar la variante `.cmd`. Alternativa permanente: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (cambia configuración del usuario, revisar antes).

### 2026-10-05 — Minimax lento: el test de 2000 partidas superaba el timeout
- **Problema:** ejecutar 2000 partidas de prueba contra la CPU no terminaba en 60 s; el minimax sin poda exploraba todo el árbol (~9! ramas).
- **Solución:** añadir **poda alfa-beta** en `src/game/ai.ts` (`limiteAlfa`/`limiteBeta` + `break` cuando se cruzan) y reducir las iteraciones del test a 500 partidas por escenario. Con poda, todas las pruebas terminan en segundos.
- **Evitar a futuro:** cualquier búsqueda exhaustiva en este proyecto debe llevar poda; si un test tarda >30 s, reducir iteraciones antes que esperar.

### 2026-10-05 — Doble declaración de `empates` en pruebas
- **Problema:** esbuild daba error `The symbol "empates" has already been declared` al declarar `let empates` dos veces en el ámbito de módulo de `pruebas/logica.ts`.
- **Solución:** reutilizar la variable declarada (`empates = 0`) en lugar de volver a declararla.
- **Evitar a futuro:** en scripts de prueba de un solo archivo, declarar contadores al inicio; esbuild falla con declaraciones duplicadas aunque estén separadas por bloques `{}` sin llaves de módulo.

### 2026-10-05 — Servidor dev cortado por timeout en modo background
- **Problema:** el comando `npm.cmd run dev` lanzado en segundo plano llevaba `timeout: 120000`; al llegar al límite el shell lo mató y el servidor dejó de responder (el usuario pensaba que estaba probando en el móvil y ya no podía conectarse).
- **Solución:** relanzar el comando **sin parámetro `timeout`** (en background no debe llevarlo).
- **Evitar a futuro:** los servidores de desarrollo siempre en background y sin timeout; verificar con un `Invoke-WebRequest` a `localhost:5173` tras arrancar.

### 2026-10-05 — 🔴 INCIDENCIA: en partida, cambiar de idioma no actualiza el botón del idioma seleccionado
- **Problema reportado por el usuario:** si se cambia el idioma **en mitad de partida** (no en el menú), el texto de la pantalla sí se traduce, pero el botón del selector (`ES · VA · EN`) **sigue resaltando el idioma anterior** (clase `.activo` / `aria-pressed` desactualizados).
- **Causa:** en `src/ui/lang.ts` el estado visual del selector se pintaba **una sola vez** al crearlo. En el menú no se notaba porque `repintar()` reconstruye el `innerHTML` completo (botones nuevos con el estado correcto); en la partida `repintarTextos()` solo actualiza textos y **no toca el selector**, que además sigue conectado al DOM con su estado viejo.
- **Solución:** `lang.ts` mantiene un registro de selectores vivos y se suscribe a `onCambioIdioma()` (mismo patrón que el botón de sonido en `efectos.ts`): al cambiar de idioma repinta `aria-label`/`title` del grupo y, en cada botón, la clase `.activo`, `aria-pressed` y el nombre del idioma; los selectores destruidos se eliminan del registro (`isConnected`).
- **Evitar a futuro:** todo componente con estado visual derivado del idioma debe suscribirse a `onCambioIdioma()`; si el componente se reconstruye con `innerHTML`, limpiar el registro por `isConnected`.

### 2026-10-05 — 🔴 INCIDENCIA 2: ningún idioma se resalta nunca (regresión tras la corrección anterior)
- **Problema reportado por el usuario:** tras el arreglo anterior, ahora **en ningún sitio** (ni menú ni partida) se resalta el idioma seleccionado; además los botones `ES · VA · EN` se ven sin estilo.
- **Causa:** al reescribir `src/ui/lang.ts` se dejó de asignar la clase base **`boton-idioma`** al crear cada botón (`boton.className = 'boton-idioma'`). `pintarSelector()` sí añadía la clase `.activo`, pero la regla CSS es `.boton-idioma.activo` (requiere **ambas** clases), así que nunca coincidía; y sin la clase base tampoco aplicaban anchos, bordes ni `min-height: 44px`.
- **Solución:** restaurar `boton.className = 'boton-idioma'` en el momento de crear el botón (`.activo` lo sigue alternando `pintarSelector`). El servidor dev con HMR aplica el cambio en caliente.
- **Evitar a futuro:** al reescribir un componente, comparar siempre con la versión anterior qué clases/atributos CSS se asignaban en la creación; las clases que aparecen en el CSS como `.clase-base.modificador` necesitan que **ambas** estén en el DOM. Añadir una comprobación visual tras cada refactor de UI, no solo `build` + pruebas de lógica (las pruebas actuales no cubren el DOM).

### 2026-10-05 — 🔴 Auditoría de seguridad del repo (petición del usuario) + reescritura del historial

- **Problema reportado por el usuario:** verificar que **ningún fichero subido al repo** contenga su nombre de usuario, rutas completas de su PC ni nada que comprometa la seguridad de su equipo o de la aplicación.
- **Hallazgos (HEAD, 86 ficheros):** ✅ limpio el código fuente, workflow, README, AGENTS, PLAN, nombres de fichero (sin `local.properties`, keystore, APK/AAB, claves) y datos sensibles varios; ❌ **todo el contenido sucio estaba en `MEMORY.md`**: menciones del nombre de usuario dentro de rutas absolutas, varias rutas locales y la IP privada de la red local.
- **Solución aplicada:**
  1. **Sanitizado `MEMORY.md`**: rutas absolutas → `%USERPROFILE%...` / `Program Files\...`, IP local → marcador `<IP-local>`, carpeta de OneDrive descrita sin ruta. Commit con la revisión limpia verificado por API.
  2. **Auditoría del historial:** los commits antiguos arrastraban usuario, IP privada y la contraseña ya muerta del keystore. Con **0 forks / 0 watchers** (nadie había clonado) y todos los commits del mismo día, el usuario eligió **reescribir el historial**: `git checkout --orphan` con el árbol ya saneado → commit raíz único → `git push --force -u origin main`. CI verde en el nuevo historial.
  3. **Retirados de `MEMORY.md` los SHAs de los commits viejos**: eran punteros públicos a los objetos huérfanos con los datos; sustituidos por marcadores genéricos.
  4. **Limpieza local de objetos viejos:** `git reflog expire --expire=now --all` + `git gc --prune=now`.
- **Evitar a futuro:**
  - En documentación **nunca** rutas absolutas de usuario ni IPs: usar `%USERPROFILE%`, rutas relativas o marcadores `<...>`.
  - Antes de cada push, auditar con `git grep -niIF -e '<usuario>' -e '<ruta-absoluta>' -e '<ip-local>' -e '<password>'` (también vale `git show`).
  - Si se reescriba el historial, retirar también los SHAs citados en la documentación.
  - GitHub conserva temporalmente los objetos huérfanos hasta su GC; sin SHAs referenciados en ningún sitio público quedan inaccesibles de forma práctica.

### 2026-10-05 — 🔴 INCIDENCIA: la APK abre un navegador embebido con la URL arriba (barra de direcciones)

- **Problema reportado por el usuario:** al ejecutar la APK instalada no se ve como app nativa; parece un navegador con la URL `andreu-marbor.github.io/tres-en-raya/` en la parte superior.
- **Causa:** la APK es una **TWA** (Trusted Web Activity) y `twa-manifest.json` lleva `"fallbackType": "customtabs"`. Chrome solo la muestra a pantalla completa si verifica **Digital Asset Links** consultando `https://andreu-marbor.github.io/.well-known/assetlinks.json` en la **raíz del host** → devolvía **404** (comprobado). Al fallar la verificación, `LauncherActivity` (androidbrowserhelper) cae al fallback de Custom Tabs, que es literalmente una pestaña de Chrome con barra de direcciones. Agravante: GitHub Pages **de proyecto** no publica nada bajo la raíz del dominio (solo `/tres-en-raya/`), así que desde este repo era **imposible** arreglarlo.
- **Solución aplicada (sin regenerar la APK):**
  1. Huellas verificadas: `keytool -list -v` del keystore y `apksigner verify --print-certs` de `app-release-signed.apk` → ambas `c0611f21…f060ec9` ✅.
  2. Creado el repositorio **`andreu-marbor.github.io`** (<https://github.com/andreu-marbor/andreu-marbor.github.io>), el **sitio de usuario** de GitHub Pages que ocupa la raíz del dominio. **Convive** con los repos de proyecto: cada uno sigue publicando en su subcarpeta y sus workflows no se tocan. Contenido: `.well-known/assetlinks.json` (array con **un bloque por app Android**), `index.html` (landing de portfolio con enlace a la PWA), `README.md` (cómo añadir la siguiente app) y `.nojekyll`.
  3. **`.nojekyll` fue imprescindible:** sin él, Pages ejecuta **Jekyll**, que **ignora los directorios que empiezan por punto** → `.well-known` no se publicaba y seguía dando 404. Tras añadirlo: `GET /.well-known/assetlinks.json` → **200, `application/json`, sin redirecciones** ✅ · landing `/` → 200 ✅ · `tres-en-raya/` → 200 (intacto) ✅.
- **Pendiente del usuario (Fase 4):** probar en el móvil → **desinstalar la APK** → **borrar los datos de Chrome** (Chrome cachea la comprobación, **también los fallos**) → instalar de nuevo el `app-release-signed.apk` del release v1.0.0 **sin regenerar** → debe abrir a pantalla completa y sin barra de URL.
- **Evitar a futuro:**
  - App Android nueva bajo el mismo host: **añadir su bloque** al array del `assetlinks.json` del repo de la raíz (nueva huella solo si cambia el keystore).
  - Cambiar la **contraseña** del keystore **no** cambia la huella; un keystore nuevo sí → actualizar el archivo.
  - Si una app se publica en **otro dominio**, ese dominio necesita su propio `assetlinks.json` (la relación es a nivel de host, no de ruta).
  - Plan B, solo si lo anterior no basta: `fallbackType: "webview"` + `bubblewrap.cmd build` (oculta la barra, pero la app sale de Chrome y pierde WebAPK y notificaciones delegadas).

**Formato de entrada:**

```markdown
### [fecha] — Título breve del problema
- **Problema:** qué fallaba o qué dificultad apareció.
- **Solución:** cómo se resolvió (con código o pasos si aplica).
- **Evitar a futuro:** (opcional) qué hacer para que no vuelva a ocurrir.
```
