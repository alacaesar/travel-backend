# Deploy Strapi (Docker) on a VPS

This backend repo builds a **production Docker image** in GitHub Actions and pushes it to **GHCR** (`ghcr.io/<owner>/<repo>` in lowercase). The VPS only pulls and runs the container.

## 1. One-time: GitHub Container Registry

- Push this repo to GitHub. The workflow [`.github/workflows/strapi-image.yml`](.github/workflows/strapi-image.yml) runs on every push to `main`.
- **Package visibility:** In GitHub, open **Packages** → your `travel-strapi` (or repo name) image → **Package settings** → set visibility or connect to the repo so Actions can push.

## 2. VPS (1–2 GB RAM recommended)

1. Install [Docker Engine](https://docs.docker.com/engine/install/) and the [Compose plugin](https://docs.docker.com/compose/install/linux/).
2. Create a directory, e.g. `/opt/travel-strapi/`.
3. Copy [`docker-compose.yml`](docker-compose.yml) there (or clone this repo and `cd` to that path on the server).
4. Copy [`.env.example`](.env.example) to `.env` and fill in secrets (generate new values for production):

   - `APP_KEYS` (comma-separated, four keys)
   - `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`
   - `PUBLIC_URL=https://api.yourdomain.com`
   - `STRAPI_ALLOWED_ORIGINS` — comma-separated list of **Next.js** origins, e.g. `https://your-app.vercel.app,https://www.yourdomain.com` (required when the frontend is not same-origin).

5. Add the image reference to the **same** `.env` file that sits next to `docker-compose.yml` (Compose uses it for variable substitution on keys like `image:`):

   ```env
   STRAPI_IMAGE=ghcr.io/your-github-user/your-repo-name:latest
   ```

   Use the image name shown under **Packages** after the first successful workflow run (repository name is lowercased in GHCR).

6. If the GHCR package is **private**, log in on the VPS once:

   ```bash
   echo YOUR_GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

7. Start:

   ```bash
   docker compose up -d
   ```

   Volumes `strapi_tmp` and `strapi_uploads` persist **SQLite** (`.tmp/data.db`) and **uploads** (`public/uploads`).

## 3. TLS and reverse proxy

Do **not** expose port 1337 publicly if the proxy runs on the same host.

- **Caddy** (example): reverse proxy `https://api.yourdomain.com` to `127.0.0.1:1337`. Caddy obtains certificates automatically.
- **nginx + certbot:** proxy `https://api.yourdomain.com` → `http://127.0.0.1:1337`.

After TLS works, ensure `PUBLIC_URL` matches `https://api.yourdomain.com`.

## 4. Firewall

- Allow **22** (SSH, restrict by IP if possible), **80**, **443**.
- **Omit** public access to 1337 when using localhost binding in `docker-compose.yml`.

## 5. Updates

On each `main` push, CI publishes `:latest` and `:sha-<git>`.

On the server:

```bash
docker compose pull
docker compose up -d
```

## Optional: auto-deploy from GitHub Actions

If you want pushes to `main` to redeploy automatically, the workflow
[`.github/workflows/strapi-image.yml`](.github/workflows/strapi-image.yml) includes a `deploy` job that SSHes into your VPS and runs `docker compose pull && docker compose up -d`.

Add these **repository secrets** in GitHub (backend repo → Settings → Secrets and variables → Actions):

- `DEPLOY_SSH_HOST`: Your server IP or hostname
- `DEPLOY_SSH_USER`: SSH username (e.g. `root` or a deploy user)
- `DEPLOY_SSH_KEY`: Private key with access to the server

On the VPS, ensure `/opt/travel-strapi` contains `docker-compose.yml` + `.env`, and the SSH user can run `docker compose` (either in the `docker` group or via `sudo` if you adapt the commands).

## 6. Next.js on Vercel

Point the frontend env `NEXT_PUBLIC_STRAPI_API_URL` to `https://api.yourdomain.com` (no `/api` suffix). See the frontend repo’s `DEPLOY-VERCEL.md`.

## 7. Backups

Back up the Docker volumes (or files under mounted paths) for `.tmp` (database) and `public/uploads` on a schedule.

## Monorepo note

If `frontend` and `backend` are **separate** Git repositories (as in this workspace), this workflow lives in the **backend** repo only. If you later merge into one monorepo, move or duplicate the workflow to the root `.github/workflows/` and set `context` / `file` paths accordingly.
