# frontend/Dockerfile
FROM node:22.15-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend /app

RUN npm run build

# Serve with a simple static server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]