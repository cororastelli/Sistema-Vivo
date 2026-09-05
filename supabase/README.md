# Supabase

Proyecto verificado por el conector: qzwzhpzdweatjsbcwvja.
Motor informado: PostgreSQL 17.6.1.166. Las migraciones incluyen PostGIS.
Los archivos de migrations se recuperaron literalmente de supabase_migrations.schema_migrations el 2026-09-05, conservando versiones y orden.

Son migraciones existentes, no cambios nuevos. No volver a aplicarlas a producción ni marcar una base distinta como sincronizada sin comparar su historial.
La segunda contiene datos iniciales de espacios y sectores públicos; no es un volcado de registros de usuarios.
No se exportaron tablas de usuarios, sesiones, mensajes ni archivos de storage.

La primera migración crea tablas de aportes, evidencia, moderación, ingesta y WhatsApp, habilita RLS y crea tres buckets privados.
La existencia del esquema no demuestra que los servicios estén conectados.
El frontend recuperado utiliza D1/R2, no este esquema.
