FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build


FROM nginx:alpine AS runtime
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build React ke root web 
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 80 
CMD ["nginx", "-g", "daemon off;"]
