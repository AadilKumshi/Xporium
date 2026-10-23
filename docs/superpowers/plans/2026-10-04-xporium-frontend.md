# Xporium Minimal Monochrome Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete, minimal, monochrome (black & white) frontend for Xporium matching `Xporium_Frontend_Specification.md` without modifying any backend files.

**Architecture:** A modular React 19 + TypeScript + Vite single-page application utilizing shadcn UI primitives, TanStack Query for server cache invalidation, and React Router for view navigation. The frontend communicates with the FastAPI backend through a Vite proxy and a typed API client that safely generates partial PATCH payloads.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn UI (@base-ui/react, cmdk, lucide-react), TanStack Query, React Router DOM, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-04-xporium-frontend-design.md` and `Xporium_Frontend_Specification.md`

## Global Constraints

- Backend files in `backend/` must NEVER be modified or touched in any way.
- Palette is strictly black and white / monochrome: grayscale tokens (`zinc`, `neutral`, `bg-background`, `text-foreground`, `border-border`).
- Use existing pre-installed shadcn components in `frontend/src/components/ui/` as they are.
- PATCH updates must send only modified fields (never send untouched fields as `null`).
- Data Configuration ratios (train + val + test) must strictly sum to 1.0 (100%).
- All destructive actions (delete experiment, run, user, artifact) must require explicit modal confirmation.

## Review Focus

- **FastAPI 422 validation response format**: error detail array `{loc: string[], msg: string}[]` must be formatted into clean human-readable error messages.
- **OAuth2 form data format**: `/login` and `/create_user` require URL-encoded or FormData (`username` & `password`), not raw JSON.
- **Base64 artifact images**: `/run/{id}/artifact` returns base64 string in `image_data`, which must be rendered safely with proper MIME type or fallback.
- **Partial PATCH diffing**: Editing an experiment or run must compute exact dirty keys, preventing accidental wipes of existing attributes.
- **Ratio validation tolerance**: Float arithmetic issues (e.g., 0.8 + 0.1 + 0.1 = 1.0000000000000002) must use epsilon checks `abs(sum - 1.0) < 1e-5`.

---

### Task 1: Package Dependencies & Vite Proxy Configuration

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/vitest.config.ts`

**Interfaces:**
- Produces: Proxied API endpoints (`/login`, `/create_user`, `/users/me`, `/delete_user`, `/experiments`, `/run`, `/admin`) to `http://127.0.0.1:8000`.

- [ ] **Step 1: Install `react-router-dom`, `@tanstack/react-query`, and `vitest`**
Run: `bun add react-router-dom @tanstack/react-query && bun add -D vitest @testing-library/react jsdom` in `frontend/`
- [ ] **Step 2: Configure Vite proxy in `frontend/vite.config.ts`**
Add proxy rules for backend paths (`/login`, `/create_user`, `/users`, `/delete_user`, `/experiments`, `/run`, `/admin`) routing to `http://127.0.0.1:8000`.
- [ ] **Step 3: Verify TypeScript builds cleanly**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 4: Commit**
```bash
git add frontend/package.json frontend/bun.lock frontend/vite.config.ts frontend/vitest.config.ts
git commit -m "chore: add react-router, tanstack query, and vite backend proxy"
```

---

### Task 2: Core Domain Types & API Client with Error Normalizer

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/lib/diff.ts`
- Create: `frontend/src/lib/diff.test.ts`
- Create: `frontend/src/api/client.ts`

**Interfaces:**
- Produces:
  - `diffChanges<T>(initial: T, current: T): Partial<T>`
  - `apiClient<T>(endpoint: string, options?: RequestInit): Promise<T>`
  - Domain types for `User`, `Experiment`, `DataConfiguration`, `Run`, `Parameter`, `Metric`, `Artifact`, `AdminOverview`.

- [ ] **Step 1: Write test for `diffChanges`**
Create `frontend/src/lib/diff.test.ts` testing that unmodified keys are excluded and modified keys are retained.
- [ ] **Step 2: Run test to verify it fails**
Run: `bun run test frontend/src/lib/diff.test.ts`
Expected: FAIL (file not found)
- [ ] **Step 3: Implement `frontend/src/types/index.ts` and `frontend/src/lib/diff.ts`**
Define all domain schemas matching FastAPI models and implement `diffChanges`.
- [ ] **Step 4: Implement `frontend/src/api/client.ts`**
Fetch wrapper handling Bearer token injection from `localStorage.getItem("xporium_token")`, JSON body serialization, FormData pass-through, and error message normalization for FastAPI 422/400/404/409 errors.
- [ ] **Step 5: Run tests and typecheck**
Run: `bun run test` and `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 6: Commit**
```bash
git add frontend/src/types/index.ts frontend/src/lib/diff.ts frontend/src/lib/diff.test.ts frontend/src/api/client.ts
git commit -m "feat: add domain types, partial diff utility, and api client"
```

