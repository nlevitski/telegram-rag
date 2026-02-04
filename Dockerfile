# Используем стабильную версию Node.js
FROM node:22-slim AS base

# Устанавливаем pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# --- Этап зависимостей ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Устанавливаем зависимости (включая dev для билда)
RUN pnpm install --frozen-lockfile

# --- Этап сборки ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build
# Удаляем dev-зависимости для экономии места
RUN CI=true pnpm prune --prod

# --- Финальный образ ---
FROM base AS runner
# Устанавливаем переменную окружения, чтобы убрать ворнинги, как мы делали вручную
ENV NODE_OPTIONS='--no-warnings'
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Если Xenova скачивает модели в папку .cache, ее стоит прокинуть или сохранить
# RUN mkdir -p /.cache && chmod 777 /.cache

CMD [ "pnpm", "start:prod" ]
