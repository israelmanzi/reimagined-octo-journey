FROM node:lts AS builder
WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:lts-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

CMD [ "node", "build/index.js" ]
