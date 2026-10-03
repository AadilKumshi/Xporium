# ML Experiment Tracking System — Project Context

## 1. Project Overview

We are building a **web-based, multi-user Machine Learning Experiment Tracking System**, conceptually inspired by tools such as MLflow, but intentionally much smaller and focused on experimentation record-keeping.

The purpose of this application is to allow ML practitioners to **manually record, organize, compare, and inspect machine-learning experiments and their runs** through a web interface.

### Core idea

The system does **NOT train models**.

It does **NOT execute ML pipelines**.

It does **NOT monitor training processes**.

Instead:

> A user performs ML experimentation externally, then manually records the important information about that experiment/run inside this application.

Example:

```text
Experiment: Customer Churn Prediction

Run:
    Model: Random Forest
    Data Configuration: 80/10/10, seed=42
    Training Duration: 18.4 seconds
    Environment: Local

    Parameters:
        n_estimators = 300
        max_depth = 12
        class_weight = balanced

    Metrics:
        train_accuracy = 0.97
        test_accuracy = 0.91
        test_f1 = 0.88

    Artifact:
        image = confusion matrix
        note = "Best model so far. Model saved externally."
```

The application stores and presents this information.

---

## 2. Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT authentication

### Frontend

A web frontend will interact with the FastAPI backend.

### Database

PostgreSQL is the primary database.

Current database structure:

```text
database/
    __init__.py
    database.py
    models.py
    schemas.py
```

`database.py` contains database initialization/base setup.

`models.py` contains SQLAlchemy ORM models.

`schemas.py` contains Pydantic request/response schemas.

---

# 3. Scope Philosophy

The central principle is:

> **Record experimentation, don't become responsible for experimentation.**

The system is an experiment tracker, not a complete ML platform.

## Explicitly IN scope

- User authentication
- Multiple users
- Experiment creation
- Experiment organization
- Reusable data configurations
- Preprocessing descriptions
- Manual run creation
- Parameters
- Metrics
- Train/Test/Validation metric distinction
- Optional run artifacts
- Optional images
- Optional notes
- Experiment/run browsing
- Experiment/run comparison
- Database persistence
- API validation
- Ownership/security
- Cascade deletion
- Clean web UI

## Explicitly OUT of scope for V1

Do NOT introduce these unless explicitly requested:

- Model registry
- Model file storage
- Model serving
- ML training execution
- Training job orchestration
- Hyperparameter optimization
- Dataset hosting
- Dataset version management/hosting
- Git integration
- Git commit tracking
- Data pipelines
- Distributed training
- Experiment scheduling
- Multiple artifact images per run
- Multiple artifact objects per run
- Complex RBAC
- Kubernetes
- Celery/background training workers
- MLflow integration
- Automatic experiment logging
- Automatic metric collection

The project intentionally has controlled scope.

---

# 4. Domain Model

The fundamental hierarchy is:

```text
User
 │
 └── Experiment
      │
      ├── DataConfiguration
      │     └── PreprocessingStep
      │
      └── Run
            │
            ├── Parameter
            ├── Metric
            └── Artifact
                  ├── Image
                  └── Note
```

There are 8 database tables:

```text
users
experiments
data_configurations
preprocessing_steps
runs
parameters
metrics
artifacts
```

---

# 5. User

A User represents an authenticated application user.

### Fields

```text
id
    Integer primary key

username
    String
    Required
    Unique

hashed_password
    String
    Required

role
    Enum
    USER / ADMIN

created_at
    Timezone-aware timestamp
```

Relationship:

```text
User 1 ─────── N Experiment
```

A user must only be able to access their own experiments and everything underneath those experiments.

---

# 6. Experiment

An Experiment represents an **ML problem/project**.

Examples:

```text
House Price Prediction
Customer Churn Prediction
Image Classification
Movie Recommendation
Fraud Detection
```

It is NOT a single model run.

One Experiment can contain many runs.

### Fields

```text
id
user_id
name
description
dataset_name
dataset_public_url
experiment_type
created_at
updated_at
```

### Experiment types

```text
classification
regression
clustering
dimensionality_reduction
anomaly_detection
generation
other
```

### Important rule

Experiment names do **not** need to be unique.

The same user may have multiple experiments with the same name.

---

# 7. DataConfiguration

`DataConfiguration` represents the **specific dataset preparation/splitting configuration used during experimentation**.

It belongs to an Experiment and is reusable.

Example:

```text
Configuration A:
    Dataset Version: v1.0
    Train: 80%
    Validation: 10%
    Test: 10%
    Shuffle: true
    Seed: 42
    Stratified: true
```

