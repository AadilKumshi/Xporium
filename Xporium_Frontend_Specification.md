# Xporium Frontend Specification

## 1. Project Overview

**Xporium** is a personal ML experiment tracking and management platform.

The main purpose of Xporium is to allow a user to:

- Create and manage ML experiments
- Store dataset configurations
- Record preprocessing steps
- Record training runs
- Store hyperparameters
- Store metrics
- Attach optional artifacts such as images and notes
- View previous experiments and runs
- Edit and delete their own resources
- Eventually share experiments with other users

The backend is built with **FastAPI + PostgreSQL + SQLAlchemy**.

The frontend should communicate with the backend exclusively through the REST API.

---

## 2. Core Product Idea

The most important concept is:

> **An Experiment is the central object in Xporium.**

Everything else belongs around an experiment.

```text
User
 │
 └── Experiments
       │
       ├── Data Configurations
       │      └── Preprocessing Steps
       │
       └── Runs
              ├── Parameters
              ├── Metrics
              └── Optional Artifact
```

The frontend should reflect this hierarchy.

The user should **not feel like they are interacting with database tables**.

For example, don't design the UI around `POST DataConfiguration`. Instead, the UI should communicate: **"How was your dataset prepared?"**

Similarly, don't present a Run as a bunch of database fields. Present it as: **"Record what happened during this training run."**

---

## 3. General Design Philosophy

The application should feel like:

- A professional ML workspace
- Clean
- Minimal
- Technical
- Fast
- Easy to scan
- Information-dense without being cluttered

Avoid making it look like a generic admin dashboard.

Avoid excessive:

- Gradients
- Animations
- Huge cards
- Decorative graphics
- Unnecessary modals
- Excessive colors

The UI should prioritize **information and usability**.

---

## 4. Main Application Structure

```text
Xporium
│
├── Authentication
│   ├── Login
│   └── Register
│
├── User Application
│   ├── Home
│   ├── Create Experiment
│   ├── Experiment Details
│   │   ├── Overview
│   │   ├── Data Configurations
│   │   └── Runs
│   │
│   ├── Run Details
│   └── Settings/Profile
│
└── Admin Application
    ├── Dashboard
    ├── Users
    ├── Experiments
    └── Runs
```

Sharing will be implemented later.

---

## 5. Authentication

The backend uses JWT authentication.

Flow:

```text
Login
   ↓
Backend returns JWT
   ↓
Frontend stores authentication state
   ↓
Authenticated application
```

### Login

Fields:

- Username
- Password

Actions:

- Login
- Link to Register

### Register

Fields should correspond to the backend registration schema.

After successful registration, the user should either automatically log in or be redirected to login.

---

## 6. Protected Routes

Authenticated pages:

```text
/
 /experiments
 /experiments/:id
 /experiments/:id/edit
 /experiments/:id/runs/:runId
 /profile
```

Admin pages:

```text
/admin
/admin/users
/admin/experiments
/admin/runs
```

> Frontend route protection is only for UX. It is **not security**. The backend remains responsible for authorization.

---

## 7. Application Layout

After logging in, use a main application layout.

```text
┌────────────────────────────────────────────────────────────┐
│ Xporium                              Search     Profile     │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│ Home         │                                             │
│              │              Main Content                   │
│ Experiments  │                                             │
│              │                                             │
│ Settings     │                                             │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

On smaller screens, the sidebar can become a top navigation/menu.

---

## 8. Home / Experiment Feed

This is the **most important screen**.

The user's experiments should appear like a feed/library.

Example:

```text
My Experiments                         + New Experiment

[ Search experiments... ]

┌──────────────────────────────────────────────┐
│ EuroSAT Transfer Learning                    │
│ Classification                              │
│                                              │
│ Dataset: EuroSAT                             │
│ Runs: 8                                      │
│ Updated: 2 hours ago                         │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Emotion Classification                       │
│ Classification                              │
│                                              │
│ Dataset: Emotion Dataset                     │
│ Runs: 5                                      │
│ Updated: Yesterday                           │
└──────────────────────────────────────────────┘
```

### Search

For now, no backend search endpoint is required.

Load the experiments and filter them on the frontend by experiment name.

```text
GET /experiments
        ↓
Frontend receives experiments
        ↓
