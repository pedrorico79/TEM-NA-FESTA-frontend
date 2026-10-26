# Stage 1: Build
FROM node:20-alpine AS build
# Valores embutidos no JavaScript pelo Vite no build; o workflow de deploy passa
# cada um como --build-arg, vindo das variáveis do repositório (07, seção 4.4).
ARG VITE_CNPJ
ARG VITE_API_URL
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