Multiple Runs can use the same configuration:

```text
Config A
   ├── Run 1
   ├── Run 2
   ├── Run 3
   └── Run 4
```

### Fields

```text
id
experiment_id
name
dataset_version
description

train_ratio
validation_ratio
test_ratio

shuffle
random_seed
stratified

created_at
```

### Split ratio rules

Ratios are stored as proportions:

```text
0.8
0.1
0.1
```

NOT:

```text
80
10
10
```

Rules:

```text
train_ratio >= 0
validation_ratio >= 0
test_ratio >= 0

train_ratio + validation_ratio + test_ratio = 1
```

Database constraints enforce these rules.

### Immutability

A DataConfiguration is conceptually **immutable after creation**.

If the user wants to change a configuration, they should copy it into a new configuration and modify the copy.

Example:

```text
Config A
    80/10/10
    seed=42

Copy →

Config B
    70/15/15
    seed=123
```

Changing Config B must not modify Config A.

### Copying

Copying must create independent database records, including independent preprocessing steps.

---

# 8. PreprocessingStep

A DataConfiguration may have zero or more preprocessing steps.

```text
DataConfiguration
    │
    ├── Step 1
    ├── Step 2
    └── Step 3
```

### Fields

```text
id
data_config_id
name
type
configuration
step_order
```

Example:

```text
name:
StandardScaler

type:
scaling

configuration:
{
    "with_mean": true,
    "with_std": true
}

step_order:
2
```

Another:

```text
name:
SimpleImputer

type:
imputation

configuration:
{
    "strategy": "median"
}

step_order:
1
```

### Important decisions

`type` is a **String**, not an enum, so new preprocessing methods can be added without changing database enums.

`configuration` is JSON because different preprocessing techniques have different configuration parameters.

`step_order` determines sequence.

There is a unique constraint:

```text
(data_config_id, step_order)
```

---

# 9. Run

A Run represents **one execution of an ML training/evaluation process**.

The application does not execute the process. The user manually records its result.

### Fields

```text
id
data_config_id
model_name
training_duration
environment_type
environment_specs
created_at
```

There is deliberately **NO `experiment_id` column in Run**.

The hierarchy is:

```text
Run
 ↓
DataConfiguration
 ↓
Experiment
```

This avoids maintaining two independent paths from Run to Experiment.

### Training duration

Stored as a numeric value in **seconds**.

Example:

```text
42.7
```

means 42.7 seconds.

### Environment

Strict enum:

```text
local
cloud
```

`environment_specs` is optional free-form text.

Examples:

```text
Ryzen 7 5800H, RTX 3060 6GB, 16GB RAM
```

or:

```text
Google Colab — NVIDIA T4 16GB
```

---

# 10. Run → DataConfiguration

Relationship:

```text
DataConfiguration 1 ─────── N Run
```

A DataConfiguration can be reused across many Runs.

Do NOT use `delete-orphan` on this relationship.

Deleting a Run must not delete the DataConfiguration.

A DataConfiguration used by historical Runs should not be silently destroyed.

---

# 11. Parameters

Parameters are dynamic user-defined values associated with a Run.

Examples:

```text
learning_rate = 0.001
batch_size = 32
epochs = 20
optimizer = Adam
use_batch_norm = true
```

### Fields

```text
id
run_id
name
value
type
```

### Storage design

Parameter values are deliberately:

```text
value → String
type  → String
```

Example:

```text
name = "learning_rate"
value = "0.001"
type = "float"
```

or:

```text
name = "use_batch_norm"
value = "true"
type = "boolean"
```

Supported semantic types:

```text
integer
float
string
boolean
```

The application/Pydantic layer handles interpretation and validation.

Do not replace this with JSONB unless explicitly requested.

### Uniqueness

Within one Run:

```text
(run_id, name)
```

must be unique.

Different Runs may have the same parameter names.

---

# 12. Metrics

Metrics represent numerical evaluation results.

### Fields

```text
id
run_id
name
value
split
```

Example:

```text
accuracy | 0.97 | train
accuracy | 0.91 | test
loss     | 0.12 | train
loss     | 0.23 | test
f1_score | 0.88 | test
```

### Metric split

Supported values:

```text
train
test
validation
```

### Metric value

Stored as `Float`.

### Uniqueness

The following must be unique:

```text
(run_id, name, split)
```

Thus:

```text
accuracy | train | 0.95
accuracy | train | 0.97
```

is invalid.

But:

```text
accuracy | train | 0.95
accuracy | test  | 0.91
```

is valid.

