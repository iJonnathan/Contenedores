# Uso una imagen base oficial de Node.js
FROM node:18

# Establezco el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copio los archivos package.json y package-lock.json.
COPY package*.json ./

# Instalo las dependencias del proyecto.
RUN npm install

# Copio el resto del código fuente de la aplicación al directorio de trabajo.
COPY . .

# Expongo el puerto 3000.
EXPOSE 3000

# Defino el comando por defecto que se ejecutará cuando se inicie el contenedor.
CMD ["npm", "start"]