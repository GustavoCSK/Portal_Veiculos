# Portal Veículos

Static React site for the Portal Veículos MVP. It runs without the API or MongoDB; the sample inventory is bundled with the frontend in `src/data/vehicles.js`.

## Run locally

```sh
npm ci --prefix frontend
npm run dev --prefix frontend
```

Update the vehicle details and image URLs in `src/data/vehicles.js` to customize the presentation. Vehicle detail pages use hash routes so they work on GitHub Pages without server rewrites.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys the site when changes are pushed to `old-ver-ui`. In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. The built site will be available at `https://gustavocsk.github.io/Portal_Veiculos/`.

Build locally:

```sh
npm run build --prefix frontend
```
