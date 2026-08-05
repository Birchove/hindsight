# Hindsight (API + Control Plane)

Trimmed workspace for local development **without Docker**:

- **Backend**: `hindsight-api-slim` (memory engine + HTTP API)
- **Frontend**: `hindsight-control-plane` (Next.js UI from upstream)
- **TS client**: `hindsight-clients/typescript` (Control Plane dependency)

## Setup

```bash
./scripts/dev/setup.sh
# edit .env (LLM / embeddings / reranker)
```

Requires **Node.js ≥ 20** and **uv** (Python). Root `.npmrc` defaults to the npmmirror registry (npmjs can hang on slow networks); override with `--registry=https://registry.npmjs.org` if needed.

## Run

```bash
# API + UI together
./scripts/dev/start.sh

# Or separately (two terminals)
./scripts/dev/start-api.sh
./scripts/dev/start-control-plane.sh
```

- API: http://localhost:8888  
- Control Plane: http://localhost:9999  
- OpenAPI: http://localhost:8888/docs  
- Default DB: embedded **pg0** (`~/.pg0`)

## Layout

```text
hindsight-api-slim/          # backend
hindsight-control-plane/     # frontend (GUI)
hindsight-clients/typescript # TS SDK used by the UI
scripts/dev/                 # setup + start scripts
.env.example
pyproject.toml               # uv workspace → api-slim
package.json                 # npm workspaces → client + control-plane
```

## Tests

```bash
cd hindsight-api-slim && uv run pytest tests/ -q
```