---

### Task 3: API Feature Services (Auth, Experiments, Runs, Artifacts, Admin)

**Files:**
- Create: `frontend/src/api/auth.ts`
- Create: `frontend/src/api/experiments.ts`
- Create: `frontend/src/api/runs.ts`
- Create: `frontend/src/api/artifacts.ts`
- Create: `frontend/src/api/admin.ts`
- Create: `frontend/src/hooks/use-auth.ts`

**Interfaces:**
- Produces:
  - `authApi`: `login`, `register`, `getMe`, `deleteAccount`
  - `experimentsApi`: `list`, `create`, `update`, `delete`, `listDataConfigs`, `createDataConfig`
  - `runsApi`: `listByExperiment`, `create`, `update`, `delete`
  - `artifactsApi`: `get`, `create`, `delete`
  - `adminApi`: `getOverview`, `getUsers`, `deleteUser`, `getExperiments`, `deleteExperiment`, `getRuns`, `deleteRun`
  - `useAuth`: global authentication state hook

- [ ] **Step 1: Implement `frontend/src/api/auth.ts`**
Handle OAuth2 urlencoded requests for `/login` and `/create_user`, `/users/me`, and `/delete_user`.
- [ ] **Step 2: Implement `frontend/src/api/experiments.ts`**
Handle `GET /experiments/`, `POST /experiments/`, `PATCH /experiments/:id`, `DELETE /experiments/:id`, `GET /experiments/:id/data-configurations`, `POST /experiments/:id/data-configurations`.
- [ ] **Step 3: Implement `frontend/src/api/runs.ts`**
Handle `GET /:experiment_id/runs`, `POST /:experiment_id/runs`, `PATCH /runs/:run_id`, `DELETE /runs/:run_id`.
- [ ] **Step 4: Implement `frontend/src/api/artifacts.ts`**
Handle `GET /run/:run_id/artifact`, `POST /run/:run_id/artifact` (multipart), `DELETE /run/:run_id/artifact`.
- [ ] **Step 5: Implement `frontend/src/api/admin.ts`**
Handle admin endpoints for overview, users, experiments, runs.
- [ ] **Step 6: Implement `frontend/src/hooks/use-auth.ts`**
Create React Context & hook managing `token`, `user`, `login`, `logout`, and `isAdmin` flag.
- [ ] **Step 7: Verify typecheck**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 8: Commit**
```bash
git add frontend/src/api/ frontend/src/hooks/use-auth.ts
git commit -m "feat: add api services for auth, experiments, runs, artifacts, and admin"
```

---

### Task 4: Layouts, Navigation & Shared Components

**Files:**
- Create: `frontend/src/components/layout/app-layout.tsx`
- Create: `frontend/src/components/layout/admin-layout.tsx`
- Create: `frontend/src/components/layout/protected-route.tsx`
- Create: `frontend/src/components/shared/confirm-dialog.tsx`
- Create: `frontend/src/components/shared/empty-state.tsx`
- Create: `frontend/src/components/shared/ratio-bar.tsx`

**Interfaces:**
- Produces:
  - `<AppLayout>`: Monochrome sidebar + navbar with search bar, user status, logout, and links to Experiments / Admin (if admin).
  - `<AdminLayout>`: Admin navigation (Overview, Users, Experiments, Runs).
  - `<ProtectedRoute>`: Redirects unauthenticated users to `/login` and non-admins away from `/admin`.
  - `<ConfirmDialog>`: Accessible dialog for destructive actions with confirm/cancel buttons.
  - `<RatioBar>`: Visual monochrome ratio bar displaying Train / Val / Test proportions.

- [ ] **Step 1: Implement `<ConfirmDialog>`**
Using `AlertDialog` or `Dialog` with monochrome styling and explicit warning text.
- [ ] **Step 2: Implement `<RatioBar>`**
Displays Train/Val/Test ratio percentages visually in monochrome grayscale segments.
- [ ] **Step 3: Implement `<AppLayout>` and `<AdminLayout>`**
Minimal monochrome sidebar navigation with user badge and clean layout container.
- [ ] **Step 4: Implement `<ProtectedRoute>` and `<AdminRoute>`**
Route wrappers checking `token` and `user.Role === 'admin'`.
- [ ] **Step 5: Verify typecheck**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 6: Commit**
```bash
git add frontend/src/components/layout/ frontend/src/components/shared/
git commit -m "feat: add layouts, protected routes, and shared monochrome components"
```

---

### Task 5: Authentication Pages (Login & Register)

