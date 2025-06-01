#Dockerize Websocket

FROM node:20-alpine3.18 AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /usr/src/app
RUN npm install -g turbo
COPY . .
RUN turbo prune websocket --docker

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
ARG DATABASE_URL

RUN npm run db:generate
RUN npm run build

FROM base AS runner
WORKDIR /usr/src/app

# Don't run production as root
# Doesn't work currently
# RUN addgroup --system --gid 1001 expressjs
# RUN adduser --system --uid 1001 expressjs
# USER expressjs
RUN apk add --no-cache ca-certificates
COPY --from=installer /usr/src/app .

#COPY Microsoft certificated for Postgres connection
COPY ./microsoft-rsa-root-ca-2017.crt /usr/local/share/ca-certificates/microsoft-rsa-root-ca-2017.crt

# Update CA certificates so the cert is trusted
RUN update-ca-certificates

EXPOSE 8080

CMD ["npm", "run", "start"]

# CMD ["sleep", "infinity"]