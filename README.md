# Sistema Vivo

Repositorio consolidado del trabajo existente. Frontend canónico: https://sistema-vivo-caba-core.coolcamumu.chatgpt.site/

## Contenido

- `frontend/`: fuente completa recuperada de Sites, versión 13, incluido su servidor integrado, moderación, esquema D1, migraciones y tests.
- `backend/`: inventario de la API existente y pasos para recuperar/conectar el servicio independiente.
- `supabase/migrations/`: las tres migraciones originales recuperadas del historial real de Supabase.
- `whatsapp/` e `ingestion/`: estado de recuperación e integración pendiente.
- `tests/`: instrucciones de verificación; los tests originales permanecen en frontend/tests.
- `docs/`: procedencia, arquitectura, conexiones pendientes y materiales locales anteriores.

No se reconstruyó la aplicación. AppDeploy no se utilizó como fuente.
La fuente canónica conserva su organización interna para mantener imports, rutas y despliegue.
El servidor integrado permanece en frontend/app/api, frontend/worker y frontend/db.

## Desarrollo

Node.js >=22.13.0 y npm. Desde frontend:

```sh
npm ci
npm exec -- vinext build
node --test tests/*.test.mjs
```

Los scripts originales npm run build e install:ci requieren Linux y sus utilidades.
En Windows se puede ejecutar directamente npm exec -- vinext build.
El entorno local utiliza D1/R2 simulados; no conecta automáticamente con Supabase.

## Estado real

El sitio usa Cloudflare D1/R2. Supabase/PostGIS existe por separado.
La consolidación del repositorio no migra datos ni cambia el sitio publicado.
Railway fue informado como creado pero sin desplegar en la conversación anterior; no se verificó su panel.
Consultar docs/conexiones-pendientes.md antes de conectar producción.
