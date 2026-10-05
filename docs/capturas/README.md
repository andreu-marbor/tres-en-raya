# Capturas del proyecto

Imágenes y GIFs para el README del portfolio.

## Qué grabar

| Archivo | Escena | Duración |
| --- | --- | --- |
| `menu.png` | Pantalla de inicio con selector ES · VA · EN | — |
| `partida.png` | Tablero a mitad de partida con marcas | — |
| `victoria.gif` | Jugada ganadora: caída de ficha → línea → confeti | 4-6 s |
| `empate.gif` | Empate con la sacudida del tablero | 3-4 s |
| `idiomas.gif` | Cambio de idioma en mitad de partida | 3-4 s |

## Cómo grabarlo

- **Pantallas fijas**: captura con `Win + Shift + S` (Windows) o la herramienta del sistema.
- **GIF**: [ScreenToGif](https://www.screenrecorder.net/) (Windows, gratuito) o [LICEcap](https://licecap.sourceforge.net/). Exporta a 24-30 fps, máx. 500 px de ancho.
- **Grabar en el navegador**: `npm.cmd run dev` → pantalla completa (`F11`) → tema claro para que contraste con el fondo del README.

## Cómo insertarlos en el README

Guarda los archivos aquí y sustituye las celdas "_pendiente_" de la tabla:

```markdown
| Menú | Partida | Victoria |
| --- | --- | --- |
| ![Menú](docs/capturas/menu.png) | ![Partida](docs/capturas/partida.png) | ![Victoria](docs/capturas/victoria.gif) |
```
