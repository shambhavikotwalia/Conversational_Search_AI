# HIGH-LEVEL DESIGN (HLD)
## Conversational Search AI Platform

**Version:** MVP v1  
**Document Type:** High-Level Design  
**Product:** Conversational Search AI API + Website Widget  
**Primary Architecture:** Multi-tenant SaaS + RAG  
**Status:** Proposed

---

# 1. System Objective

Build a plug-and-play **Conversational Search AI platform** that allows any digital commerce business to replace or augment traditional fuzzy/keyword search with natural-language conversational search.

The platform should work for:

- E-commerce websites
- Q-commerce platforms
- D2C brand websites
- Marketplace storefronts
- Any website with a product/catalogue dataset

Example:

> User searches: "I need a comfortable summer dress for a petite woman that isn't too tight."

Instead of matching only keywords such as `summer`, `dress`, `petite`, the system understands the **intent and attributes**, retrieves relevant product/review evidence, and generates a grounded conversational response.

The system is therefore **not an e-commerce application itself**.

It is an **AI search infrastructure layer that plugs into an existing commerce experience**.

---

# 2. Product Architecture

The platform has two major surfaces.

### A. Merchant/Admin Platform

Used by businesses to:

- Create an account
- Login
- Create/manage an organization
- Add websites
- Upload product/catalogue data
- Configure search
- Generate API credentials
- Monitor queries
- View search analytics
- Manage usage

### B. Shopper Experience

Embedded into the merchant's website through:

- JavaScript widget
- REST API
- SDK/API integration

The shopper does **not** need to create an account.

---

# 3. High-Level Architecture

```text
                         ┌─────────────────────────┐
                         │     Merchant Admin       │
                         │  Login / Dashboard      │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      API Gateway        │
                         │ Auth / Rate Limit /     │
                         │ Tenant Resolution       │
                         └────────────┬────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     │                │                │
                     ▼                ▼                ▼
              ┌───────────┐    ┌─────────────┐   ┌──────────────┐
              │ Auth      │    │ Catalog     │   │ Analytics    │
              │ Service   │    │ Service     │   │ Service      │
              └───────────┘    └──────┬──────┘   └──────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Data Ingestion│
                              │ & Processing  │
                              └──────┬────────┘
                                     │
                     ┌───────────────┼────────────────┐
                     ▼               ▼                ▼
               ┌──────────┐   ┌────────────┐   ┌─────────────┐
               │PostgreSQL│   │ Vector DB  │   │ Object      │
               │ Metadata │   │ Embeddings │   │ Storage     │
               └──────────┘   └────────────┘   └─────────────┘


 Shopper Website
       │
       ▼
┌──────────────────────┐
│ Conversational       │
│ Search Widget / SDK   │
└──────────┬───────────┘
           │
           ▼
     ┌─────────────┐
     │ API Gateway │
     └──────┬──────┘
            │
            ▼
    ┌─────────────────┐
    │ Search Orchestr.│
    └────────┬────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
┌─────────────┐ ┌──────────────┐
│ Query       │ │ Conversation │
│ Understanding│ │ Context      │
└──────┬──────┘ └──────┬───────┘
       │               │
       └───────┬───────┘
               ▼
       ┌─────────────────┐
       │ Retrieval Layer │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Vector Search   │
       │ + Metadata      │
       │ Filtering       │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Reranker        │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ RAG Generator   │
       │ Claude LLM      │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Guardrails +    │
       │ Confidence      │
       └────────┬────────┘
                │
                ▼
       Conversational Response
```

---

# 4. Core RAG Architecture

The RAG pipeline is:

```text
User Query
     ↓
Query Validation
     ↓
Intent / Query Understanding
     ↓
Query Embedding
     ↓
Hybrid Retrieval
     ├── Semantic Retrieval
     └── Metadata / Keyword Filtering
     ↓
Top-K Candidate Reviews / Products
     ↓
Reranking
     ↓
Evidence Selection
     ↓
LLM Synthesis
     ↓
Grounding / Safety Validation
     ↓
Confidence Score
     ↓
Response
```

The initial reference architecture uses embeddings, vector search, optional LLM reranking and Claude-based grounded synthesis.

---

# 5. Why Hybrid Retrieval

Pure fuzzy search is insufficient.

Pure semantic search is also insufficient.

The production architecture should support:

### Semantic Search

Understands:

> "something comfortable for hot weather"

and retrieves reviews discussing:

> breathable, lightweight, comfortable, summer, etc.

### Keyword / Metadata Search

Handles exact requirements:

- Black
- Dress
- Petite
- Tops
- Rating > 4
- Category
- Price range

### Final Retrieval

```text
Semantic Score
      +
Keyword Score
      +
Metadata Match
      +
Business Ranking
      ↓
Final Candidate Score
```

---

# 6. Dataset Architecture — MVP

The actual MVP dataset is the uploaded **Women's Clothing E-Commerce Reviews** dataset.

Key fields:

```text
Clothing ID
Age
Title
Review Text
Rating
Recommended IND
Positive Feedback Count
Division Name
Department Name
Class Name
```

The dataset contains approximately:

- 23.5K reviews
- 1.2K unique products
- 20 product classes
- 6 departments
- 3 divisions

The dataset should be treated as **review/evidence data**, not as the final production catalogue model.

---

# 7. Data Model Concept

Separate:

```text
Merchant
   ↓
Website
   ↓
Product
   ↓
Review
   ↓
Review Embedding
```

This is important because future merchants will provide their own product catalogue and review data.

---

