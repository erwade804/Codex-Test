# School IT Link Hub (Node.js backend + dark UI)

A full Node.js project for managing school IT links with a backend API and a clean frontend.

## Architecture

- `src/server.js` → starts HTTP server
- `src/app.js` → request handler (API routing + static file serving)
- `src/routes/` → endpoint mapping layer
- `src/controllers/` → endpoint handlers
- `src/services/` → reusable business/scaffolding logic
- `src/data/` → in-memory data store
- `public/` → frontend dashboard files
- `tests/` → automated API/service tests

## API Endpoints

- `GET /api/health`
- `GET /api/v1/categories`
- `GET /api/v1/categories/:categoryId`
- `POST /api/v1/categories`
- `POST /api/v1/scaffold/endpoint` ✅ creates boilerplate controller + route files for new resources

### Scaffold endpoint usage

Create files for a new resource:

```bash
curl -X POST http://localhost:4173/api/v1/scaffold/endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "device-checkout"
  }'
```

Dry-run preview (recommended first):

```bash
curl -X POST http://localhost:4173/api/v1/scaffold/endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "device-checkout",
    "dryRun": true
  }'
```

The response includes:
- generated file paths
- naming formats (`kebabCase`, `camelCase`)
- copy/paste next steps for wiring routes

## Quick start

```bash
npm run dev
```

Then open `http://localhost:4173`.


## Endpoint Explorer UI

Open `http://localhost:4173/endpoints.html` to view and test every endpoint with example inputs and live responses.
