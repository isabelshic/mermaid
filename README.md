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
4. Deploy. The build runs `npm ci && npm run build` and serves the `dist/` folder.

Manual settings if you configure the app without the spec:

| Setting | Value |
| --- | --- |
| Component type | Static Site |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Catchall document | `index.html` |

## License

Apache-2.0 — see [LICENSE](./LICENSE).