User searches "Euro"
        ↓
Frontend filters by name
```

Search should preferably be case-insensitive.

---

## 9. Experiment Card

Each card should show useful information without exposing every database field.

Suggested information:

- Experiment Name
- Experiment Type
- Dataset Name
- Number of Runs
- Last Updated

Potential actions:

- Open
- Edit
- Delete
- Share (planned later)

A three-dot menu is fine if direct actions make the card cluttered.

---

## 10. Create Experiment

Prominent button:

```text
+ New Experiment
```

### Required

```text
Name
Dataset Name
Experiment Type
```

### Optional

```text
Description
Dataset Public URL
Project / Notebook URL
```

The frontend should perform basic validation, but the backend remains the final authority.

---

## 11. Don't Create One Giant Form

Do **not** create one giant form containing:

```text
Experiment
+
Data Configuration
+
Preprocessing
+
Run
+
Parameters
+
Metrics
+
Artifacts
```

Instead:

```text
Create Experiment
        ↓
Experiment created
        ↓
Experiment Details
        ↓
Create Data Configuration
        ↓
Create Run
```

The user progressively builds the experiment.

---

## 12. Experiment Details Page

Example:

```text
/experiments/:experimentId
```

Header:

```text
EuroSAT Transfer Learning

Classification
Dataset: EuroSAT

[ Edit ] [ Share ] [ Delete ]
```

Sections/tabs:

```text
Overview | Data | Runs
```

---

## 13. Experiment Overview

Show:

### Description

The experiment description.

### Dataset

Dataset name and, if present, a clickable public dataset URL.

### Experiment Type

For example:

```text
Classification
```

### Project / Notebook Link

If supplied, show a clickable:

```text
Open Notebook
```

If absent, don't display an empty section.

### Dates

Show:

- Created
- Last Updated

---

## 14. Editing an Experiment

Example:

```text
Edit Experiment

Name
[ EuroSAT Transfer Learning ]

Description
[ ... ]

Dataset Name
[ EuroSAT ]

Dataset URL
[ ... ]

Notebook URL
[ ... ]

Experiment Type
[ Classification ]

[ Cancel ] [ Save Changes ]
```

### Important: Partial Updates

The frontend must send **only the fields the user actually changed**.

If the user changes only the name:

```json
{
    "name": "New Name"
}
```

Do not send all other fields as `null`.

This matters because the backend update schemas support partial updates.

---

## 15. Data Configuration

A Data Configuration represents:

> **How the dataset was prepared for this experiment.**

Example:

```text
Data Configurations

+ New Data Configuration

┌─────────────────────────────────────────────┐
│ Baseline                                    │
│                                             │
│ Train         80%                           │
│ Validation    20%                           │
│ Test           0%                           │
│                                             │
│ Shuffle: Yes                                │
│ Stratified: No                              │
│                                             │
│ [ Open ] [ Edit ] [ Delete ]                │
└─────────────────────────────────────────────┘
```

---

## 16. Data Configuration Form

Fields:

```text
Name
Dataset Version (optional)
Description (optional)

Train Ratio
Validation Ratio
Test Ratio

Shuffle
Random Seed (optional)
Stratified
```

The three ratios must total `1.0` / `100%`.

Example:

```text
Train       80%
Validation  20%
Test         0%

Total: 100% ✓
```

Invalid:

```text
Train       70%
Validation  20%
Test         5%

Total: 95% ✗
```

Prevent submission and explain why.

---

## 17. Dataset Version

Dataset version is **optional**.

Users can leave it empty.

Example:

```text
Dataset Version
[ v1.0 ]
```

or:

```text
Dataset Version
[ Leave blank if not applicable ]
```

Do not force users to invent a version number.

---

## 18. Preprocessing Steps

A preprocessing step describes an operation performed on the dataset before training.

Examples:

- Tokenization
- Normalization
- Resizing
- Data Augmentation
- Image Scaling
- Missing Value Handling
- Stopword Removal

Users should be able to add multiple steps.

Example:

```text
Preprocessing Steps

1. Resize
   Type: image_resize
   Configuration:
      width: 224
      height: 224

2. Normalization
   Type: normalization
   Configuration:
      method: minmax

3. Tokenization
   Type: tokenization
   Configuration:
      tokenizer: wordpiece
