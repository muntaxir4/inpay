## Start Development Application (Docker)

This runs the Full Application in dev mode and starts Database, Redis and Full App

- Setup .env from .env.example. Fill required Environment variables.

- Set `NODE_ENV`= `development`, `DATABSE_URL` =`DATABASE_URL=postgresql://postgres:inpay123@inpay-db-dev:5432/postgres?schema=public` and `REDIS_URL` = `redis://inpay-redis-dev:6379`

- RUN `docker compose -f .docker-compose/dev-docker-compose.yaml up`

## Start Production Application (Docker)

This builds the Full Application and starts Database, Redis and Full App

- Setup .env from .env.example. Fill required Environment variables.

- Set `NODE_ENV`= `development`, `DATABSE_URL` =`DATABASE_URL=postgresql://postgres:inpay123@inpay-db:5432/postgres?schema=public` and `REDIS_URL` = `redis://inpay-redis:6379`

- RUN `docker compose -f .docker-compose/docker-compose.yaml up -d`

## URLS

- Main API: https://localhost:3000
- Webhook API: https://localhost:3001
- Bank API: https://localhost:3002
- Websocket API: https://localhost:8080
- Web: https://localhost:5173
