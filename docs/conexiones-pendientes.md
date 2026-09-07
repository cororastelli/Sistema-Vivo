# Conexiones pendientes

El estado vigente está en [Integración y activación](integracion-preparada.md).

- Supabase: esquema del core aplicado y 2228 registros reales importados y comparados; tablas originales preservadas.
- Frontend canónico: publicado con Supabase, base conectada y 2177 espacios visibles. D1/R2 permanece preservado.
- Railway: servicio existente enlazado a GitHub, desplegado en `production` y con healthcheck exitoso. Permanece sin dominio público.
- Ingesta: implementada para el GeoJSON oficial de espacios verdes. Valida, actualiza `sv_core`, conserva versiones nuevas en almacenamiento privado y registra cada ejecución. Se ejecuta diariamente en Railway a las 06:00 UTC.
- WhatsApp: proveedor en preparación por la usuaria; se integra en la etapa final.

GitHub es la fuente de verdad del código; Supabase es la base real acordada. No se creó una plataforma paralela ni se utilizó AppDeploy.
