# 🚀 Josanz Audiovisuales ERP - Modular SaaS Engine

![Nx Monorepo](https://img.shields.io/badge/Nx-Monorepo-143055?logo=nx&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-17/21-DD0031?logo=angular&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-Modular_Monolith-blueviolet)

Professional Enterprise Resource Planning (ERP) designed for the Audiovisual sector. Re-architected from a rigid monolith into a **High-Performance Modular SaaS** using an Nx Monorepo, featuring strict multi-tenant isolation and a plugin-based frontend shell.

---

## 🏗️ Core Architecture (The V2 Vision)

The system is built on three fundamental pillars of modern software engineering:

### 1. Multi-Tenant Isolation (Data Safety)

We use a **Row Level Security (RLS)** approach implemented via **Prisma 7 Extensions**.

- **Automatic Filtering:** A Proxy-based Prisma service intercepts every CRUD operation. If a `tenantId` is present in the execution context (`ClsService`), it's automatically injected into the `where` clause and `data` payloads.
- **Zero-Leaking Guarantee:** Developers don't need to manually filter by `tenantId`. The infrastructure handles it, preventing accidental cross-tenant data access.

### 2. Angular "Plugin" Shell (UI Modularity)

The frontend is a **Modular Shell** (`@josanz-erp/shared-ui-shell`) that dynamically injects domain features.

- **Glassmorphism Design:** A premium, state-of-the-art UI with blurred surfaces and vibrant gradients.
- **Lazy-Loaded Domains:** Business modules (`budgets`, `inventory`, `billing`) are loaded only when needed, keeping the initial bundle slim.
- **Dynamic Nav:** Navigation items are injected based on the user's tenant configuration.

### 3. Asynchronous Resilience (Outbox Pattern)

Critical and fragile integrations (like **Verifactu AEAT**) follow the **Transactional Outbox Pattern**.

- **The Worker:** Instead of calling external APIs during an HTTP request, we save the event to the DB. A dedicated Node.js **Worker** (`apps/verifactu-worker`) processes the queue with exponential backoff retries.

---

## 🤖 Advanced AI System - Free & Unlimited

The ERP includes a **sophisticated AI assistant ecosystem** with multiple intelligent bots that can operate **completely free** without API limits:

### 🚀 Free AI Providers

- **🐪 Ollama**: Local AI models (Llama2, CodeLlama, Mistral) - 100% free, unlimited
- **🤗 HuggingFace**: Cloud AI with daily limits - free tier available
- **🆓 Free Mode**: Smart predefined responses - always available
- **🔥 Paid APIs**: Gemini, OpenAI, Anthropic - when you need premium quality

### 🎯 Intelligent Bots

- **Stocky-Bot**: Inventory management with predictive analytics
- **Cali-Bot**: Budget optimization and financial forecasting
- **Direct-Bot**: Project coordination and resource planning
- **Social-Bot**: Customer sentiment analysis and relationship management
- **Drive-Bot**: Fleet optimization and maintenance prediction

### 🧠 AI Features

- **Continuous Learning**: Bots adapt to user preferences and patterns
- **Collaborative Intelligence**: Bots can work together on complex tasks
- **Predictive Analytics**: Demand forecasting, churn prediction, ROI analysis
- **Multi-modal Responses**: Text, structured data, recommendations

### ⚡ Quick Setup for Free AI

```bash
# 1. Install Ollama (one-time)
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Download a model
ollama pull llama2

# 3. Start the service
ollama serve

# 4. Configure in app - talk to any bot:
# "configure ollama with url http://localhost:11434 and model llama2"
```

**No API keys required • No usage limits • Complete privacy • Works offline**

---

## 📂 Project Structure

```text
josanz-erp/
├── apps/
│   ├── backend/            # The "Kernel" (NestJS) - Orchestrates domain plugins
│   ├── frontend/           # The "Shell" (Angular) - Premium responsive UI
│   ├── verifactu-worker/   # Background Worker for reliable integrations
│   └── verifactu-api/      # Specialized API for AEAT communications
├── libs/
│   ├── shared/
│   │   ├── data-access/    # Prisma 7 Multi-tenant Service
│   │   ├── ui-shell/       # The Glassmorphism Sidebar & Layout
│   │   └── infrastructure/ # Global Guards, Middlewares & Config
│   ├── budget/             # Domain: Full Budgeting Lifecycle
│   ├── inventory/          # Domain: Stock & Reservations
│   ├── clients/            # Domain: CRM & Customer Management
│   └── ...                 # Other Modular Domains (Billing, Fleet, etc.)
└── .github/workflows/      # Nx Affected CI/CD Pipelines
```

---

## 🛠️ Quick Start (Developer Setup)

### 1. Initial Setup

```bash
npm install
# Ensure you have Docker running
npm run services:up   # Starts Postgres & Redis
```

### 2. Database Sync

```bash
npm run db:reset      # Warning: Clears DB and applies latest SaaS schema
```

### 3. Running Locally

Use the specialized dev scripts:

- **Backend:** `npm run dev:backend`
- **Frontend:** `npm run dev:frontend`
- **Worker:** `npx nx serve verifactu-worker`

---

## 🚢 Deployment & CI/CD

### Master Dockerfile

We use a **Polymorphic Dockerfile** located at the root. You can build ANY application in the monorepo with a single file:

```bash
docker build --build-arg APP_NAME=backend -t josanz-backend .
docker build --build-arg APP_NAME=verifactu-worker -t josanz-worker .
```

### Github Actions (Nx Affected)

Our CI/CD pipeline is **AST-Aware**. It only runs lint, tests, and builds for the projects **impacted** by your changes.

- Push to `main` -> Nx detects which libs changed -> Builds only the affected apps -> Zero wasted time.

---

## 🛡️ Security

- **JWT Authentication:** Stateful or Stateless depending on configuration.
- **TenantGuard:** Global protection that rejects any request without a valid `x-tenant-id` (unless marked as `@PublicTenant`).
- **Audit Logs:** Every destructive action is captured in the `AuditLog` table with a correlation ID.

---

## 📜 Development Roadmap

- [x] Phase 1: Multi-tenant Data Persistence
- [x] Phase 2: Frontend Tokenization
- [x] Phase 3: Backend Decomposition (Modular Monolith)
- [x] Phase 4: Shell Integration, Outbox Worker & CI/CD
- [ ] Phase 5: Federated GraphQL Gateway (Planned)

---

**Developed for Josanz Audiovisuales S.L.** - _Elevating ERP engineering to the next level._
