# Verificación de la recuperación — 2026-09-05

## Integridad y exclusiones

- 121 archivos del core copiados: hashes SHA-256 locales coincidentes con el checkout original.
- 121 contenidos Git comparados con la fuente original: todos idénticos.
- docs/source-manifest.json registra hashes de la copia local, incluidos sus finales de línea.
- Tres migraciones recuperadas del historial real; se normalizó únicamente el salto de línea final.
- Revisión de 145 archivos antes de añadir este informe: sin coincidencias de patrones de tokens GitHub, claves privadas, claves secretas Supabase/OpenAI, JWT ni URLs PostgreSQL con contraseña.
- Git excluye .env, node_modules, estado Wrangler, bases locales, claves y temporales.
- git diff --cached --check: aprobado tras normalizar finales de archivo de las migraciones.

## Dependencias y compilación

Entorno: Windows, Node 24.19.0, npm 11.6.2.
npm ci terminó correctamente: 681 paquetes, utilizando package-lock.json original.
Compilación con node node_modules/vinext/dist/cli.js build: aprobada.
Rutas generadas: / y /api/contributions.
Advertencias: tres imágenes relativas de Leaflet (layers.png, marker-icon.png y layers-2x.png) no se resolvieron durante la compilación. Requieren comprobación visual posterior.

## Tests originales

Comando: node --test tests/*.test.mjs desde frontend.
Resultado: 5 tests, 3 aprobados y 2 fallidos.

Aprobados: semántica de progreso, temas del gráfico y renderizado determinista del sidebar.

Fallidos:
1. renders development preview metadata: ERR_UNSUPPORTED_ESM_URL_SCHEME al importar cloudflare:workers con el cargador ESM de Node. Este test necesita un entorno compatible con el Worker.
2. emits the catalog's animation and scrolling utilities: no encuentra scrollbar-width: thin en el CSS compilado. Revisar si la utilidad sigue siendo requerida por el producto y adaptar la cobertura correspondiente.

La fuente y los tests se conservaron sin modificaciones; no se presenta la suite como aprobada.
No se ejecutaron pruebas de integración con Supabase, Railway, WhatsApp o ingesta.
No se migraron datos ni se cambió el sitio publicado.

## Revisión posterior a c2761e4

Se corrigieron únicamente dos problemas de integración:
- El test de HTML arranca el Worker con Wrangler local y bindings desechables; no consulta producción.
- Se declararon scrollbar-thin, scrollbar-none y scrollbar-gutter-stable, ya utilizados por el componente message-scroller pero ausentes del catálogo.

Nueva compilación: aprobada. Suite completa: 5 tests aprobados, 0 fallidos.
El simulador necesitó ejecutarse fuera del sandbox por una restricción de lectura de Windows.
Las advertencias de imágenes Leaflet permanecen; no se modificó el mapa.
El manifiesto de hashes sigue siendo el registro histórico de la recuperación inicial, no del código posterior a estas correcciones.
Los artefactos de compilación y dependencias permanecen sólo en el entorno local y están excluidos de Git.
