FROM node:20-alpine AS build
WORKDIR /usr/src/app
 
# Pasang deps
COPY package*.json ./
RUN npm ci
 
# Copy source dan build
COPY . .
# (Opsional) set API base untuk produksi (pakai reverse proxy /api, jadi kosongkan)
ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

FROM nginx:alpine AS runtime

# Hapus default config dan pakai config kita
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
 



