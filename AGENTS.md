# Sistema Vivo — reglas de continuidad

Este repositorio es el proyecto existente. La conversación actual de Codex es la conversación principal para continuarlo.

- Trabajar en esta carpeta y su repositorio; conservar el trabajo existente.
- GitHub: https://github.com/cororastelli/Sistema-Vivo.git es la fuente de verdad del código.
- Frontend canónico: https://sistema-vivo-caba-core.coolcamumu.chatgpt.site/
- Identidad de Sites: conservar frontend/.openai/hosting.json y su project_id.
- Supabase es la base real, PostgreSQL + PostGIS. Proyecto: qzwzhpzdweatjsbcwvja.
- Railway se usa para runtime/backend cuando corresponda, dentro del proyecto existente Sistema Vivo.
- No crear otra plataforma, otro proyecto paralelo ni sustituir el frontend por AppDeploy.
- No reemplazar ni reescribir funcionalidades existentes salvo que el cambio solicitado lo requiera.
- No versionar secretos, tokens, archivos de entorno, bases locales, backups ni temporales.
- Antes de cambiar el proveedor de datos, validar la importación completa, relaciones y archivos. Preservar D1/R2 hasta completar y verificar la transición.
- No confundir código preparado, commit local, publicación en GitHub y despliegue en producción. Informar su estado real por separado.
- Consultar docs/integracion-preparada.md para la preparación actual y los bloqueos; verificar el estado real con las herramientas antes de actuar.
