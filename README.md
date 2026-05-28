# Mermaid Chart Creator

Visual editor for architectural diagrams. Drag blocks onto a canvas, connect them, group assets, and export to Mermaid (`.mmd`) or JSON.

## Local development

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

Production output is written to `dist/`.

## Deploy on DigitalOcean App Platform

This repo includes a [DigitalOcean App Spec](https://docs.digitalocean.com/products/app-platform/reference/app-spec/) at `.do/app.yaml`.

1. Push this repository to GitHub.
2. In the [DigitalOcean control panel](https://cloud.digitalocean.com/apps), create a new app and connect `isabelshic/mermaid`.
3. App Platform should detect the static site configuration automatically from `.do/app.yaml`.
4. Deploy. App Platform installs dependencies, runs `npm run build`, and serves the `dist/` folder.

Manual settings if you configure the app without the spec:

| Setting | Value |
| --- | --- |
| Component type | Static Site |
| Build command | `npm run build` |
| Output directory | `dist` |
| Catchall document | `index.html` |
| Build-time env | `NPM_CONFIG_PRODUCTION=false` (keeps TypeScript/Vite available during build) |

### Troubleshooting deploy failures

**`Warning: no analyzed metadata found at path '/layers/analyzed.toml'`** — harmless on first deploy. It only means there is no previous build cache to reuse.

**`Deploy Error: Container Terminated`** — common causes:

1. **Wrong component type** — this app must be a **Static Site**, not a Web Service. A Web Service looks for a `start` script and a server listening on port 8080; this repo has neither. In the DigitalOcean app settings, confirm the component type is Static Site. If the app was created as a Web Service, delete it and recreate from `.do/app.yaml`, or add a new Static Site component.
2. **Build tools pruned** — App Platform strips `devDependencies` when `NODE_ENV=production`. That removes `typescript` and `vite`, so the build fails. The app spec sets `NPM_CONFIG_PRODUCTION=false` at build time to prevent that.
3. **Stale build cache** — use **Actions → Force rebuild and deploy**, check **Clear build cache**, then redeploy.

## License

Apache-2.0 — see [LICENSE](./LICENSE).
