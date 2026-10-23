# Xporium Minimal Monochrome Frontend Design Specification

- **Date**: 2026-10-04
- **Status**: Approved
- **Scope**: Frontend full-stack integration for Xporium (FastAPI backend)
- **Constraint**: Pure black and white / monochrome UI; no backend modifications.

---

## 1. System Overview & Technology Stack

The frontend is a fast, responsive, and minimalist machine learning experiment tracker interface communicating with the existing FastAPI backend.

- **Framework**: React 19 + TypeScript + Vite
- **UI & Styling**: Tailwind CSS v4 + Shadcn UI (using Base UI / Radix primitives and pure grayscale palette) + Lucide Icons
- **Routing**: `react-router-dom`
- **Server State**: `@tanstack/react-query` for query caching, request deduplication, and optimistic/invalidation updates
- **Theme**: Strict Black & White / Grayscale aesthetic (dark & light neutral contrasts, zero saturated accent colors)

---

## 2. Architecture & Directory Structure

```text
frontend/src/
├── api/
│   ├── client.ts             # Axios / Fetch client with JWT interceptor and error normalizer
│   ├── auth.ts               # Login (OAuth2 form-data), register, me, delete user
│   ├── experiments.ts        # Experiments CRUD & Data Configurations CRUD
│   ├── runs.ts               # Runs CRUD (parameters & metrics)
│   ├── artifacts.ts          # Multipart artifact upload, get, delete
│   └── admin.ts              # Admin overview, users, experiments, runs
│
├── components/
│   ├── ui/                   # Pre-installed shadcn components (Button, Dialog, Table, etc.)
│   ├── layout/
│   │   ├── app-layout.tsx    # Sidebar, top bar with search and user controls
│   │   ├── admin-layout.tsx  # Admin sidebar & header
│   │   └── protected-route.tsx # Auth & Admin route guards
│   └── shared/
│       ├── confirm-dialog.tsx# Reusable destructive confirmation modal
│       ├── empty-state.tsx   # Monochrome empty state placeholder
│       └── loading-state.tsx # Skeleton loading wrappers
│
├── features/
│   ├── auth/                 # LoginForm, RegisterForm
│   ├── experiments/          # ExperimentCard, ExperimentFeed, CreateExperimentDialog, EditExperimentDialog
│   ├── data-configs/         # DataConfigCard, CreateDataConfigDialog, PreprocessingStepsBuilder
│   ├── runs/                 # RunCard, CreateRunDialog, EditRunDialog, RunParametersTable, RunMetricsTable
│   ├── artifacts/            # ArtifactViewer, AttachArtifactDialog
│   └── admin/                # AdminStatsCards, AdminUsersTable, AdminExperimentsTable, AdminRunsTable
│
├── pages/
│   ├── login-page.tsx
│   ├── register-page.tsx
│   ├── experiments-page.tsx
│   ├── experiment-detail-page.tsx
│   ├── run-detail-page.tsx
│   ├── admin/
│   │   ├── admin-overview-page.tsx
│   │   ├── admin-users-page.tsx
│   │   ├── admin-experiments-page.tsx
│   │   └── admin-runs-page.tsx
│   └── not-found-page.tsx
│
├── types/
│   └── index.ts              # Typed interfaces for Experiment, Run, Metric, Artifact, User, etc.
│
├── App.tsx                   # Route provider & React Query client setup
└── main.tsx
```

---

## 3. API Contract & Integration Mapping

The frontend interacts with the FastAPI backend without altering any backend file:

