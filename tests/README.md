# Verificación

Desde la raíz: node --test tests/*.test.mjs
Verifica el adaptador Supabase, errores de almacenamiento y acceso a la API de Railway.
Usa fixtures sintéticos aislados; nunca los importa a producción.

Desde frontend:
npm exec -- vinext build
node --test tests/*.test.mjs

Los tests del frontend recuperado verifican HTML y componentes.
El test de HTML requiere permisos para arrancar el simulador local del Worker.
Resultados actuales: ../docs/integracion-preparada.md.
