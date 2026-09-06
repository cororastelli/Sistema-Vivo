# Sistema Vivo

Repositorio consolidado del trabajo existente. Frontend canónico: https://sistema-vivo-caba-core.coolcamumu.chatgpt.site/

## Continuidad

Este chat de Codex es el principal para continuar Sistema Vivo. Se trabaja sobre esta carpeta y el repositorio existente, preservando lo construido. Las reglas permanentes están en [AGENTS.md](AGENTS.md). Railway queda para runtime/backend cuando corresponda; no se crea otra plataforma paralela.

## Fuentes de verdad

GitHub (cororastelli/Sistema-Vivo) pasa a ser la fuente de verdad del código.
Supabase es la fuente de verdad de los datos acordada para la integración.
Actualmente el frontend canónico todavía lee y escribe D1/R2: el cambio a Supabase está pendiente y no debe darse por realizado. Los datos existentes de D1 deben preservarse y reconciliarse antes del cambio.

## Contenido

- `frontend/`: fuente completa recuperada de Sites, versión 13, incluido su servidor integrado, moderación, esquema D1, migraciones y tests.
- `backend/`: adaptador Supabase y API mínima de lectura preparada para Railway, todavía sin desplegar.
- `supabase/migrations/`: las tres migraciones originales y la migración del core aplicada en Supabase.
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
Se importaron y verificaron 2228 registros reales en Supabase; el sitio todavía utiliza D1/R2 y no se cambió su proveedor de datos.
Railway fue verificado: el proyecto Sistema Vivo contiene el servicio sistema-vivo-web, todavía sin despliegues ni credenciales de servidor configuradas.
Consultar docs/conexiones-pendientes.md antes de conectar producción.

## Integración preparada

El core ya está importado en Supabase. El adaptador del sitio y la API de Railway todavía esperan credenciales y despliegue. Ver [estado y activación](docs/integracion-preparada.md). El sitio publicado continúa usando D1/R2.
