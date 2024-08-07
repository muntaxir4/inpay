#RUN THIS BEFORE
#turbo prune main-api bank-api payment-webhook --docker --out-dir ./buildApi && cp .env ./buildApi/full/.env

FROM node:20-alpine

RUN apk update
RUN apk add --no-cache libc6-compat

# Create app directory
WORKDIR /usr/src/app
COPY buildApi/json .
RUN npm install -g turbo
RUN npm install

COPY buildApi/full .

EXPOSE 3000
EXPOSE 3001
EXPOSE 3002

RUN npm run db:generate
RUN npm run build

CMD ["npm","run","start"]