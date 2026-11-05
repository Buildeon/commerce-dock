FROM nginx:alpine

# Security: Install libcap, grant nginx permission to bind port 80 without root, then purge build tool
RUN apk add --no-cache libcap \
    && setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx \
    && apk del libcap

# Copy static assets and custom hardened nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/

# Clean non-runtime files from webroot
RUN rm -rf /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.github \
    /usr/share/nginx/html/test \
    /usr/share/nginx/html/scripts \
    /usr/share/nginx/html/deployments \
    /usr/share/nginx/html/node_modules \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose*.yml \
    /usr/share/nginx/html/nginx.conf \
    /usr/share/nginx/html/package*.json \
    /usr/share/nginx/html/tsconfig.json \
    /usr/share/nginx/html/eslint.config.mjs

# Configure ownership and PID for non-root execution (UID 101 nginx)
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

# Run as non-root user
USER nginx

EXPOSE 80

# Native container HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
