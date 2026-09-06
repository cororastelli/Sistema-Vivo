# Backend

El backend original del sitio sigue en frontend/app/api, frontend/db y frontend/worker.
supabase-store.mjs reexporta el adaptador compartido del frontend; server.mjs expone la API de lectura para el servicio existente de Railway.
El Dockerfile incluye el adaptador y mantiene una única implementación.

Railway tiene configurados Dockerfile y healthcheck mediante su servicio; railway.toml fue retirado porque el proveedor ya no permite esa configuración para servicios nuevos.
No se desplegó todavía. Esta API no implementa WhatsApp ni ingesta.
Ver ../docs/integracion-preparada.md para el estado y las conexiones pendientes.
