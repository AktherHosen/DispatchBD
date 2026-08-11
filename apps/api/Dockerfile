FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY apps/api/.env ./apps/api/.env

RUN pnpm --filter api build

EXPOSE 5000

CMD ["node", "apps/api/dist/index.js"]
