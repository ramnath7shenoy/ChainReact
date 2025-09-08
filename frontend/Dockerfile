# Stage 1: The "Builder" Stage
FROM node:18-alpine AS builder
WORKDIR /app

# NEW: Accept a build-time argument for the WebSocket URL
ARG NEXT_PUBLIC_WEBSOCKET_URL
# And set it as an environment variable for the build process
ENV NEXT_PUBLIC_WEBSOCKET_URL=$NEXT_PUBLIC_WEBSOCKET_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---

# Stage 2: The "Runner" Stage
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]