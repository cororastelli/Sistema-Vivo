# Backend

El backend original del sitio sigue en frontend/app/api, frontend/db y frontend/worker.
supabase-store.mjs adapta el mismo contrato a Supabase sin dependencias nuevas.
server.mjs expone una API mínima de lectura para Railway, protegida por un token de servidor.
Dockerfile y railway.toml preparan su ejecución desde la raíz del repositorio.

Esta API es una integración nueva del core recuperado; no es el servicio independiente perdido.
No implementa el webhook de WhatsApp ni los procesos de ingesta.
Consultar ../docs/integracion-preparada.md para configuración, límites y estado real.
