# vap-ui

Browser-based internal tool for the [Variant Agentic Processing](https://github.com/variant-agentic-processing) platform. Provides four primary views: pipeline management, natural language agent queries, cohort data dashboard, and sample browser.

## Overview

- **Dashboard** — cohort-level stats (total variants, pathogenic counts, ClinVar release), top genes by pathogenic burden, clinical significance breakdown, per-individual drill-down to a full variant table
- **Query** — natural language interface over variant data; streams tool calls and answers from the agent-service as SSE events
- **Pipelines** — submit VCF ingest and ClinVar refresh jobs, monitor status, view step-by-step progress
- **Samples** — browse, search, and filter 2,504 1000 Genomes individuals; trigger VCF ingest per individual

All routes are VPN-gated — no auth layer. Cloud Run internal ingress (`INGRESS_TRAFFIC_INTERNAL_ONLY`) is the security boundary.

## Prerequisites

- `variant-mcp-server`, `agent-service`, `workflow-service`, and `sample-service` deployed and reachable
- VPN connected before accessing the deployed service
- `genomic-pipeline` Artifact Registry repository exists
- Node 20+ for local development
- Python 3.11+ and Poetry for deploy tasks

## Setup

```bash
cp .env.example .env
# Edit .env: set GCP_PROJECT and PULUMI_CONFIG_PASSPHRASE_FILE
# For local dev also set WORKFLOW_SERVICE_URL, AGENT_SERVICE_URL, MCP_SERVER_URL
```

Install dependencies:

```bash
npm install       # Next.js app
poetry install    # deploy tooling
```

## Running locally

Requires the upstream services to be running (local or deployed via VPN):

```bash
npm run dev
```

Open `http://localhost:3000`. The API routes proxy `/api/workflow/*`, `/api/agent/*`, and `/api/mcp/*` to the configured upstream URLs at request time.

## Build

Builds the Docker image via Cloud Build and pushes to Artifact Registry:

```bash
poetry run poe build
```

## Deploy

First time only — log in and initialise the stack:

```bash
poetry run poe login
poetry run poe stack-init
```

Then deploy (and on all subsequent updates):

```bash
poetry run poe deploy
```

Force a new revision when only the image changed (no config diff):

```bash
gcloud run services update vap-ui --image=us-central1-docker.pkg.dev/variant-processing/genomic-pipeline/vap-ui:latest --region=us-central1 --project=variant-processing
```

## Poe tasks

| Task | Description |
|------|-------------|
| `poetry run poe build` | Build and push Docker image via Cloud Build |
| `poetry run poe login` | Log into the Pulumi GCS backend |
| `poetry run poe stack-init` | Initialise the Pulumi stack (first time only) |
| `poetry run poe deploy` | Deploy or update the Cloud Run service via Pulumi |
| `poetry run poe logs` | Tail Cloud Run logs |

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local dev server on port 3000 |
| `npm run build` | Production Next.js build (used inside Docker) |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript type check (no emit) |

## Project structure

```
vap-ui/
├── Dockerfile
├── next.config.ts
├── pyproject.toml
├── package.json
├── public/
│   └── logo.jpeg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/[...path]/route.ts         # runtime proxy → AGENT_SERVICE_URL
│   │   │   ├── mcp/[...path]/route.ts           # runtime proxy → MCP_SERVER_URL
│   │   │   ├── samples/[[...path]]/route.ts     # runtime proxy → SAMPLE_SERVICE_URL
│   │   │   └── workflow/[...path]/route.ts      # runtime proxy → WORKFLOW_SERVICE_URL
│   │   ├── dashboard/page.tsx                   # cohort stats + ClinVar version + individuals table
│   │   ├── individuals/[id]/page.tsx            # per-individual variant table
│   │   ├── pipelines/page.tsx                   # pipeline list + submit forms
│   │   ├── query/page.tsx                       # agent query interface
│   │   ├── samples/page.tsx                     # sample browser + ingest trigger
│   │   └── layout.tsx                           # shared layout + nav
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── HealthBanner.tsx
│   │   ├── SubmitPipelineModal.tsx
│   │   ├── QueryInput.tsx / QueryResult.tsx / ToolCallStep.tsx
│   │   └── StatusBadge.tsx / Modal.tsx / ...
│   ├── hooks/
│   │   ├── useAgentQuery.ts                     # SSE streaming hook
│   │   ├── useClinvarVersion.ts                 # ClinVar release version fetch
│   │   ├── useDashboard.ts                      # cohort data fetching
│   │   ├── useIndividualVariants.ts             # per-individual variant fetch
│   │   ├── usePipelines.ts / usePipeline.ts     # pipeline list + detail
│   │   ├── useSamples.ts / useSample.ts         # sample list + detail
│   │   └── useHealth.ts                         # backend health checks
│   └── lib/
│       ├── agent-client.ts                      # typed client for agent-service
│       ├── cohort-client.ts                     # typed client for mcp-server REST endpoints
│       ├── sample-client.ts                     # typed client for sample-service
│       └── workflow-client.ts                   # typed client for workflow-service
├── deploy/
│   ├── __main__.py          # Pulumi Cloud Run deploy
│   ├── Pulumi.yaml
│   └── Pulumi.dev.yaml
└── scripts/
    ├── login.py             # poe login helper
    └── build_image.sh       # Cloud Build wrapper
```

## License

[CC BY-NC 4.0](LICENSE) — © 2025 Ryan Ratcliff. Free for non-commercial use with attribution. Commercial use requires prior written consent.
