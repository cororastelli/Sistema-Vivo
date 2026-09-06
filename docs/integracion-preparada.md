# Integración preparada, todavía inactiva

## Estado

El código local incorpora una opción para Supabase. Producción continúa usando D1/R2.
No se cambiaron las variables de Sites ni se desplegó una nueva versión.
No se importaron datos de producción. WhatsApp espera la configuración del proveedor, según confirmó la usuaria.

## Diseño conservado

frontend/db/supabase.ts selecciona el proveedor mediante SV_DATA_BACKEND.
Sin esa variable (o con d1), conserva el comportamiento existente.
Con supabase, lee mediante sv_core_dashboard y guarda aportes mediante sv_core_submit.
Los errores no cambian automáticamente a D1, para evitar separar lecturas y escrituras.
La validación y clasificación de frontend/app/api/contributions/route.ts se mantienen.
El adaptador conserva coordenadas cero, valores nulos, fuentes y relaciones.

## Esquema y datos

supabase/schema/canonical-core.draft.sql es una propuesta, no una migración aplicada.
Reproduce las 12 tablas del core en sv_core, sin alterar las tablas public anteriores.
Habilita RLS, restringe el esquema y las dos funciones RPC al rol de servicio.
Las funciones usan SECURITY INVOKER. El dashboard no incluye aportes ni archivos privados.
El guardado de metadatos es transaccional; los objetos se mantienen privados en sv-contributions.
Un fallo durante el commit puede dejar un resultado incierto: no se borran imágenes potencialmente referenciadas. Se requiere reconciliación administrativa; no hay reintento automático.

Validación realizada contra PostgreSQL: creación del esquema, importación de un registro real de D1 y lectura como service_role dentro de una transacción revertida.
Se comprobó que anon no tuviera acceso al esquema ni al RPC.
Después del rollback, sv_core no existe; permanecen los 3 espacios y 0 aportes originales de public.

Antes de activar:
1. Crear la migración oficial desde este borrador y aplicarla en un entorno de validación.
2. Exportar todas las páginas de las 12 tablas D1, rechazando cualquier truncamiento. No versionar exportaciones.
3. Importar respetando IDs y relaciones; comparar conteos, hashes y campos. El esquema anterior de public permanece conservado y debe reconciliarse por identidad, no por coincidencia de nombres.
4. Revalidar D1 justo antes del cambio para detectar aportes nuevos. Si existen archivos, trasladar y verificar los objetos privados.
5. Probar lectura, escritura, restricciones y recuperación en el entorno de validación.
6. Configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY como variables del servidor en Sites. Nunca en NEXT_PUBLIC_* ni en Git.
7. Activar SV_DATA_BACKEND=supabase sólo cuando la importación esté completa, publicar y comprobar el sitio canónico. Una reversión después de recibir aportes en Supabase exige reconciliar esos aportes antes de volver a D1.

## Railway

Proyecto verificado: Sistema Vivo. Servicio: sistema-vivo-web. Entorno: production.
Sin despliegues, sin repositorio fuente configurado ni credenciales propias.
Se prepararon backend/Dockerfile y backend/railway.toml para ejecutar una API mínima de lectura.
GET /health comprueba que el proceso vive; no acredita conectividad con Supabase.
GET /v1/dashboard requiere Authorization: Bearer con SV_API_TOKEN y devuelve el mismo contrato del core.
Variables privadas necesarias: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y SV_API_TOKEN (al menos 32 caracteres aleatorios).
Este servicio no sustituye los procesos originales de ingesta ni el webhook de WhatsApp.
Conectar el repo usando su raíz, el Dockerfile indicado y healthcheck /health; configurar secretos en Railway y verificar /v1/dashboard antes de darlo por conectado.

## Verificación de esta preparación

- 9 tests nuevos de adaptador y API: aprobados.
- 4 tests existentes de componentes: aprobados.
- Compilación: aprobada, sin las advertencias de imágenes Leaflet.
- Test del Worker: bloqueado por permisos de lectura del sandbox de Windows. No se declara aprobado en esta sesión.
- Imágenes y CSS originales de Leaflet 1.9.4 incluidos con licencia; sólo se ajustaron sus rutas.

## Límite actual de ejecución

La CLI de Supabase no pudo iniciarse en la verificación anterior por restricciones del entorno. El permiso de red de la terminal se habilitó posteriormente; Git requiere el backend TLS OpenSSL en este entorno de Windows.
Quedan pendientes la migración oficial, importación completa, credenciales de servidor, validación integral y despliegue.
La clave pública disponible no sustituye una credencial de servidor.

El acceso de escritura del conector GitHub fue restablecido instalando ChatGPT Codex Connector en cororastelli, con acceso limitado a Sistema-Vivo. Se verificó la creación de un objeto en el repositorio. La publicación se realiza mediante el conector, conservando el contenido local y el historial publicado. Esto resuelve el bloqueo de publicación del código, pero no activa Supabase ni despliega Railway o Sites.
