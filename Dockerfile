FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Render (and Docker) set HOSTNAME to the container hostname; the Next.js
# standalone server uses HOSTNAME as its bind host, so unset it so the server
# binds to 0.0.0.0 — otherwise the load balancer can't reach the app and every
# request 502s.
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000
CMD ["sh", "-c", "unset HOSTNAME && node server.js"]