```

The `configuration` field is flexible JSON.

Provide a user-friendly interface rather than forcing users to understand raw JSON unless necessary.

---

## 19. Run Creation

A Run represents:

> **One actual training/evaluation run of an experiment.**

Example:

```text
+ New Run
```

Form:

```text
Data Configuration
[ Baseline ▼ ]

Model Name
[ ResNet50 ]

Training Duration
[ 124.5 ]

Environment
[ Cloud ▼ ]

Environment Specs
[ Google Colab / T4 GPU ]
```

---

## 20. Parameters

Parameters are optional and can be added dynamically.

Example:

```text
Parameters

Learning Rate
[ 0.001 ]

Batch Size
[ 32 ]

Epochs
[ 10 ]

Optimizer
[ Adam ]

[ + Add Parameter ]
```

Each parameter contains:

```text
Name
Value
Type
```

Supported types:

```text
integer
float
string
boolean
```

---

## 21. Metrics

Metrics are optional and can be added dynamically.

Example:

```text
Metrics

Accuracy
Value: 0.977
Split: Validation

Loss
Value: 0.092
Split: Validation

F1 Score
Value: 0.971
Split: Test

[ + Add Metric ]
```

Each metric contains:

```text
Name
Value
Split
```

Use a dropdown for the split.

---

## 22. Run Details

After creating a run, users should be able to open it.

Example:

```text
Run #8

ResNet50
```

### Training Information

```text
Duration: 124.5 seconds
Environment: Cloud
Environment Specs: Colab / T4
```

### Parameters

Display as a table:

| Parameter | Value | Type |
|---|---|---|
| Learning Rate | 0.001 | float |
| Batch Size | 32 | integer |
| Epochs | 10 | integer |

### Metrics

Display clearly:

| Metric | Value | Split |
|---|---:|---|
| Accuracy | 0.977 | Validation |
| Loss | 0.092 | Validation |
| F1 | 0.971 | Test |

---

## 23. Artifacts

Artifacts are completely optional.

A Run may have:

- An image
- A note
- Both
- Neither is **not allowed when an Artifact record is created**

The backend validates that at least one exists.

UI:

```text
Artifact

Image
[ Upload Image ]

Note
[ Add a note... ]
```

The user must provide at least one if they create an artifact.

Examples:

### Image only

```text
confusion_matrix.png
```

### Note only

```text
Best validation performance achieved after fine-tuning block 5.
```

### Both

```text
training_curve.png

"Validation accuracy plateaued after epoch 6."
```

---

## 24. Artifact Display

If an image exists, display it.

If a note exists, display it.

If only an image exists, don't display an empty Notes section.

If only a note exists, don't display an empty image container.

---

## 25. Updating Resources

Edit forms should support **partial updates**.

This applies to:

- Experiments
- Runs
- Artifacts

If the user changes one field, send only that field.

Example:

Existing:

```text
Name = EuroSAT
Description = Transfer learning experiment
Dataset = EuroSAT
```

User changes only:

```text
Name = EuroSAT V2
```

Request:

```json
{
    "name": "EuroSAT V2"
}
```

---

## 26. Delete Operations

Deletion should always require confirmation.

Example:

```text
Delete Experiment?

This will permanently delete:

• The experiment
• Its data configurations
• Its preprocessing steps
• Its runs
• Its metrics
• Its parameters
• Its artifacts

This action cannot be undone.

[ Cancel ] [ Delete Experiment ]
```

For a Run:

```text
Delete Run?

This will delete the run, its parameters,
metrics and artifact.

[ Cancel ] [ Delete Run ]
```

---

## 27. Loading States

Every API operation should have a clear loading state.

Examples:

```text
Loading experiments...
```

or skeleton cards.

Buttons can show:

```text
Saving...
Deleting...
Creating...
```

The user should never wonder whether the request was sent.

---

## 28. Error Handling

Backend errors should be presented in human-readable form.

Instead of:

```text
422 Unprocessable Entity
```

prefer:

```text
Please enter a valid experiment name.
```

Other examples:

```text
Invalid username or password.

You do not have permission to perform this action.

Something went wrong. Please try again.
```

Do not expose raw stack traces to users.

---

## 29. Empty States

If the user has no experiments:

```text
No experiments yet.

