#!/bin/bash
#
# Bootstrap a local hindsight-api-slim-only workspace (no Docker).
#
# Usage:
#   ./scripts/dev/setup.sh
#   ./scripts/dev/setup.sh --skip-models
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

SKIP_MODELS=false
for arg in "$@"; do
    case "$arg" in
        --skip-models) SKIP_MODELS=true ;;
        -h|--help)
            sed -n '3,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
            exit 0
            ;;
        *) echo "Unknown option: $arg (try --help)"; exit 2 ;;
    esac
done

step()  { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }
ok()    { printf '  \033[32m✓\033[0m %s\n' "$1"; }
info()  { printf '  \033[2m• %s\033[0m\n' "$1"; }
warn()  { printf '  \033[33m⚠ %s\033[0m\n' "$1"; }
have()  { command -v "$1" >/dev/null 2>&1; }

export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

step "uv (Python toolchain)"
if ! have uv; then
    info "installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    [ -f "$HOME/.local/bin/env" ] && . "$HOME/.local/bin/env"
    export PATH="$HOME/.local/bin:$PATH"
fi
have uv || { warn "uv not on PATH — open a new shell and re-run"; exit 1; }
ok "$(uv --version)"

step ".env file"
if [ -f "$ROOT_DIR/.env" ]; then
    ok ".env already exists"
else
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    ok "created .env from .env.example"
    warn "set HINDSIGHT_API_LLM_API_KEY (and provider/model) in .env before running the API"
fi

step "Python dependencies (uv sync — hindsight-api-slim + extras)"
uv sync
ok ".venv ready"

if [ "$SKIP_MODELS" = false ]; then
    step "Pre-download local ML models (skip if embeddings/reranker are remote)"
    set -a; [ -f "$ROOT_DIR/.env" ] && . "$ROOT_DIR/.env"; set +a
    emb_provider="${HINDSIGHT_API_EMBEDDINGS_PROVIDER:-local}"
    rer_provider="${HINDSIGHT_API_RERANKER_PROVIDER:-local}"
    if [ "$emb_provider" != "local" ] && [ "$rer_provider" != "local" ]; then
        info "embeddings=$emb_provider reranker=$rer_provider — skipping local model cache"
    else
        emb_model=""
        rer_model=""
        [ "$emb_provider" = "local" ] && emb_model="${HINDSIGHT_API_EMBEDDINGS_LOCAL_MODEL:-BAAI/bge-small-en-v1.5}"
        [ "$rer_provider" = "local" ] && rer_model="${HINDSIGHT_API_RERANKER_LOCAL_MODEL:-cross-encoder/ms-marco-MiniLM-L-6-v2}"
        PREWARM_EMB="$emb_model" PREWARM_RER="$rer_model" \
        uv run --directory "$ROOT_DIR/hindsight-api-slim" python - <<'PY' || warn "model prewarm failed — will download on first use"
import os
import tiktoken
print("  caching tiktoken cl100k_base...", flush=True)
tiktoken.get_encoding("cl100k_base")
emb = os.environ.get("PREWARM_EMB") or ""
rer = os.environ.get("PREWARM_RER") or ""
if emb:
    from sentence_transformers import SentenceTransformer
    print(f"  caching embedding model {emb} ...", flush=True)
    SentenceTransformer(emb)
if rer:
    from sentence_transformers import CrossEncoder
    print(f"  caching cross-encoder model {rer} ...", flush=True)
    CrossEncoder(rer)
print("  models cached", flush=True)
PY
        ok "model cache step finished"
    fi
fi

cat <<EOF

Setup complete (api-slim only).

Next:
  • Edit .env if needed
  • Start API:  ./scripts/dev/start-api.sh
  • Health:     curl -sf http://localhost:8888/health
  • Tests:      cd hindsight-api-slim && uv run pytest tests/ -q

EOF
