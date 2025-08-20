FROM node:20

WORKDIR /app

# Instalamos sólo las dependencias de producción y desarrollo
COPY package*.json ./
RUN npm ci

# Copiamos todo el código del frontend
COPY . .

# Arrancamos el servidor de desarrollo de Vite expuesto en 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
