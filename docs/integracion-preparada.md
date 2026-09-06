# Integración activa

## Estado verificado el 6 de septiembre de 2026

GitHub es la fuente de verdad del código. Se conserva el frontend canónico `sistema-vivo-caba-core` y su identidad de Sites. La versión 17 está publicada con `SV_DATA_BACKEND=supabase`; la comprobación pública mostró la base conectada y 2177 espacios.

## Supabase

Proyecto existente: qzwzhpzdweatjsbcwvja, PostgreSQL + PostGIS.
La migración 20260906052600_canonical_core fue aplicada y su archivo coincide con la versión registrada por Supabase. Sustituye al borrador anterior.

Se leyeron todas las páginas de las 12 tablas D1 sin truncamiento. Primero se ensayó la importación completa en una transacción revertida; después se importaron los datos reales en sv_core y se compararon todos los registros y campos usando tipos PostgreSQL, dentro de una transacción atómica.

| Tabla | Registros verificados |
| --- | ---: |
| spaces | 2177 |
| sources | 12 |
| evidence | 20 |
| issues | 3 |
| stakeholders | 4 |
| projects | 1 |
| regulations | 0 |
| entity_links | 4 |
| evaluations | 3 |
| relations | 4 |
| contributions | 0 |
| contribution_assets | 0 |
| Total | 2228 |

Las 12 tablas tienen RLS. Las funciones sv_core_dashboard y sv_core_submit usan SECURITY INVOKER y sólo admiten el rol de servidor. Se comprobó la lectura de 2177 espacios como service_role y que anon/authenticated no pueden ejecutar las funciones. El dashboard no incluye aportes ni archivos privados.

El esquema public original conserva sus 3 espacios y no se modificó. Sus IDs colegiales, estacion y saavedra corresponden por nombre, barrio y comuna a los casos del core parque-ferroviario-colegiales, parque-de-la-estacion y parque-saavedra. No se fusionaron ni sobreescribieron registros o geometrías.

La exportación se procesó en memoria: no se versionaron datos, volcados ni credenciales. D1/R2 sigue intacto como origen histórico. La importación no constituye una sincronización continua.

## Código y Railway

El adaptador compartido vive en frontend/db/supabase-store.mjs para que el frontend sea desplegable desde su propia raíz. backend/supabase-store.mjs lo reexporta y el Dockerfile incluye ambos módulos.

Railway: proyecto Sistema Vivo, servicio sistema-vivo-web, entorno production. Se configuraron en el servicio existente la raíz /, backend/Dockerfile, healthcheck /health, espera de 30 segundos y hasta 3 reintentos. Se vigilan backend/** y frontend/db/supabase-store.mjs.

Railway rechazó railway.toml porque Config as Code está deprecado para servicios nuevos. Se retiró ese archivo; la configuración efectiva queda en el servicio. Referencia oficial: https://docs.railway.com/infrastructure-as-code#migrating-from-config-as-code

El servicio quedó enlazado a `cororastelli/Sistema-Vivo`, rama `main`, dentro del proyecto y servicio existentes. `SUPABASE_URL`, `SUPABASE_SECRET_KEY` y un `SV_API_TOKEN` aleatorio están guardados como variables privadas. El despliegue de `production` finalizó correctamente y el healthcheck `/health` pasó. No se creó otro servicio o proyecto. `GET /v1/dashboard` requiere `SV_API_TOKEN`.

Variables de servidor necesarias: SUPABASE_URL, SUPABASE_SECRET_KEY y SV_API_TOKEN (mínimo 32 caracteres aleatorios). Se acepta SUPABASE_SERVICE_ROLE_KEY sólo como compatibilidad heredada. La clave de Supabase debe ser de servidor; nunca usar NEXT_PUBLIC_* ni publicar la clave. Una clave pública no la sustituye.

## Pendiente funcional

1. Completar la cuenta y el número del proveedor de WhatsApp; todavía no existen credenciales ni webhook reales.
2. Recuperar o definir las fuentes y contratos reales de ingesta antes de desplegar automatizaciones. No se inventaron eventos ni datos.
3. Exponer la API de Railway sólo cuando exista un consumidor que necesite un dominio público; actualmente el proceso está activo y saludable sin dominio externo.

## Avisos existentes de seguridad

El asesor de Supabase señala PostGIS en public, spatial_ref_sys y funciones de extensión/administración expuestas. No se cambiaron objetos de la extensión para ocultar esos avisos: necesitan revisión de permisos y dependencias antes de activar los clientes. Las tablas originales con RLS sin políticas permanecen cerradas a usuarios públicos.

## Verificación

La importación y comparación completas de datos pasaron. Los 10 tests del adaptador/API y la compilación del frontend pasaron. La URL pública se verificó después del despliegue y mostró `Base conectada` con 2177 resultados.
