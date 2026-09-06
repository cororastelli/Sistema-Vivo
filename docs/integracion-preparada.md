# Integración: datos importados, conexión del sitio pendiente

## Estado verificado el 6 de septiembre de 2026

GitHub es la fuente de verdad del código. Se conserva el frontend canónico sistema-vivo-caba-core y su identidad de Sites. El sitio publicado todavía utiliza D1/R2; no se activó SV_DATA_BACKEND=supabase ni se publicó una nueva versión.

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

La exportación se procesó en memoria: no se versionaron datos, volcados ni credenciales. D1/R2 siguen intactos y activos. Antes del cambio del sitio, repetir la comparación para detectar cambios posteriores; no tratar esta importación como sincronización continua.

## Código y Railway

El adaptador compartido vive en frontend/db/supabase-store.mjs para que el frontend sea desplegable desde su propia raíz. backend/supabase-store.mjs lo reexporta y el Dockerfile incluye ambos módulos.

Railway: proyecto Sistema Vivo, servicio sistema-vivo-web, entorno production. Se configuraron en el servicio existente la raíz /, backend/Dockerfile, healthcheck /health, espera de 30 segundos y hasta 3 reintentos. Se vigilan backend/** y frontend/db/supabase-store.mjs.

Railway rechazó railway.toml porque Config as Code está deprecado para servicios nuevos. Se retiró ese archivo; la configuración efectiva queda en el servicio. Referencia oficial: https://docs.railway.com/infrastructure-as-code#migrating-from-config-as-code

Todavía faltan el enlace del servicio al repositorio, las variables privadas y el despliegue. No se creó otro servicio o proyecto. GET /health comprueba el proceso; GET /v1/dashboard requiere SV_API_TOKEN y permite comprobar la conexión con los datos.

Variables de servidor necesarias: SUPABASE_URL, SUPABASE_SECRET_KEY y SV_API_TOKEN (mínimo 32 caracteres aleatorios). Se acepta SUPABASE_SERVICE_ROLE_KEY sólo como compatibilidad heredada. La clave de Supabase debe ser de servidor; nunca usar NEXT_PUBLIC_* ni publicar la clave. Una clave pública no la sustituye.

## Pendiente de activación

1. Acceder al proyecto real desde una sesión de Supabase: la cuenta abierta en el navegador no muestra organizaciones ni acceso al proyecto. El conector SQL sí tiene acceso, pero no entrega claves de servidor.
2. Configurar las credenciales en los gestores privados de Sites y Railway, sin imprimirlas ni incorporarlas a Git.
3. Probar por HTTP lectura y guardado privado, errores y recuperación; revalidar cambios posteriores en D1 antes del cambio.
4. Conectar Railway a cororastelli/Sistema-Vivo, desplegar el servicio existente y verificar su API autorizada.
5. Activar Supabase y publicar el frontend canónico conservando su diseño. Si se reciben aportes en Supabase, reconciliarlos antes de cualquier retorno a D1.
6. Completar el proveedor de WhatsApp y recuperar o implementar los servicios de ingesta según fuentes y contratos reales. No se inventaron eventos ni datos.

## Avisos existentes de seguridad

El asesor de Supabase señala PostGIS en public, spatial_ref_sys y funciones de extensión/administración expuestas. No se cambiaron objetos de la extensión para ocultar esos avisos: necesitan revisión de permisos y dependencias antes de activar los clientes. Las tablas originales con RLS sin políticas permanecen cerradas a usuarios públicos.

## Verificación

La importación y comparación completas de datos pasaron. Los 9 tests del adaptador/API pasaron después de corregir las rutas compartidas. La compilación y la suite del frontend se verifican antes de publicar el código actualizado.
