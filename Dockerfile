FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Instalar todas las dependencias (dev incluidas)
RUN npm install

# Copiar el resto del código
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Podés reducir tamaño removiendo devDeps
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
