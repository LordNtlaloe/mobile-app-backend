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

RUN yarn install --production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]