| Domain | Method | Endpoint | Payload / Format | Response |
|---|---|---|---|---|
| **Auth** | `POST` | `/login` | `OAuth2PasswordRequestForm` (x-www-form-urlencoded `username`, `password`) | `{ access_token, token_type }` |
| **Auth** | `POST` | `/create_user` | `OAuth2PasswordRequestForm` (form data `username`, `password`) | `{ Message }` |
| **Auth** | `GET` | `/users/me` | Bearer Token in `Authorization` header | `{ Username, Role }` |
| **Auth** | `DELETE` | `/delete_user` | Bearer Token | `{ Message }` |
| **Experiments** | `GET` | `/experiments/` | Bearer Token | `ExperimentResponse[]` |
| **Experiments** | `POST` | `/experiments/` | JSON: `name`, `description`, `dataset_name`, `dataset_public_url`, `project_url`, `experiment_type` | `ExperimentResponse` |
| **Experiments** | `PATCH` | `/experiments/{id}` | JSON: Partial updates only (`exclude_unset`) | `ExperimentResponse` |
| **Experiments** | `DELETE` | `/experiments/{id}` | Bearer Token | `204 No Content` |
| **Data Configs** | `GET` | `/experiments/{id}/data-configurations` | Bearer Token | `DataConfigurationResponse[]` |
| **Data Configs** | `POST` | `/experiments/{id}/data-configurations` | JSON: `name`, `train_ratio`, `validation_ratio`, `test_ratio`, `preprocessing_steps[]`, etc. | `DataConfigurationResponse` |
| **Runs** | `GET` | `/{experiment_id}/runs` | Bearer Token | `RunResponse[]` |
| **Runs** | `POST` | `/{experiment_id}/runs` | JSON: `data_config_id`, `model_name`, `training_duration`, `environment_type`, `parameters[]`, `metrics[]` | `RunResponse` |
| **Runs** | `PATCH` | `/runs/{run_id}` | JSON: Partial updates only | `RunResponse` |
| **Runs** | `DELETE` | `/runs/{run_id}` | Bearer Token | `204 No Content` |
| **Artifacts** | `GET` | `/run/{run_id}/artifact` | Bearer Token | `ArtifactResponse` (image base64 string + note) |
| **Artifacts** | `POST` | `/run/{run_id}/artifact` | `multipart/form-data`: `image` file and/or `note` text | `ArtifactResponse` |
| **Artifacts** | `DELETE` | `/run/{run_id}/artifact` | Bearer Token | `204 No Content` |
| **Admin** | `GET` | `/admin/overview` | Admin Bearer Token | `AdminOverviewResponse` |
| **Admin** | `GET` | `/admin/users` | Admin Bearer Token | `AdminUserResponse[]` |
| **Admin** | `DELETE` | `/admin/users/{user_id}` | Admin Bearer Token | `{ message }` |
| **Admin** | `GET` | `/admin/experiments` | Admin Bearer Token | `ExperimentResponse[]` |
| **Admin** | `DELETE` | `/admin/experiments/{id}`| Admin Bearer Token | `{ message }` |
| **Admin** | `GET` | `/admin/runs` | Admin Bearer Token | `RunResponse[]` |
| **Admin** | `DELETE` | `/admin/runs/{run_id}` | Admin Bearer Token | `{ message }` |

---

## 4. UI / UX Details & Features

### 4.1 Theme & Styling
- Strict monochrome:
  - Backgrounds: `#09090b` (Dark) / `#ffffff` (Light) or neutral zinc/slate.
  - Borders: `border-zinc-800` / `border-zinc-200`.
  - Badges: `bg-zinc-100 text-zinc-900` or `border border-zinc-700 text-zinc-200`.
  - Buttons: Primary (`bg-white text-black` in dark mode, or `bg-black text-white` in light mode), Outline (`border border-zinc-700`).

### 4.2 Progressive Experiment Workflow
1. **Experiment Library**: List experiments with client-side name search. "+ New Experiment" opens dialog.
2. **Experiment Overview Tab**: Clean technical specifications, dataset links, notebook buttons.
3. **Data Configurations Tab**:
   - Ratios verified in real-time ($Train + Val + Test = 1.0$).
   - Dynamic preprocessing step list builder.
4. **Runs Tab**:
   - Record run dialog allows dynamic parameter (Name, Value, Type) and metric (Name, Value, Split) row additions.
5. **Run Details & Artifacts**:
   - Dedicated table for hyperparameters.
   - Dedicated table for metrics with train/val/test tags.
   - Artifact preview section (renders base64 image or markdown note; upload form if absent).

### 4.3 Admin Console
- Guarded by `currentUser.role === 'admin'`.
- Stats overview with real-time totals.
- Administrative controls for user and resource management with double confirmation.

---

## 5. Error Handling & Validation
- Validation errors from FastAPI (HTTP 422 `detail: [{loc, msg}]`) are parsed and rendered as concise field-level or toast messages.
- Conflict errors (HTTP 409: "Artifact already exists") and auth errors (HTTP 400: "Username already exists") display human-friendly alert banners.
- Network and server errors fall back to non-blocking dismissible alerts.
- Empty states for zero experiments, zero runs, and zero configurations clearly direct the user to the next step.
