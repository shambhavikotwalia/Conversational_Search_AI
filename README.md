# Conversational Search AI Platform

A multi-tenant RAG search platform for digital commerce, allowing merchants to turn traditional website search into an AI-powered conversational search engine.

## System Architecture

This project is built using:
- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL + pgvector
- **Frontend:** Next.js, Tailwind CSS (Merchant Dashboard)
- **AI/RAG:** `sentence-transformers` for embeddings, Anthropic Claude 3 for generative synthesis, `pgvector` for retrieval.
- **Widget:** Vanilla JavaScript embeddable widget.

## Directory Structure

- `/backend`: FastAPI application containing auth, ingestion, search, and RAG pipelines.
- `/frontend`: Next.js merchant dashboard.
- `/widget`: Embeddable JavaScript widget for the shopper UI.
- `/data`: Directory to store uploaded datasets.

## Getting Started

1. Copy `.env.example` to `.env` and fill in your `ANTHROPIC_API_KEY`.
2. Run PostgreSQL with `pgvector` (e.g., via Docker).
3. Install backend requirements in a virtual environment (`pip install -r backend/requirements.txt`).
4. Run Alembic migrations: `cd backend && alembic upgrade head`.
5. Start the backend: `cd backend && uvicorn app.main:app --reload`.
6. Start the frontend: `cd frontend && npm run dev`.

## MVP Features Completed
- ✅ Multi-Tenant Isolation & Authentication (JWT, Argon2)
- ✅ Website & API Key Management
- ✅ Background CSV Dataset Ingestion
- ✅ Vector Embeddings (`all-MiniLM-L6-v2`) via pgvector
- ✅ Hybrid Retrieval (L2 Distance Vector Search)
- ✅ RAG Generation with Claude 3 & Grounding Guardrails
- ✅ Search API Endpoints
- ✅ Embeddable JS Widget
