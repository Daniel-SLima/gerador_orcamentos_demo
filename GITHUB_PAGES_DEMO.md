# Local demonstration on GitHub Pages

This export preserves OrçaDemo's application screens and local database adapter. It runs with fictional data in the browser: customers, products, salespeople, quotations, production orders, purchasing and PDF generation. It does not require credentials or a server API.

## Build

Use Node.js 22 and the existing npm lockfile:

```sh
npm ci
npm run test:local-demo
npm run build:pages-demo
```

The output is `out/`, ready to be copied to the Portfolio Pages artifact at `demos/orcamentos/`. The public base is `/Portfolio/demos/orcamentos/`. Override it with `DEMO_BASE_PATH=/another/path` (without a trailing slash).

The script sets `NEXT_PUBLIC_LOCAL_DEMO=true` and `NEXT_PUBLIC_DEMO_BASE_PATH` for an isolated build in `.pages-demo-build/`. It excludes server API routes and middleware from that copy, uses system fonts and exports the existing client screens. `npm run build` and the original Vercel layout/routes retain their default behavior when the demo environment variables are absent.

## Browser-only behavior

- “Explorar demonstração” creates a fictional local session without asking for a password.
- The data banner remains visible in the application; “Restaurar Demo” resets only OrçaDemo's local database and session.
- API-shaped calls for salespeople and administrative actions use the local adapter. No email is sent.
- Address selectors use a small sample catalog for BA, RJ and SP. Example postal codes are `01310-100`, `20010-120` and `40020-000`; no IBGE or ViaCEP requests are sent in this build.
- Images and attachments are read as local data URLs; they are not uploaded.
- The existing three PDF templates are generated in the browser and marked as demonstration documents without commercial value.
- Record detail and print screens use static `demo/` routes with an `id` query parameter, so newly created records work without a new deployment.
- The source application's base path is handled for Next links and browser-opened PDF pages.

The portfolio deployment should build this repository at a pinned commit and copy the resulting `out/` contents. Generated bundles are intentionally not checked into Git.
