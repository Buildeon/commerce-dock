# Commerce Dock — PaaS & Zero-Trust Deployment Templates

Ready-to-use production deployment templates for self-hosted orchestration platforms and Zero-Trust networks.

---

## 1. Dokploy (Traefik / Swarm PaaS)

File: [`deployments/dokploy/docker-compose.yml`](./dokploy/docker-compose.yml)

### Setup Steps
1. In your Dokploy dashboard, create a new **Compose Application**.
2. Paste the contents of `deployments/dokploy/docker-compose.yml`.
3. Set the environment variable `DOMAIN` to your preferred hostname (e.g. `dock.yourdomain.com`).
4. Ensure your Dokploy Traefik network is named `dokploy-network` (or adjust the network name to match your Dokploy installation).
5. Click **Deploy**. Dokploy will pull the container and automatically provision Let's Encrypt TLS certificates.

---

## 2. Coolify (Self-Hosted PaaS)

File: [`deployments/coolify/docker-compose.yml`](./coolify/docker-compose.yml)

### Setup Steps
1. In Coolify, click **Create New Resource** &rarr; **Docker Compose**.
2. Paste the contents of `deployments/coolify/docker-compose.yml`.
3. Set your FQDN in the Coolify UI (e.g. `https://dock.yourdomain.com`).
4. Click **Deploy**. Coolify handles reverse proxy configuration, Traefik dynamic routing, and SSL generation.

---

## 3. Cloudflare Zero Trust Tunnel (Air-Gapped Ingress)

File: [`deployments/cloudflare-tunnel/docker-compose.yml`](./cloudflare-tunnel/docker-compose.yml)

### Security Advantage
Zero inbound ports exposed to the public internet. All traffic is routed over outbound WireGuard-based tunnels into Cloudflare's Anycast network, protected by Cloudflare Access authentication policies (Google Workspace, Microsoft Entra ID, Okta, or One-Time PIN).

### Setup Steps
1. In Cloudflare Zero Trust Dashboard, navigate to **Networks** &rarr; **Tunnels**.
2. Click **Add a tunnel** &rarr; select **Cloudflared**.
3. Name your tunnel (e.g. `commerce-dock-prod`).
4. Copy the tunnel token provided by Cloudflare.
5. Create a `.env` file alongside `docker-compose.yml`:
   ```bash
   CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoi...your-token...
   ```
6. In Cloudflare Dashboard under Public Hostnames:
   * **Subdomain:** `dock`
   * **Domain:** `yourdomain.com`
   * **Service Type:** `HTTP`
   * **URL:** `commerce-dock:80`
7. Start the stack:
   ```bash
   docker compose -f deployments/cloudflare-tunnel/docker-compose.yml up -d
   ```

---

## 4. Standalone Docker Compose (Host Localhost)

File: [`docker-compose.yml`](../docker-compose.yml)

For local execution or private VPS deployment behind an existing host reverse proxy (Nginx, Caddy, Traefik):

```bash
docker compose up -d
```

The container binds strictly to `127.0.0.1:8089` to prevent bypassing Linux `ufw` firewall rules.
