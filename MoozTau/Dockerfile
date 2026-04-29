FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_MOCK=false
ARG VITE_AUTH_API_URL=http://localhost:8002
ARG VITE_ORDERS_API_URL=http://localhost:8001
ARG VITE_FINANCE_API_URL=http://localhost:8003
ARG VITE_AUDIT_API_URL=http://localhost:8001
ARG VITE_CHAT_API_URL=http://localhost:8006
ENV VITE_MOCK=$VITE_MOCK \
    VITE_AUTH_API_URL=$VITE_AUTH_API_URL \
    VITE_ORDERS_API_URL=$VITE_ORDERS_API_URL \
    VITE_FINANCE_API_URL=$VITE_FINANCE_API_URL \
    VITE_AUDIT_API_URL=$VITE_AUDIT_API_URL \
    VITE_CHAT_API_URL=$VITE_CHAT_API_URL

COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
