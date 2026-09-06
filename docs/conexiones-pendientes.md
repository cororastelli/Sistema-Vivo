# Conexiones pendientes

## Arquitectura observada

Sitio canónico → Worker Vinext → D1 (DB) y R2 (BUCKET).
Supabase/PostGIS → esquema separado recuperado, aún sin conexión desde el código canónico.
GitHub → repositorio consolidado; no implica despliegue automático en Sites o Railway.

## Supabase

1. Comparar frontend/db/schema.ts y frontend/drizzle con supabase/migrations: son motores y modelos diferentes; no ejecutar SQL SQLite/D1 en PostgreSQL.
2. Definir correspondencias para IDs, evidencia normalizada, conflictos, historial y entidades de gobernanza de la versión 13; evitar perder campos.
3. Recuperar la API independiente antes de cambiar el frontend. Revisar contratos, autenticación, moderación y manejo de imágenes.
4. Preparar migración de datos y pruebas en un entorno separado, con respaldo privado y validación de conteos/relaciones.
5. Revisar RLS, permisos y políticas de storage según el acceso decidido. Las migraciones recuperadas habilitan RLS; no se debe deshabilitar para resolver la conexión.
6. Configurar credenciales mediante el gestor del servicio; nunca incluirlas en Git ni en código del navegador.
7. Validar lectura, aportes, revisión humana, publicación, historial y archivos antes del cambio.

## Railway

Estado informado por la conversación: creado, aún no desplegado. No se inspeccionó Railway en esta tarea.
Pendiente recuperar el servicio original, identificar proyecto/servicio, conectar este repositorio, definir directorio de trabajo, instalación, arranque, puerto y health check.
Configurar la conexión PostgreSQL y credenciales del storage como variables privadas.
Validar orígenes permitidos, autenticación, logs sin secretos y rollback antes de activar el servicio.

## WhatsApp e ingesta

Existen tablas pero no se recuperaron los servicios ejecutables. Sus carpetas documentan el estado.
Conectar webhooks y tareas programadas sólo después de recuperar y probar la implementación original.

## Sitio canónico

Se conserva la URL y frontend/.openai/hosting.json del proyecto original.
No se publicó una nueva versión durante esta consolidación.
Una futura publicación de Sites debe usar frontend como raíz y conservar la identidad del proyecto.

## Actualización de preparación

Se verificó Railway y se preparó el adaptador: consultar [integración preparada](integracion-preparada.md). Esa página actualiza el estado técnico; todavía no se activó la conexión.
