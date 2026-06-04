FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS production
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
