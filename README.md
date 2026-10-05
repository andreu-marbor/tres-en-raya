# 3 en raya — Tic-tac-toe

> Juego de 3 en raya para Android/Web, minimalista y multilenguaje (**español · valencià · english**), con IA invencible, sonido generado por código y experiencia pulida. PWA instalable.

![Tipo](https://img.shields.io/badge/tipo-juego%20de%20tablero-e63946)
![Stack](https://img.shields.io/badge/stack-TypeScript%20%2B%20Vite-457b9d)
![Idiomas](https://img.shields.io/badge/idiomas-es%20%C2%B7%20va%20%C2%B7%20en-2a9d8f)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

## 🎮 Sobre el juego

Un clásico 3 en raya con acabado de app moderna: animaciones con rebote, línea de victoria que se dibuja, confeti, vibración háptica, sonido WebAudio (cero assets) y tres idiomas que puedes cambiar **en mitad de partida sin perder el estado**.

### Características

- **Dos modos**: 2 jugadores en local y contra la CPU con dos dificultades
  - *Normal*: minimax con poda alfa-beta → **invencible** (nunca pierde)
  - *Fácil*: 75 % aleatorio para partidas distendidas
- **Trilingüe** (es / va / en) con detección automática del navegador y selector persistente
- **Game feel**: fichas que caen con rebote, línea de victoria trazada, confeti al ganar, sacudida al empatar, fanfarria y tonos generados con WebAudio, vibración háptica
- **Marcador persistente** (X · Empates · O) entre sesiones
- **"Ver tablero"** al terminar la partida: mira la última jugada antes de repetir
- **Accesible**: navegación con flechas (patrón ARIA grid), lector de pantalla, foco visible, `prefers-reduced-motion`
- **Responsive**: vertical y horizontal, área segura (notch), objetivos táctiles ≥ 44 px
- **PWA instalable** con service worker (funciona offline tras la primera visita)

## 📸 Capturas

> 📁 Las capturas se guardan en [`docs/capturas/`](docs/capturas/README.md) (cómo grabarlas incluido).

| Menú | Partida | Victoria |
| --- | --- | --- |
| _pendiente_ | _pendiente_ | _pendiente_ |

## 🛠️ Tecnologías

| Capa | Elección | Por qué |
| --- | --- | --- |
| Lenguaje | TypeScript (strict) | Seguridad de tipos, sin framework |
| Render | DOM + CSS | Para un 3×3 el DOM da mejor acabado y texto i18n nativo |
| Build | Vite | Arranque instantáneo, build mínimo (~18 KB JS) |
| Sonido | WebAudio API | Tonalidades generadas, sin descargar assets |
| i18n | Sistema propio (~80 líneas) | 15+ claves no justifican una librería |
| Iconos | SVG → PNG con `sharp` | Reproducible por script |
| Empaquetado | PWA + Bubblewrap (TWA) | APK sin abrir Android Studio |

## ▶️ Ejecutar

```bash
npm.cmd install       # dependencias
npm.cmd run dev       # desarrollo → http://localhost:5173
npm.cmd run build     # build de producción (tsc + vite) → dist/
npm.cmd run preview   # previsualizar el build → http://localhost:4173
npm.cmd run prueba    # pruebas: lógica + paridad i18n
npm.cmd run iconos    # regenerar iconos PNG desde SVG
```

> ⚠️ En Windows/PowerShell usar `npm.cmd` (la política de ejecución bloquea `npm.ps1`).

## 📱 Cómo probar la PWA

1. `npm.cmd run build && npm.cmd run preview`
2. En Chrome: menú ⋮ → **Instalar aplicación** / "Añadir a pantalla de inicio"
3. Para probar en el móvil necesitas un origen seguro (**HTTPS**): publícala (GitHub Pages, Netlify...) o usa `chrome://flags/#unsafely-treat-insecure-origin-as-secure`

## 📦 APK para Android (Bubblewrap / TWA)

La app empaquetada como *Trusted Web Activity* necesita la PWA publicada en **HTTPS**.

**Prerrequisitos** (una sola vez):

1. **JDK 17+**: `winget install Microsoft.OpenJDK.17` (o Adoptium)
2. **Bubblewrap CLI**: `npm install -g @bubblewrap/cli`
3. **Android SDK** (Bubblewrap lo comprueba con `bubblewrap doctor`)

**Build:**

```bash
# 1. Publicar dist/ en un hosting con HTTPS (ej. GitHub Pages)
# 2. Inicializar a partir del manifest publicado
bubblewrap init --manifest = "https://USUARIO.github.io/tres-en-raya/manifest.json"

# 3. Compilar APK y AAB (quedan en ./)
bubblewrap build
```

**Play Store:** cuenta de desarrollador (≈ 25 USD, pago único) → subir el `.aab` → ficha, capturas y clasificación por edad → revisión (horas/días).

> 💡 Alternativa sin instalaciones: [PWABuilder.com](https://www.pwabuilder.com) genera el APK/AAB desde la URL de tu manifest.

## 🧪 Pruebas

```bash
npm.cmd run prueba
```

- `pruebas/logica.ts` — reglas del juego y CPU: 500+500 partidas contra rivales aleatorios **sin perder ninguna**, minimax vs minimax siempre empata, la CPU fácil sí pierde a veces
- `pruebas/i18n.ts` — paridad de claves, textos vacíos y marcadores `{param}` entre los 3 idiomas

## 🗂️ Estructura

```
src/
├── main.ts          # arranque + router de pantallas
├── persistencia.ts  # acceso centralizado a localStorage
├── efectos.ts       # sonido WebAudio, háptica, botón 🔊
├── game/
│   ├── board.ts     # estado del tablero 3×3
│   ├── rules.ts     # 8 líneas ganadoras, victoria/empate
│   ├── ai.ts        # minimax con poda alfa-beta
│   └── score.ts     # marcador persistente
├── i18n/            # t('clave'), es.json / ca.json / en.json
└── ui/              # menu, game, result, lang, confeti
```

## 🗺️ Roadmap (v2)

- Temas visuales (neón, oscuro, retro) — la arquitectura de variables CSS ya está preparada
- Variante 5 en raya y "suite de clásicos"
- Online multijugador y ranking

## 📄 Licencia

MIT
