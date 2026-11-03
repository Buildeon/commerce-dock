FROM nginx:alpine

# Copy static assets
COPY . /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Clean unnecessary files from webroot
RUN rm -rf /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.github \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose*.yml \
    /usr/share/nginx/html/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
