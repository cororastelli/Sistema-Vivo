# Verificación

Los tests originales están en ../frontend/tests y conservan sus rutas relativas.
Desde frontend, instalar con npm ci, compilar con npm exec -- vinext build y ejecutar node --test tests/*.test.mjs.
El conjunto original verifica HTML renderizado y componentes de interfaz; no acredita integración con Supabase, Railway, WhatsApp ni ingesta.

Ver ../docs/verificacion.md para los resultados de esta recuperación.