---

# 13. Artifact

Artifacts were intentionally simplified.

**We do NOT store models.**

The application is NOT a model registry.

A Run can optionally have one Artifact.

```text
Run
 └── Artifact (0:1)
```

An Artifact can contain:

```text
0 or 1 image
0 or 1 note
```

All of these are valid:

```text
Run 1
    no Artifact

Run 2
    Artifact
        image only

Run 3
    Artifact
        note only

Run 4
    Artifact
        image + note
```

### Fields

```text
id
run_id
image_data
image_filename
image_type
note
created_at
```

### Image storage

The image itself is stored in PostgreSQL using:

```python
LargeBinary
```

This stores actual binary bytes.

Do NOT convert it to hexadecimal text unless explicitly requested.

### Image metadata

`image_filename` stores the original filename.

Example:

```text
confusion_matrix.png
```

`image_type` stores the MIME type.

Example:

```text
image/png
```

### Note

The note is free-form text.

It may contain:

- experiment observations
- conclusions
- model links
- debugging notes
- TODOs
- anything relevant to the run

Example:

```text
Best model so far.
External model:
https://drive.google.com/...
```

The application does not interpret model links.

### Artifact storage limits

There is intentionally **no application-level total artifact storage quota**.

The structural restriction is:

```text
maximum 1 Artifact per Run
maximum 1 image inside that Artifact
maximum 1 note inside that Artifact
```

The Artifact itself is optional.

---

# 14. ORM Relationships

The intended relationships are:

```text
User
 └── experiments
       ↓
Experiment
 ├── user
 ├── data_configurations
 └── runs (derived/read-only)
       ↓
DataConfiguration
 ├── experiment
 ├── preprocessing_steps
 └── runs
       ↓
Run
 ├── data_config
 ├── experiment (derived/read-only)
 ├── parameters
 ├── metrics
 └── artifact
```

`Experiment.runs` and `Run.experiment` are derived through `DataConfiguration` and are:

```python
viewonly=True
```

The actual database relationship is:

```text
Run → DataConfiguration
```

not:

```text
Run → Experiment
```

Do not add `experiment_id` back to Run without explicitly discussing the architecture first.

---

# 15. Cascade Deletion

Deleting an Experiment should delete its entire tree:

```text
Delete Experiment
        │
        ├── DataConfigurations
        │       └── PreprocessingSteps
        │
        └── Runs
                ├── Parameters
                ├── Metrics
                └── Artifact
```

The user should not be left with orphaned dependent data.

Foreign keys use appropriate `ondelete="CASCADE"` where needed.

However:

```text
DataConfiguration → Run
```

must NOT use ORM `delete-orphan`.

A DataConfiguration is reusable and should not be deleted merely because a Run disappears.

---

# 16. Ownership and Authorization

This is a multi-user system.

Ownership hierarchy:

```text
User
 ↓
Experiment
 ↓
DataConfiguration
 ↓
Run
 ↓
Parameter / Metric / Artifact
```

A user must never be able to access another user's resources simply by guessing an integer ID.

Example:

```text
User A owns Experiment 10
User B owns Experiment 20
```

User B requesting Experiment 10 must be rejected.

The same applies to indirect resources such as Runs, DataConfigurations, Parameters, Metrics, and Artifacts.

Authorization must trace resources back to the owning User.

Do not rely on IDs being difficult to guess. IDs are intentionally integers.

---

# 17. Important Database Constraints

### User

```text
email UNIQUE
```

### DataConfiguration

```text
train_ratio >= 0
validation_ratio >= 0
test_ratio >= 0

train_ratio + validation_ratio + test_ratio ≈ 1
```

### PreprocessingStep

```text
(data_config_id, step_order) UNIQUE
```

### Parameter

```text
(run_id, name) UNIQUE
```

### Metric

```text
(run_id, name, split) UNIQUE
```

### Artifact

```text
run_id UNIQUE
```

because there can be only one Artifact per Run.

---

# 18. Current SQLAlchemy Model Design

The current models are:

```text
User
Experiment
DataConfiguration
PreprocessingStep
Run
Parameter
Metric
Artifact
```

Enums:

```text
UserRole
TrainingEnvironment
ExperimentType
MetricSplit
```

Enum values are stored using the enum `.value` values through:

```python
Enum(MyEnum, values_callable=_enum_values)
```

so the database stores values such as:

```text
classification
regression
local
cloud
train
test
```

rather than enum member names.

---

# 19. Things NOT to "Improve"

Do not automatically introduce abstractions simply because larger ML platforms use them.

Do NOT introduce:

```text
Model table
Dataset table
ModelRegistry
ExperimentVersion
TrainingJob
RunStatus
GitCommit
HyperparameterSearch
```

unless explicitly requested.

The project is intentionally designed around a small but realistic domain model.

The goal is not maximum feature count.

The goal is a clean, maintainable, production-style implementation of the chosen scope.

---

# 20. Development Philosophy

The developer is building this project to improve **Machine Learning Engineering and Backend Engineering understanding**, not merely to generate a working CRUD application.

When proposing implementation:

1. Explain the purpose.
2. Explain the design decision.
3. Explain important trade-offs.
4. Implement only the current layer.
5. Avoid jumping several layers ahead.
6. Do not silently modify agreed architecture.
7. If a new requirement conflicts with an existing decision, explicitly point it out.
8. Prefer simple, understandable solutions over premature abstraction.
9. Challenge questionable design decisions rather than blindly agreeing.
10. Preserve the core domain model unless a deliberate architectural decision is made.

---

# 21. Current Development State

The database model has been designed and implemented.

Current progress:

```text
Database Design
      ↓
SQLAlchemy Models       ← COMPLETED
      ↓
Model Review / Integrity ← CURRENTLY BEING FINALIZED
      ↓
Pydantic Schemas
      ↓
API Routes
      ↓
Authentication integration
      ↓
Frontend
      ↓
Testing
      ↓
Deployment
```

Do not jump ahead unless requested.

The next major layer is expected to be `schemas.py`, containing Pydantic request/response models.

---

# 22. Core Mental Model

Always think about the system like this:

```text
USER
  │
  │ owns
  ▼
EXPERIMENT
  │
  ├──────────────────────────────┐
  │                              │
  │ contains                     │ contains
  ▼                              ▼
DATA CONFIGURATION               RUN
  │                              │
  │ describes                    │ records
  │ how data was used            │ what happened
  │                              │
  ├── preprocessing              ├── parameters
  │                              ├── metrics
  │                              └── artifact
  │
  └───────────────┐
                  │
                  │ selected by
                  ▼
                 RUN
```

The most important distinction is:

**Experiment = the ML problem**

**DataConfiguration = how the data was prepared/partitioned**

**Run = one particular training/evaluation attempt**

**Parameter = what configuration/hyperparameters were used**

**Metric = what numerical results were obtained**

**Artifact = optional visual/note evidence about the run**

This distinction must remain consistent throughout the backend, API, and frontend.

---

# 23. Example Complete Workflow

### Step 1 — Create Experiment

```text
Name:
Customer Churn Prediction

Description:
Predict whether a customer will churn.

Dataset:
Telco Customer Churn

Dataset URL:
https://...

Type:
Classification
```

### Step 2 — Create DataConfiguration

```text
Name:
Baseline Split

Dataset Version:
v1

Train:
0.8

Validation:
0.1

Test:
0.1

Shuffle:
true

Random Seed:
42

Stratified:
true
```

Preprocessing:

```text
1. SimpleImputer
2. StandardScaler
3. OneHotEncoder
```

### Step 3 — Create Run

```text
Model:
Random Forest

Data Configuration:
Baseline Split

Training Duration:
18.42 seconds

Environment:
Local

Environment Specs:
RTX 3060, Ryzen 7, 16GB RAM
```

Parameters:

```text
n_estimators = 300
max_depth = 12
class_weight = balanced
```

Metrics:

```text
accuracy | train | 0.97
accuracy | test  | 0.91
f1       | test  | 0.88
```

Artifact:

```text
Image:
confusion_matrix.png

Note:
"Best model so far. Model stored externally."
```

### Step 4 — Create another Run

The second Run can use the same DataConfiguration:

```text
Baseline Split
```

but use:

```text
Model:
XGBoost
```

Now the Experiment contains multiple comparable Runs using the same data configuration.

This is one of the primary reasons DataConfiguration is a separate reusable entity.

---

# 24. Final Architectural Principle

The system should answer questions such as:

> What experiments have I run?

> What models did I try?

> What data configuration did each run use?

> What parameters did I use?

> What metrics did I obtain?

> Which run performed best?

> What preprocessing did I use?

> What did I observe about this run?

It should NOT answer:

> Can you train this model for me?

> Can you deploy this model?

> Can you manage my datasets?

> Can you store my trained model?

> Can you run a hyperparameter search?

Those belong to other systems.

The product is fundamentally a:

> **Structured experiment notebook + database + web interface for ML experimentation.**

Keep this scope and mental model consistent when implementing the rest of the application.