Start tracking your first ML experiment.

[ + Create Experiment ]
```

No runs:

```text
No runs recorded yet.

[ + Create Run ]
```

No preprocessing:

```text
No preprocessing steps added.
```

Empty states should guide the user toward the next action.

---

## 30. Admin Dashboard

The admin interface should be separate from the normal user experience.

Navigation:

```text
Admin Dashboard

Overview
Users
Experiments
Runs
```

---

## 31. Admin Overview

Possible cards:

```text
Users
42

Experiments
126

Runs
843

Artifacts
392
```

Then sections such as:

```text
Recent Users
Recent Experiments
Recent Runs
```

Exact statistics can evolve based on the backend overview endpoint.

---

## 32. Admin Users

Display users in a table.

| Username | Role | Created | Actions |
|---|---|---|---|
| user1 | USER | Oct 1 | Delete |
| user2 | USER | Oct 2 | Delete |
| admin | ADMIN | Sep 20 | — |

Admin should be able to delete users where permitted.

Deletion should require confirmation.

---

## 33. Admin Experiments

Display all experiments.

| Experiment | Owner | Dataset | Type | Created | Actions |
|---|---|---|---|---|---|
| EuroSAT | user1 | EuroSAT | Classification | Oct 2 | View / Delete |

Actions:

- View
- Delete

---

## 34. Admin Runs

Display all runs.

| Model | Owner | Environment | Duration | Created | Actions |
|---|---|---|---:|---|---|
| ResNet50 | user1 | Cloud | 124s | Oct 2 | View / Delete |

---

## 35. Admin Security

The frontend can show Admin navigation only when:

```text
currentUser.role === ADMIN
```

However:

> This is only UI behavior.

The backend remains responsible for protecting admin endpoints.

Never rely on frontend role checking as the security mechanism.

---

## 36. API Integration

Keep API communication separate from UI components.

Recommended structure:

```text
src/
│
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── experiments.ts
│   ├── dataConfigurations.ts
│   ├── runs.ts
│   ├── artifacts.ts
│   └── admin.ts
│
├── components/
├── pages/
├── layouts/
├── hooks/
├── types/
└── utils/
```

Conceptually:

```text
ExperimentPage
      ↓
useExperiments()
      ↓
experiments.ts
      ↓
API client
      ↓
FastAPI
```

Components should **not** contain lots of raw `fetch()` calls.

---

## 37. Server State

Using a server-state library such as **TanStack Query** is recommended.

Conceptually:

```text
GET /experiments
       ↓
Query
       ↓
Experiment cards
```

After creating an experiment:

```text
POST /experiments
       ↓
Invalidate experiments query
       ↓
Refresh experiment list
```

This avoids manually maintaining multiple copies of server data.

---

## 38. Suggested Frontend Technologies

Suggested stack:

```text
React
TypeScript
React Router
Tailwind CSS
TanStack Query
```

The frontend developer can choose the exact implementation and UI component library, as long as the resulting interface follows the design principles in this document.

---

## 39. Responsive Design

The application should work on:

- Desktop
- Laptop
- Tablet
- Mobile

Desktop is the primary target because this is an ML experiment management tool.

Do not create completely separate mobile pages. Make the same components responsive.

Desktop:

```text
Sidebar | Content
```

Mobile:

```text
Top Navigation
Content
```

---

## 40. Future Feature: Experiment Sharing

**Do not implement this in the first frontend version.**

Planned flow:

```text
Experiment
    ↓
Share
    ↓
Generate share link
    ↓
Copy link
    ↓
Friend opens link
    ↓
Read-only experiment view
    ↓
