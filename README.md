# Xporium

**Xporium** is a personal machine learning experiment tracking and management platform designed to help researchers log datasets, partition configs, preprocessing pipelines, training runs, hyperparameters, metrics, and visual artifacts.

---

## 🏛 Architecture & Tech Stack

```text
Xporium/
├── backend/                  # FastAPI REST API + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── database/         # Models, DB session, schemas
│   │   ├── routers/          # Auth, experiments, runs, artifacts, admin
│   │   └── security/         # JWT, password hashing, OAuth2
│   └── main.py
│
└── frontend/                 # React 19 + TypeScript + Vite (Monochrome UI)
    ├── src/
    │   ├── api/              # Typed client with Bearer interceptors & error normalizer
    │   ├── components/ui/    # Shadcn UI primitives (monochrome theme)
    │   ├── features/         # Experiments, Data Configs, Runs, Artifacts, Admin
    │   ├── hooks/            # useAuth, useMobile
    │   └── pages/            # Route targets & layouts
    └── vite.config.ts        # Vite dev server proxy to FastAPI
```

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, PostgreSQL (`psycopg`), Alembic, Pydantic v2, Python-Jose (JWT).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, shadcn UI (@base-ui/react), Lucide Icons, TanStack Query, React Router DOM.
- **Design Philosophy**: Minimal technical monochrome (black & white mode only), information-dense, and progressive ML workflow.

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- **Python**: 3.10 or higher
- **PostgreSQL**: Running locally or accessible via network
- **Package Manager**: [Bun](https://bun.sh) (recommended) or **Node.js (v18+) / npm**

---

## 🚀 Local Setup Guide

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:
   Create a `.env` file in `backend/` (or set environment variables):
   ```env
   DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/xporium
   SECRET_KEY=dev-secret-change-me
   ```
   > *Note: Ensure your PostgreSQL database `xporium` exists (`createdb xporium` or via psql).*

5. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API documentation will be available at:
   - Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Alternative ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 2. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   Using Bun:
   ```bash
   bun install
   ```
   *Or using npm:*
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   bun run dev
   ```
   *Or using npm:*
   ```bash
   npm run dev
   ```
   Open your browser at **[http://localhost:5173](http://localhost:5173)**.

> 💡 **Seamless Proxy**: The Vite development server automatically proxies API endpoints (`/login`, `/create_user`, `/users`, `/experiments`, `/runs`, `/run`, `/admin`) to `http://127.0.0.1:8000`, eliminating CORS setup during development.

---

## 🧪 Testing & Verification

From inside the `frontend/` directory:

- **Run Unit Tests** (Vitest):
  ```bash
  bun run test
  ```
  Validates ratio sum tolerance logic, partial PATCH diff generators, and API error normalization.

- **Run TypeScript Typecheck**:
  ```bash
  bun run typecheck
  ```

- **Build for Production**:
  ```bash
  bun run build
  ```
  Generates minified, production-ready static assets in `frontend/dist/`.

---

## 🧭 Application Walkthrough

### 1. Authentication
- Go to `/register` to create a new researcher account (`username` and `password`).
- Log in at `/login`. Tokens are stored in `localStorage` and automatically injected into subsequent API calls.

### 2. Experiment Feed (`/experiments`)
- View all your experiments. Filter dynamically by experiment name, dataset, or type via the search bar.
- Click **"+ New Experiment"** to define an experiment (Name, Dataset, Type: classification, regression, clustering, etc.).

### 3. Progressive Experiment Management (`/experiments/:id`)
- **Overview Tab**: Inspect metadata, description, and clickable public dataset or notebook links.
- **Data Configurations Tab**:
  - Click **"+ Add Dataset Configuration"**.
  - Adjust Train / Val / Test ratios with live 100% sum verification.
  - Dynamically attach ordered preprocessing steps (e.g., tokenization, resizing, scaling).
- **Training Runs Tab**:
  - Click **"+ Record Training Run"**.
  - Select a data configuration, duration, model name, and execution environment (Local / Cloud).
  - Add dynamic hyperparameters and metric evaluations.

### 4. Run Details & Results (`/experiments/:id/runs/:runId`)
- View formatted tables for hyperparameters and evaluation splits.
- Upload plots, confusion matrices, or loss curves via the **"Attach Result"** modal, or log analytical text observations.
- Delete or modify runs safely with explicit confirmation prompts.

### 5. Admin Portal (`/admin`)
- Accessible to users with `Role === "admin"`.
- Real-time telemetry cards: Total Users, Total Experiments, Total Configurations, Total Runs, Total Artifacts.
- Management tables with deletion controls for global resources and user accounts (with self-deletion prevention).

---

## 📜 License & Acknowledgments

Built for personal ML experiment tracking with clean full-stack separation and pure black & white ergonomics.
