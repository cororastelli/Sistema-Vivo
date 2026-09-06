# Sistema Vivo

Repositorio consolidado del trabajo existente. Frontend canónico: https://sistema-vivo-caba-core.coolcamumu.chatgpt.site/

## Continuidad

Este chat de Codex es el principal para continuar Sistema Vivo. Se trabaja sobre esta carpeta y el repositorio existente, preservando lo construido. Las reglas permanentes están en [AGENTS.md](AGENTS.md). Railway queda para runtime/backend cuando corresponda; no se crea otra plataforma paralela.

## Fuentes de verdad

GitHub (cororastelli/Sistema-Vivo) es la fuente de verdad del código.
Supabase es la fuente de verdad de los datos. El frontend canónico lee y escribe el esquema protegido `sv_core`; D1/R2 se conserva como origen histórico y respaldo de la migración.

## Contenido

- `frontend/`: fuente completa del sitio canónico, incluido su servidor integrado, moderación, esquema D1 histórico, adaptador Supabase, migraciones y tests.
- `backend/`: adaptador Supabase y API mínima de lectura desplegada en el servicio existente de Railway.
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

El sitio canónico está publicado con Supabase/PostGIS y muestra 2177 espacios del core. La migración contiene 2228 registros reales verificados. Las credenciales viven únicamente en los gestores de secretos de Sites y Railway.
Railway ejecuta el servicio `sistema-vivo-web` en `production`, con healthcheck exitoso. No tiene dominio público: queda como runtime privado hasta que exista una necesidad concreta de exponer su API.
Consultar `docs/conexiones-pendientes.md` para WhatsApp e ingesta.

## Integración preparada

El core está importado en Supabase y el adaptador está activo en el frontend canónico. La API de Railway también está desplegada. Ver [estado y activación](docs/integracion-preparada.md).
