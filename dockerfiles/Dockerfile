#Dockerize APP

FROM node:20-alpine3.18 AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /usr/src/app
RUN npm install -g turbo
COPY . .
RUN turbo prune main-api bank-api payment-webhook websocket user-web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project and its dependencies
COPY --from=builder /usr/src/app/out/full/ .
COPY turbo.json turbo.json

COPY .env .env
RUN npm run db:generate
RUN npm run build

FROM base AS runner
WORKDIR /usr/src/app
# RUN apk add --no-cache

# Don't run production as root
# Doesn't work currently
# RUN addgroup --system --gid 1001 expressjs
# RUN adduser --system --uid 1001 expressjs
# USER expressjs
COPY --from=installer /usr/src/app .
COPY apps/user-web/.env apps/user-web/.env

EXPOSE 3000 3001 3002 8080 5173

CMD npm run db:migrate && npm run start