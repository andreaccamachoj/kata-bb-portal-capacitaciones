# Etapa 1: Build
FROM node:18-slim AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias necesarias para Bun
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# Instalar Bun directamente
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Copiar archivos de dependencias primero para mejor cache de Docker
COPY package.json bun.lockb ./

# ⚡ Eliminar posibles caches anteriores y reinstalar limpio
RUN rm -rf node_modules && bun install --no-cache

# Copiar el resto del código fuente
COPY . .

# Configurar variables de entorno para el build
ARG VITE_BASE_URL
ARG VITE_COURSE_BASE_URL  
ARG VITE_S3_BUCKET_URL

ENV VITE_BASE_URL=$VITE_BASE_URL \
    VITE_COURSE_BASE_URL=$VITE_COURSE_BASE_URL \
    VITE_S3_BUCKET_URL=$VITE_S3_BUCKET_URL

# ⚡ Asegurar binario de esbuild actualizado
RUN bun add -d esbuild@latest

# Construir la aplicación para producción
RUN bun run build

# Etapa 2: Servidor de producción
FROM nginx:alpine AS production

# Copiar configuración personalizada de nginx
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Configuración para SPA (Single Page Application)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Configuración de caché para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compresión gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Copiar los archivos construidos desde la etapa de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]