**Files:**
- Create: `frontend/src/pages/login-page.tsx`
- Create: `frontend/src/pages/register-page.tsx`

**Interfaces:**
- Consumes: `useAuth` hook, `authApi`
- Produces: Working login and registration forms with validation and error alerts.

- [ ] **Step 1: Implement `frontend/src/pages/login-page.tsx`**
Minimal centered card with Username and Password fields, loading spinner state, error display, and link to register.
- [ ] **Step 2: Implement `frontend/src/pages/register-page.tsx`**
Registration form that submits to `/create_user` and on success redirects to `/login` with success banner.
- [ ] **Step 3: Verify typecheck**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 4: Commit**
```bash
git add frontend/src/pages/login-page.tsx frontend/src/pages/register-page.tsx
git commit -m "feat: add monochrome login and register pages"
```

---

### Task 6: Experiment Feed & Experiment Modals

**Files:**
- Create: `frontend/src/features/experiments/experiment-card.tsx`
- Create: `frontend/src/features/experiments/create-experiment-dialog.tsx`
- Create: `frontend/src/features/experiments/edit-experiment-dialog.tsx`
- Create: `frontend/src/pages/experiments-page.tsx`

**Interfaces:**
- Consumes: `experimentsApi`, TanStack Query `useQuery(['experiments'])`, `useMutation`
- Produces: Full Experiment library feed with client-side name search, "+ New Experiment" modal, partial edit modal, and delete confirmation.

- [ ] **Step 1: Implement `experiment-card.tsx`**
Card showing name, type badge, dataset name, run count, updated date, and action buttons (Open, Edit, Delete).
- [ ] **Step 2: Implement `create-experiment-dialog.tsx`**
Form with validation for Name, Dataset Name, Experiment Type (dropdown with valid enum values), and optional URLs.
- [ ] **Step 3: Implement `edit-experiment-dialog.tsx`**
Supports partial updates using `diffChanges` so only changed fields are submitted in `PATCH`.
- [ ] **Step 4: Implement `frontend/src/pages/experiments-page.tsx`**
Search input filtering experiments case-insensitively, loading skeletons, empty state with prompt, and card grid.
- [ ] **Step 5: Verify typecheck**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 6: Commit**
```bash
git add frontend/src/features/experiments/ frontend/src/pages/experiments-page.tsx
git commit -m "feat: add experiment feed, cards, create and partial edit dialogs"
```

---

### Task 7: Experiment Details & Data Configurations

**Files:**
- Create: `frontend/src/features/data-configs/data-config-card.tsx`
- Create: `frontend/src/features/data-configs/create-data-config-dialog.tsx`
- Create: `frontend/src/pages/experiment-detail-page.tsx`

**Interfaces:**
- Consumes: `experimentsApi`, `runsApi`, `DataConfiguration`, `PreprocessingStep`
- Produces: Experiment view with tabs: Overview, Data Configurations, and Runs.

- [ ] **Step 1: Implement `data-config-card.tsx`**
Shows config name, dataset version, Train/Val/Test ratio split, shuffle/stratified badges, and preprocessing step summary.
- [ ] **Step 2: Implement `create-data-config-dialog.tsx`**
- Name, optional dataset version, optional description.
- Train, validation, test ratio inputs with live sum validation enforcing $sum == 1.0$.
- Shuffle checkbox, random seed, stratified checkbox.
- Dynamic list builder for preprocessing steps (Name, Type, Configuration, Step Order).
- [ ] **Step 3: Implement `experiment-detail-page.tsx`**
Header with name, badges, edit and delete buttons. Tabs for Overview (metadata, links), Data Configurations (feed + add dialog), and Runs.
- [ ] **Step 4: Verify typecheck**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 5: Commit**
```bash
git add frontend/src/features/data-configs/ frontend/src/pages/experiment-detail-page.tsx
git commit -m "feat: add experiment detail page and data configuration builder"
```

---

### Task 8: Training Runs Management

**Files:**
- Create: `frontend/src/features/runs/run-card.tsx`
- Create: `frontend/src/features/runs/create-run-dialog.tsx`
- Create: `frontend/src/features/runs/edit-run-dialog.tsx`

**Interfaces:**
- Consumes: `runsApi`, `DataConfigurationResponse[]`
- Produces: Run cards, create run dialog with dynamic parameters & metrics, and partial update run dialog.

