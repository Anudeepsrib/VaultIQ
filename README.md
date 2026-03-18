# VaultIQ

VaultIQ is a production-grade, RBAC-enforced financial document intelligence platform.

## Overview

VaultIQ provides a secure, reliable, and scalable foundation for processing, analyzing, and querying financial documents. It leverages modern technologies like FastAPI, ChromaDB, and local LLMs (via Ollama) to extract intelligence from complex documents while strictly enforcing Role-Based Access Control (RBAC) and maintaining comprehensive audit logs.

## Features

- **Robust Authentication & Authorization**: JWT-based authentication with bcrypt password hashing and strict RBAC (Admin, Analyst, Auditor, Viewer roles).
- **Comprehensive Audit Logging**: Append-only audit logs enforced at the database level to track all sensitive actions.
- **Secure by Default**: Global exception handling, structured logging, and rate limiting to prevent abuse and ensure system stability.
- **Document Processing Pipeline** (Upcoming): Ingestion and parsing of PDFs and DOCX files using PyMuPDF and pdfplumber.
- **Semantic Search & LLM Integration** (Upcoming): Vector embeddings with ChromaDB and local LLM integration using Ollama for deep document understanding and Q&A.

## Technology Stack

- **Backend**: FastAPI, Python 3.11
- **Database**: SQLAlchemy, Alembic (Migrations), SQLite/PostgreSQL
- **Vector Store**: ChromaDB
- **LLM Engine**: Ollama
- **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (optional, for fully containerized deployment)

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anudeepsrib/VaultIQ.git
   cd VaultIQ/vaultiq
   ```

2. **Set up a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configuration**:
   Copy the example environment file and adjust values as needed.
   ```bash
   cp .env.example .env
   ```

5. **Run Migrations**:
   Run database migrations to initialize the schema.
   ```bash
   alembic upgrade head
   ```

6. **Start the Application**:
   Start the FastAPI development server.
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`. You can access the automatic interactive API documentation at `http://localhost:8000/docs`.

### Running Tests

To run the automated tests using pytest:

```bash
pytest
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
