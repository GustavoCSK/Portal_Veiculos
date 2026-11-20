# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Environment configuration

The frontend reads Vite variables from the repository-root `.env` file. Keep
`VITE_API_URL` as a same-origin path such as `/api/vehicles`: Vite proxies it
to the backend during development, and the backend serves that route in
production. Configure `API_BASE_URL`, `VITE_WHATSAPP_URL`,
`VITE_GOOGLE_MAPS_EMBED_URL`, `VITE_GOOGLE_FONTS_URL`, and the contact phone
variables there. `API_BASE_URL` supplies the origin used by Vite's `/api`
development proxy.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
