FROM node:24-slim
WORKDIR /app
COPY backend/supabase-store.mjs backend/server.mjs ./backend/
COPY frontend/db/supabase-store.mjs ./frontend/db/
USER node
ENV NODE_ENV=production
CMD ["node", "backend/server.mjs"]
