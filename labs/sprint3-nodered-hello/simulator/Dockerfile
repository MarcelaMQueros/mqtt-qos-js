FROM node:lts
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY device-simulator.js subscriber.js ./
