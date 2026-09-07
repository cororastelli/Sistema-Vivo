FROM node:24-slim
WORKDIR /app
COPY ingestion ./ingestion
USER node
ENV NODE_ENV=production
CMD ["node", "ingestion/index.mjs"]
