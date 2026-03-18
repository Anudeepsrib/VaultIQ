<div align="center">
  <img src="public/logo.png" alt="VaultIQ Logo" width="180" />
  <h1>VaultIQ</h1>
  <p><strong>Privacy-first, RBAC-enforced financial document intelligence platform</strong></p>
  <p>Financial Intelligence. Stays Here.</p>
</div>

---

## Overview

VaultIQ is a secure financial document processing platform built for enterprise environments. It extracts structured data from financial documents (10-Ks, 10-Qs, earnings reports, etc.) using AI models, provides RAG-powered querying capabilities, and maintains comprehensive audit trails for compliance.

## Architecture

This repository contains both the **Backend API** (FastAPI) and **Frontend Application** (Next.js 14).

```
VaultIQ/
├── vaultiq/              # Backend (FastAPI + ChromaDB + Ollama)
└── app/                  # Frontend (Next.js 14 + TypeScript)
    ├── (auth)/           # Login routes
    ├── (dashboard)/      # Protected dashboard
    ├── api/              # Next.js API routes
    └── ...
```

## Features

- **Document Intelligence**: Upload and process financial documents with AI-powered extraction
- **RAG Query Interface**: Ask questions across your document corpus with semantic search
- **Benchmark Suite**: Compare LLM extraction performance with built-in evaluation tools
- **RBAC Security**: Role-based access control (Admin, Analyst, Auditor, Viewer)
- **Audit Logging**: Complete activity tracking for compliance requirements
- **Privacy First**: PII detection and data classification built-in

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with CSS variables
- **UI Components**: shadcn/ui + Radix UI primitives
- **State Management**: Zustand + TanStack Query v5
- **Forms**: React Hook Form + Zod validation
- **Charts**: Tremor
- **Notifications**: Sonner
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: SQLAlchemy + Alembic (SQLite/PostgreSQL)
- **Vector Store**: ChromaDB
- **LLM Engine**: Ollama
- **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd vaultiq

# Set up virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/v1
API_BASE_URL=http://localhost:8000/v1

# Backend
DATABASE_URL=sqlite:///./vaultiq.db
JWT_SECRET=your-jwt-secret-here
OLLAMA_BASE_URL=http://localhost:11434
```

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access including user management |
| **Analyst** | Upload documents, run extractions, query RAG |
| **Auditor** | Read-only access + audit log view |
| **Viewer** | Read-only document access |

## Frontend Structure

```
app/
├── (auth)/login/       # Authentication page
├── (dashboard)/
│   ├── documents/      # Document library & upload
│   ├── documents/[id]/ # Document detail with extraction results
│   ├── query/          # RAG query interface
│   ├── benchmarks/     # Model benchmarking
│   ├── audit/          # Audit log
│   ├── settings/       # Profile settings
│   └── settings/users/ # User management
├── layout.tsx          # Root layout with providers
└── globals.css         # Global styles + CSS variables

components/
├── auth/               # Login form
├── documents/          # Upload zone, table, status badges
├── layout/             # Sidebar, Topbar, PageHeader
├── query/              # Query input, history panel
└── ui/                 # shadcn/ui components

lib/
├── api/                # API client functions
├── hooks/              # TanStack Query hooks
├── stores/             # Zustand auth & query stores
├── types/              # TypeScript interfaces
└── utils/              # Formatters, permissions, cn
```

## Document Types Supported

- 10-K / 10-Q (SEC filings)
- Earnings Reports
- Offering Memorandums
- Financial Statements
- Custom document types via schema configuration

## Security Features

- JWT authentication with httpOnly cookies
- Role-based access control (RBAC) middleware
- Automatic silent token refresh
- PII detection in uploaded documents
- Comprehensive audit logging
- CSRF protection

## Development

### Running Frontend Tests

```bash
npm test
```

### Running Backend Tests

```bash
cd vaultiq
pytest
```

### Building for Production

```bash
# Frontend
npm run build

# Backend (with Docker)
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Support

For support, email support@vaultiq.internal or contact your system administrator.

---

<div align="center">
  <p>Built with security and privacy in mind.</p>
</div>
