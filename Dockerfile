FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html thankyou.html config.js order-handler.js /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
