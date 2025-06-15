# Uso la imagen de Node.js para tener npm y Angular CLI
FROM node:18 as builder

# Establezco el directorio de trabajo
WORKDIR /app

# Copio los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalo las dependencias.
RUN npm install

# Copio todo el código fuente de Angular
COPY . .

# Ejecuta el comando de construcción de Angular CLI
# --output-path especifica dónde guardar los archivos estáticos construidos
# --configuration production usa las optimizaciones de producción
# --base-href / es a menudo necesario para single-page applications (SPAs)
RUN npm run build -- --output-path=./dist/fintech-front --configuration=production --base-href=/

# Usamos una imagen ligera de Nginx
FROM nginx:alpine

# Copio los archivos estáticos construidos desde la etapa de compilacion de angular
COPY --from=builder /app/dist/fintech-front /usr/share/nginx/html

# Expongo el puerto 80, que es el puerto HTTP por defecto de Nginx
EXPOSE 80

# Comando para ejecutar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]