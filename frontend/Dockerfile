# Etapa 1: Construcción
FROM node:20 AS build

ENV TZ=America/New_York

RUN ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . /app/

# Construye la aplicación React
RUN npm run build --omit=dev

CMD ["npm", "start"]