# 8. Multi-Tenant Architecture

Every merchant is a tenant.

Example:

```text
Tenant A
 ├── Website A
 ├── Products
 ├── Reviews
 ├── Embeddings
 ├── API Keys
 └── Analytics

Tenant B
 ├── Website B
 ├── Products
 ├── Reviews
 ├── Embeddings
 ├── API Keys
 └── Analytics
```

Every request must resolve:

```text
tenant_id
website_id
```

before accessing product/review/vector data.

**Tenant isolation is mandatory.**

No query belonging to Tenant A should ever retrieve evidence from Tenant B.

---

# 9. Authentication Architecture

## Merchant Login

Recommended:

```text
Email + Password
       OR
Google / OIDC
       ↓
Authentication Service
       ↓
Access Token
       +
Refresh Token
```

Passwords should never be stored in plaintext.

Use:

- Argon2id password hashing
- Short-lived access tokens
- Rotating refresh tokens
- Secure HTTP-only cookies for dashboard sessions
- MFA later for enterprise

---

# 10. Website Authentication

The shopper should not authenticate.

Instead, every merchant website receives a:

```text
PUBLIC_SITE_KEY
```

Example:

```text
<script
  src="https://cdn.conversational-search.ai/widget.js"
  data-site-key="site_public_xxx">
</script>
```

The public key identifies the merchant website.

Sensitive API secrets must **never** be exposed in frontend JavaScript.

For server-to-server API access:

```text
X-API-Key: secret_xxx
```

---

# 11. Search Request Flow

```text
Shopper
   ↓
Website Widget
   ↓
POST /v1/search
   ↓
API Gateway
   ↓
Validate Site Key
   ↓
Resolve Tenant
   ↓
Query Orchestrator
   ↓
Retrieve Candidates
   ↓
Rerank
   ↓
Generate Answer
   ↓
Validate Grounding
   ↓
Return Response
```

---

# 12. Response Design

The response should contain structured information.

```json
{
  "query": "comfortable dress for summer",
  "answer": "Customers frequently describe these dresses as lightweight and comfortable for warmer weather.",
  "confidence": 0.87,
  "products": [],
  "citations": [],
  "request_id": "req_123",
  "latency_ms": 1840
}
```

The API should never return only an unstructured LLM string.

---

# 13. Conversation Architecture

The system should support multi-turn conversations.

Example:

```text
User:
Show me comfortable dresses.

AI:
Here are some dresses customers describe as comfortable.

User:
Only ones suitable for summer.

AI:
Based on customer feedback, these options have stronger
mentions of lightweight/breathable comfort.
```

Conversation state:

```text
conversation_id
      ↓
previous user intent
      +
previous filters
      +
current query
      ↓
rewritten search query
```

Conversation memory should be scoped to the merchant/site/session.

---

# 14. Performance Targets

Primary target:

**P95 < 3 seconds**

Target breakdown:

```text
API validation       <100ms
Query processing     <200ms
Embedding            <300ms
Retrieval            <300ms
Reranking            <500ms
LLM generation       <1.5s
Validation           <200ms
--------------------------------
Target               <3 seconds
```

The original system target is also <3 seconds.

---

# 15. Reliability

Production APIs should target:

- 99.9%+ availability
- Timeouts
- Retries with exponential backoff
- Circuit breakers for LLM dependency
- Rate limiting
- Request IDs
- Structured logging
- Health checks
- Graceful degradation

If the LLM is unavailable:

```text
LLM unavailable
      ↓
Return traditional search results
OR
Return retrieved products with:
"AI summary temporarily unavailable."
```

The search experience should not completely disappear because the LLM failed.

---

# 16. Security

Mandatory:

- HTTPS everywhere
- JWT/OIDC authentication
- Argon2id password hashing
- API-key rotation
- Secret management
- Tenant isolation
- Rate limiting
- Input validation
- Prompt injection protection
- Output validation
- PII minimization
- Audit logs
- CORS configuration
- SQL injection protection
- Dependency scanning

---

# 17. Observability

Every search request should generate:

```text
request_id
tenant_id
website_id
session_id
query
retrieval_count
retrieval_latency
reranking_latency
LLM_latency
total_latency
token_usage
model
confidence
error
```

Never log sensitive user information unnecessarily.

---

# 18. Deployment Architecture

### MVP

```text
Frontend
   ↓
FastAPI
   ↓
SQLite/PostgreSQL
   +
NumPy Vector Search
   +
Local Embedding Model
   +
Claude API
```

### Production

```text
CDN
 ↓
Load Balancer
 ↓
API Gateway
 ↓
FastAPI Services
 ↓
PostgreSQL
 ↓
Vector Database
 ↓
Embedding Service
 ↓
LLM Provider
```

Containerization:

```text
Docker
   ↓
Cloud deployment
```

---

# 19. MVP vs Production

| Component | MVP | Production |
|---|---|---|
| Database | SQLite | PostgreSQL |
| Vector Search | NumPy cosine similarity | Vector DB |
| Embeddings | MiniLM | Dedicated embedding service |
| Reranking | Optional | Dedicated reranker |
| LLM | Claude | Model abstraction layer |
| Auth | Basic auth | OAuth/OIDC + MFA |
| Widget | Basic JS | Versioned SDK |
| Analytics | Basic logs | Event pipeline |
| Deployment | Docker | Container orchestration |
| Scaling | Single instance | Horizontally scalable |

The original guide explicitly recommends NumPy/cosine similarity for MVP and Pinecone/Elasticsearch for production.