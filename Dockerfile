FROM node:24 AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install

COPY . .
RUN yarn build


FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
RUN yarn install --production --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]