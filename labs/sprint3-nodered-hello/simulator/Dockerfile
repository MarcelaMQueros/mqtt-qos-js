FROM node:lts
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY device-simulator.js subscriber.js ./