"Add to My Library"
```

The friend's copy will become an independent experiment.

The original experiment remains owned by the original user.

Backend implementation will come later.

---

## 41. Important UX Principle

The application should communicate **ML concepts**, not database concepts.

Bad:

```text
Create DataConfiguration
```

Better:

```text
Add Dataset Configuration
```

Bad:

```text
Create Metric
```

Better:

```text
Add Metric
```

Bad:

```text
ArtifactCreate
```

Better:

```text
Attach Result
```

Bad:

```text
RunCreate
```

Better:

```text
Record Training Run
```

The backend terminology does not have to dictate the user's experience.

---

## 42. Recommended Development Order

### Phase 1 — Foundation

- [ ] React/TypeScript setup
- [ ] Routing
- [ ] API client
- [ ] Authentication
- [ ] JWT handling
- [ ] Main application layout
- [ ] Protected routes

### Phase 2 — Experiments

- [ ] Home
- [ ] Experiment feed
- [ ] Search/filter
- [ ] Create experiment
- [ ] Experiment details
- [ ] Edit experiment
- [ ] Delete experiment

### Phase 3 — Data

- [ ] Data configuration list
- [ ] Create data configuration
- [ ] Edit data configuration
- [ ] Delete data configuration
- [ ] Preprocessing steps

### Phase 4 — Runs

- [ ] Run list
- [ ] Create run
- [ ] Parameters
- [ ] Metrics
- [ ] Run details
- [ ] Edit run
- [ ] Delete run

### Phase 5 — Artifacts

- [ ] Upload image
- [ ] Add note
- [ ] Artifact display
- [ ] Artifact update
- [ ] Artifact deletion if supported by the backend

### Phase 6 — Admin

- [ ] Admin layout
- [ ] Overview
- [ ] Users
- [ ] Experiments
- [ ] Runs
- [ ] Delete confirmations

### Phase 7 — Polish

- [ ] Loading states
- [ ] Skeletons
- [ ] Empty states
- [ ] Error handling
- [ ] Form validation
- [ ] Toast notifications
- [ ] Responsive design
- [ ] Accessibility
- [ ] Final visual polish

### Phase 8 — Later

- [ ] Experiment sharing
- [ ] Public/shared experiment page
- [ ] Add to library

---

## 43. Definition of Done

The first release should allow a user to perform this entire flow without manually interacting with the API:

```text
Register
   ↓
Login
   ↓
Home
   ↓
Create Experiment
   ↓
Open Experiment
   ↓
Create Data Configuration
   ↓
Add preprocessing steps
   ↓
Create Training Run
   ↓
Add parameters
   ↓
Add metrics
   ↓
Optionally attach artifact
   ↓
View Run
   ↓
Edit Experiment / Run
   ↓
Return to Home
   ↓
See updated experiment
```

Admin flow:

```text
Login
   ↓
Admin Dashboard
   ↓
View overview
   ↓
View users
   ↓
View experiments
   ↓
View runs
   ↓
Delete resources when necessary
```

---

## 44. Most Important Requirements

These are the **non-negotiables**:

1. **Experiment is the central object.**
2. Home should feel like an **experiment library/feed**, not a database table.
3. Don't build one giant form for everything.
4. Experiment → Data Configuration → Run should feel like a natural workflow.
5. Parameters, metrics and artifacts belong to a Run.
6. Artifacts are optional, but if an artifact is created, it must contain an image, a note, or both.
7. Dataset version is optional.
8. Updates must send only fields that actually changed.
9. Always provide loading, error and empty states.
10. Confirm destructive actions.
11. Keep API calls separate from UI components.
12. Backend authorization remains the source of truth.
13. Admin UI is separate from the normal user workspace.
14. Keep the design clean and technical rather than turning it into a generic SaaS dashboard.
15. **Don't implement sharing yet.** It is planned as a later feature.

---

## 45. Backend API Contract

The frontend developer should use the **actual FastAPI OpenAPI/Swagger documentation** as the source of truth for exact request/response fields and endpoint paths rather than manually recreating the backend contract.

Basic resource structure:

```text
Authentication
    ↓
Experiments
    ↓
Data Configurations
    ↓
Preprocessing Steps

Experiments
    ↓
Runs
    ↓
Parameters
    ↓
Metrics
    ↓
Artifacts
```

The backend is already implemented and tested. The frontend's job is primarily to **turn these operations into a coherent user experience**, not to redesign the backend.

---

## 46. Final Development Guidance

Don't try to build the entire frontend in one shot.

Get this flow working first:

```text
Login
  ↓
Home
  ↓
Create Experiment
  ↓
Experiment Details
```

Once that flow feels right, build:

```text
Data Configuration
  ↓
Runs
  ↓
Artifacts
  ↓
Admin
```

Only after the core product is stable should we add sharing and other secondary features.

The goal is to make Xporium feel like a **real ML experiment workspace**, not simply a frontend sitting on top of CRUD endpoints.
