# Ingesta diaria

Servicio ejecutable que sincroniza el catálogo oficial de espacios verdes públicos de Buenos Aires Data con `sv_core.spaces` en Supabase.

La ejecución:

1. descarga el GeoJSON oficial;
2. valida estructura, identificadores, geometrías y cantidad mínima de registros;
3. calcula una huella SHA-256 y conserva en el bucket privado `sv-source-documents` únicamente las versiones nuevas;
4. actualiza los campos oficiales de cada espacio en una transacción, sin modificar descripción, estado ni relaciones editoriales;
5. no elimina registros ausentes: los cuenta como faltantes para revisión;
6. registra resultado, altas, cambios, faltantes y errores en las tablas de ingesta existentes.

## Ejecución

Requiere Node.js 22 o posterior y las variables secretas `SUPABASE_URL` y `SUPABASE_SECRET_KEY` (o la clave de servicio heredada `SUPABASE_SERVICE_ROLE_KEY`). No se guardan credenciales en el repositorio.

```sh
node ingestion/index.mjs
```

Para verificar solamente la descarga y el formato, sin escribir en Supabase:

```sh
INGESTION_DRY_RUN=true node ingestion/index.mjs
```

## Railway

Se despliega como un segundo servicio dentro del proyecto Railway existente de Sistema Vivo, usando `ingestion/Dockerfile`. El comando termina después de una ejecución y está preparado para un cron diario `0 6 * * *` (06:00 UTC, 03:00 de Argentina).

La fuente publica una frecuencia semestral. La comprobación diaria permite detectar una actualización pronto; cuando el archivo no cambió, no se guarda otra copia ni se reescriben datos diferentes.
