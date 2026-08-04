# Hindsight (api-slim only)

Trimmed workspace that keeps **`hindsight-api-slim`** and the scripts needed to run it locally (no Docker).

## Setup

```bash
./scripts/dev/setup.sh
# edit .env (LLM / embeddings / reranker)
./scripts/dev/start-api.sh
```

- API: http://localhost:8888  
- OpenAPI: http://localhost:8888/docs  
- Default DB: embedded **pg0** (no external Postgres)

## Smoke test

```bash
export API=http://localhost:8888 BANK=local-debug

curl -sf "$API/health"

curl -sS -X PUT "$API/v1/default/banks/$BANK" \
  -H 'Content-Type: application/json' -d '{}'

curl -sS -X POST "$API/v1/default/banks/$BANK/memories" \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"content":"Alice works at Google."}]}'

curl -sS -X POST "$API/v1/default/banks/$BANK/memories/recall" \
  -H 'Content-Type: application/json' \
  -d '{"query":"Where does Alice work?"}'
```

## Tests

```bash
cd hindsight-api-slim && uv run pytest tests/ -q
```

## Layout

```text
hindsight-api-slim/   # memory engine + HTTP API
scripts/dev/          # setup.sh, start-api.sh, start-worker.sh
.env.example          # env template
pyproject.toml        # uv workspace → api-slim only
```
