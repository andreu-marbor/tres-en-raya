/* Prueba de i18n: los 3 idiomas deben tener las mismas claves,
   los mismos marcadores {param} y sin textos vacíos. */

import es from '../src/i18n/es.json';
import ca from '../src/i18n/ca.json';
import en from '../src/i18n/en.json';

let fallos = 0;
function comprobar(condicion: boolean, mensaje: string): void {
  if (condicion) console.log(`  ✅ ${mensaje}`);
  else {
    fallos++;
    console.error(`  ❌ ${mensaje}`);
  }
}

const idiomas = { es, ca, en } as const;
const clavesBase = Object.keys(es).sort();

console.log('\ni18n — paridad entre idiomas:');

for (const [nombre, textos] of Object.entries(idiomas)) {
  const claves = Object.keys(textos).sort();
  const mismas = claves.length === clavesBase.length &&
    claves.every((k, i) => k === clavesBase[i]);
  comprobar(mismas, `"${nombre}" tiene las mismas ${clavesBase.length} claves`);
}

// Textos vacíos
for (const [nombre, textos] of Object.entries(idiomas)) {
  const vacias = Object.entries(textos)
    .filter(([, v]) => v.trim() === '')
    .map(([k]) => k);
  comprobar(vacias.length === 0, `"${nombre}" sin textos vacíos${vacias.length ? `: ${vacias.join(', ')}` : ''}`);
}

// Marcadores {param} idénticos por clave
function marcadores(valor: string): string[] {
  return [...valor.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}
const problemas: string[] = [];
for (const clave of clavesBase) {
  const esperados = marcadores((es as Record<string, string>)[clave]);
  for (const [nombre, textos] of Object.entries(idiomas)) {
    const propios = marcadores((textos as Record<string, string>)[clave] ?? '');
    if (propios.join(',') !== esperados.join(',')) {
      problemas.push(`${clave} en "${nombre}" ({${propios.join('},{')}} ≠ {${esperados.join('},{')}})`);
    }
  }
}
comprobar(
  problemas.length === 0,
  problemas.length === 0
    ? 'los marcadores {param} coinciden en todos los idiomas'
    : `marcadores distintos: ${problemas.join(' | ')}`,
);

// Cobertura: ninguna clave de uso conocido puede faltar
const clavesCriticas = [
  'app.title', 'menu.cpu', 'menu.local', 'game.turn', 'game.yourTurn',
  'game.thinking', 'game.wins', 'game.draw', 'game.again', 'score.draws',
  'lang.es', 'lang.ca', 'lang.en', 'lang.title', 'sound.label', 'menu.hint',
  'result.showBoard', 'result.show',
];
const faltan = clavesCriticas.filter((k) => !(k in es));
comprobar(faltan.length === 0, `claves críticas presentes${faltan.length ? ` (faltan: ${faltan.join(', ')})` : ''}`);

console.log(fallos === 0 ? '\n🎉 TODO OK' : `\n💥 ${fallos} fallo(s)`);
if (fallos > 0) process.exit(1);