- [ ] **Step 1: Implement `run-card.tsx`**
Shows run model name, duration (s), environment, parameter count, metric count, and actions (Open, Edit, Delete).
- [ ] **Step 2: Implement `create-run-dialog.tsx`**
- Dropdown to select a Data Configuration from current experiment.
- Model name, training duration, environment type (local/cloud), environment specs.
- Dynamic parameter adder (Name, Value, Type: integer/float/string/boolean).
- Dynamic metric adder (Name, Value, Split: train/validation/test).
- [ ] **Step 3: Implement `edit-run-dialog.tsx`**
Partial PATCH updates for model_name, training_duration, environment_type, environment_specs using `diffChanges`.
- [ ] **Step 4: Integrate Runs tab in `experiment-detail-page.tsx`**
Connect runs query, run cards, and create dialog.
- [ ] **Step 5: Verify typecheck**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 6: Commit**
```bash
git add frontend/src/features/runs/
git commit -m "feat: add training runs cards, create and partial edit dialogs"
```

---

### Task 9: Run Details, Tables & Artifacts Viewer/Uploader

**Files:**
- Create: `frontend/src/features/runs/run-parameters-table.tsx`
- Create: `frontend/src/features/runs/run-metrics-table.tsx`
- Create: `frontend/src/features/artifacts/artifact-viewer.tsx`
- Create: `frontend/src/features/artifacts/attach-artifact-dialog.tsx`
- Create: `frontend/src/pages/run-detail-page.tsx`

**Interfaces:**
- Consumes: `runsApi`, `artifactsApi`
- Produces: Detailed run inspection page at `/experiments/:id/runs/:runId`.

- [ ] **Step 1: Implement `run-parameters-table.tsx` & `run-metrics-table.tsx`**
Monochrome shadcn tables showing hyperparameters and evaluated metrics.
- [ ] **Step 2: Implement `artifact-viewer.tsx` & `attach-artifact-dialog.tsx`**
- Preview decoded base64 image and/or note.
- Delete artifact action with confirmation dialog.
- If no artifact exists: "Attach Result" dialog accepting file upload (`image`) and/or text (`note`) via multipart/form-data.
- [ ] **Step 3: Implement `run-detail-page.tsx`**
Breadcrumb navigation back to experiment, run summary info, parameters table, metrics table, and artifact section.
- [ ] **Step 4: Verify typecheck**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 5: Commit**
```bash
git add frontend/src/features/artifacts/ frontend/src/pages/run-detail-page.tsx
git commit -m "feat: add run details page with parameters, metrics, and artifact management"
```

---

### Task 10: Admin Workspace (Overview, Users, Experiments, Runs)

**Files:**
- Create: `frontend/src/pages/admin/admin-overview-page.tsx`
- Create: `frontend/src/pages/admin/admin-users-page.tsx`
- Create: `frontend/src/pages/admin/admin-experiments-page.tsx`
- Create: `frontend/src/pages/admin/admin-runs-page.tsx`

**Interfaces:**
- Consumes: `adminApi`, `useAuth`
- Produces: Complete admin workspace protected by admin role guard.

- [ ] **Step 1: Implement `admin-overview-page.tsx`**
Monochrome metric cards for Total Users, Total Experiments, Total Configurations, Total Runs, Total Artifacts.
- [ ] **Step 2: Implement `admin-users-page.tsx`**
Table of all users with safe delete confirmation (self-deletion disabled).
- [ ] **Step 3: Implement `admin-experiments-page.tsx`**
Table of all experiments with view and delete capabilities.
- [ ] **Step 4: Implement `admin-runs-page.tsx`**
Table of all runs across users with view and delete capabilities.
- [ ] **Step 5: Verify typecheck**
Run: `bun run typecheck` in `frontend/`
Expected: PASS
- [ ] **Step 6: Commit**
```bash
git add frontend/src/pages/admin/
git commit -m "feat: add admin workspace overview, users, experiments, and runs pages"
```

---

### Task 11: Route Wiring, Monochrome Polish & End-to-End Build Verification

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/index.css`
- Create: `frontend/src/pages/not-found-page.tsx`

**Interfaces:**
- Consumes: All pages, layouts, and providers
- Produces: Fully functional full-stack frontend application bundle.

- [ ] **Step 1: Wire all routes and query client in `frontend/src/App.tsx`**
Set up `BrowserRouter`, `QueryClientProvider`, `AuthProvider`, and all nested routes.
- [ ] **Step 2: Refine monochrome theme styles in `frontend/src/index.css`**
Ensure pure black & white aesthetic across dark and light modes.
- [ ] **Step 3: Verify full production build**
Run: `bun run build` in `frontend/`
Expected: Zero TypeScript or Vite compilation errors.
- [ ] **Step 4: Run unit tests**
Run: `bun run test` in `frontend/`
Expected: All tests PASS.
- [ ] **Step 5: Commit**
```bash
git add frontend/src/App.tsx frontend/src/index.css frontend/src/pages/not-found-page.tsx
git commit -m "feat: complete route assembly and verify production build"
```
