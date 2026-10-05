import { defineConfig } from 'vite';

// Configuración de Vite para el 3 en raya.
// Base relativa para que la PWA/APK funcione desde cualquier ruta.
export default defineConfig({
  base: './',
  server: {
    host: true, // accesible desde el móvil en la misma red local
    port: 5173,
  },
});
