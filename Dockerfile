
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --quiet

COPY src/ src/
COPY eslint.config.js ./
COPY index.html ./
COPY mime.types ./
COPY nginx.conf ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.app.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY .env ./

RUN npm run build

FROM nginx:alpine
# Remover la configuración predeterminada para evitar conflictos
RUN rm -rf /etc/nginx/conf.d/default.conf

# Crear directorio para la aplicación web
RUN mkdir -p /usr/share/nginx/html/geniahrv2-dev.synopsis.cloud

# Copiar los archivos compilados al directorio específico
COPY --from=builder /app/dist /usr/share/nginx/html/geniahrv2-dev.synopsis.cloud
# Copiar archivos de configuración
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types

# Verificar que la configuración sea válida
RUN nginx -t

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Comandos para construcción y ejecución:
# docker build -t ng-image .
# docker run -p 4200:80 -e 'API_URL=http://localhost:8080/api--name' --name ng-container ng-image