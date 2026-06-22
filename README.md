## Architecture

[Architecture Diagram](docs/system-architecture.png)


# AI Knowledge Assistant

An AI-powered Knowledge Assistant built using Retrieval-Augmented Generation (RAG) that enables users to upload documents, ask natural language questions, retrieve relevant information, and receive grounded answers with citations.

The project simulates an internal enterprise knowledge assistant and demonstrates how modern AI systems combine document ingestion, embeddings, vector databases, retrieval pipelines, and large language models to answer questions accurately.

---

# Project Overview

Organizations often store knowledge across multiple documents, making it difficult for users to find information quickly.

The AI Knowledge Assistant solves this problem by:

* Processing uploaded documents
* Generating embeddings
* Storing knowledge in a vector database
* Retrieving relevant information using hybrid search
* Generating grounded answers using an LLM
* Providing source citations
* Exporting conversations to Word and Excel

---

# Key Features

| Category            | Features                                               |
| ------------------- | ------------------------------------------------------ |
| Document Processing | PDF, DOCX, CSV, Markdown, TXT, JSON support            |
| Retrieval           | Vector Search, BM25 Search, Hybrid Retrieval           |
| Ranking             | Reciprocal Rank Fusion (RRF), Cross-Encoder Re-ranking |
| AI Generation       | Groq Llama 3.3 70B Versatile                           |
| Security            | API Key Authentication, PII Redaction                  |
| Evaluation          | Latency Tracking, Query Logging                        |
| Export              | DOCX Export, Excel Export                              |
| User Interface      | Next.js Chat Interface                                 |

---

# System Architecture

```text
Documents
(PDF, DOCX, CSV, MD)
        │
        ▼
Document Ingestion
        │
        ▼
Text Extraction
        │
        ▼
Cleaning & Normalization
        │
        ▼
Chunking
        │
        ▼
Embedding Generation
        │
        ▼
ChromaDB Vector Store
        │
 ┌──────┴──────┐
 ▼             ▼
Vector Search  BM25 Search
 │             │
 └──────┬──────┘
        ▼
   RRF Fusion
        ▼
Cross Encoder
 Re-ranking
        ▼
 Prompt Builder
        ▼
Groq Llama 3.3
70B Versatile
        ▼
Answer Verification
        ▼
PII Redaction
        ▼
 FastAPI Backend
        ▼
  Next.js Frontend
        ▼
Answer + Citations
  + DOCX / Excel
```

# Technology Stack

| Layer           | Technology                      |
| --------------- | ------------------------------- |
| Frontend        | Next.js, React, TypeScript      |
| Backend         | FastAPI                         |
| LLM             | Groq Llama 3.3 70B Versatile    |
| Embeddings      | Sentence Transformers           |
| Vector Database | ChromaDB                        |
| Retrieval       | BM25                            |
| Re-ranking      | Cross Encoder (MS MARCO MiniLM) |
| Export          | python-docx, openpyxl           |
| Parsing         | PyMuPDF, python-docx, pandas    |
| Security        | API Key Authentication          |
| Logging         | JSON Logs                       |

---

# Project Structure

```text
AI Knowledge Assistant
│
├── client/                     # Next.js Frontend
│
├── server/
│   ├── api/
│   │   └── main.py
│   │
│   ├── core/
│   │   ├── ingest.py
│   │   ├── extractor.py
│   │   ├── cleaner.py
│   │   ├── chunker.py
│   │   ├── embeddings.py
│   │   ├── vector_store.py
│   │   ├── retriever.py
│   │   ├── prompt_builder.py
│   │   ├── generator.py
│   │   ├── rag.py
│   │   ├── evaluator.py
│   │   ├── export_docx.py
│   │   ├── export_excel.py
│   │   └── redactor.py
│   │
│   ├── data/
│   ├── exports/
│   ├── tools/
│   └── requirements.txt
│
└── docs/
    ├── architecture-diagram.png
    └── screenshots/
```

---

# Retrieval Pipeline

The system uses a multi-stage retrieval architecture to improve answer quality.

| Stage           | Description                                            |
| --------------- | ------------------------------------------------------ |
| Vector Search   | Retrieves semantically similar chunks from ChromaDB    |
| BM25 Search     | Retrieves keyword-matching chunks                      |
| RRF Fusion      | Combines Vector Search and BM25 rankings               |
| Re-ranking      | Uses Cross Encoder to rank candidate chunks            |
| Prompt Building | Constructs context-aware prompts                       |
| Generation      | Generates answer using Groq Llama 3.3                  |
| Verification    | Verifies answer against retrieved context              |
| Redaction       | Removes sensitive information before returning results |

---

# API Endpoints

| Endpoint        | Method | Description                     |
| --------------- | ------ | ------------------------------- |
| `/upload`       | POST   | Upload and process documents    |
| `/reindex`      | POST   | Rebuild vector database index   |
| `/search`       | POST   | Search relevant document chunks |
| `/ask`          | POST   | Ask questions to the assistant  |
| `/eval`         | GET    | Retrieve evaluation metrics     |
| `/export/docx`  | POST   | Export conversation to DOCX     |
| `/export/excel` | POST   | Export conversation to Excel    |

---

# Supported Document Formats

| Format   | Supported |
| -------- | --------- |
| PDF      | ✅         |
| DOCX     | ✅         |
| CSV      | ✅         |
| Markdown | ✅         |
| TXT      | ✅         |
| JSON     | ✅         |

---

# Security Features

| Feature                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| API Key Authentication | Secures backend endpoints                         |
| Environment Variables  | Stores secrets securely                           |
| PII Redaction          | Removes emails, phone numbers, and sensitive data |
| Controlled Uploads     | Validates uploaded file types                     |

---

# Evaluation Metrics

The system records and evaluates retrieval performance.

| Metric              | Description                       |
| ------------------- | --------------------------------- |
| Latency             | Response generation time          |
| Retrieved Chunk IDs | Tracks retrieved context          |
| Citations           | Measures citation coverage        |
| Query Logs          | Maintains interaction history     |
| Grounding Quality   | Helps evaluate answer reliability |

---

# Running the Project

## Backend

```bash
cd server
pip install -r requirements.txt
uvicorn api.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

## Frontend

```bash
cd client
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

# Environment Variables

Create a `.env` file inside the `server` directory.

```env
GROQ_API_KEY=your_groq_api_key
API_KEY=your_application_api_key
```

---

# Demo Workflow

1. Upload a document.
2. Click **Re-index Documents**.
3. Ask a question in the chat interface.
4. The system retrieves relevant chunks using Hybrid Retrieval.
5. Groq Llama 3.3 generates a grounded answer.
6. Citations are displayed alongside the response.
7. Export the conversation to DOCX or Excel if required.

---

# Key Design Decisions

## Why Hybrid Retrieval?

Hybrid Retrieval combines semantic understanding from vector search with exact keyword matching from BM25, improving overall retrieval quality.

## Why RRF Fusion?

Reciprocal Rank Fusion combines rankings from multiple retrieval systems without requiring score normalization.

## Why Cross Encoder Re-ranking?

Cross Encoders evaluate the query and document together, improving ranking accuracy compared to embedding similarity alone.

## Why Answer Verification?

A verification step helps reduce hallucinations and improves answer grounding.

## Why ChromaDB?

ChromaDB provides lightweight local vector storage and persistence suitable for small-to-medium RAG systems.

## Why Groq?

Groq provides fast inference for open-source LLMs and enables low-latency response generation.

---

# Learning Outcomes

This project demonstrates practical experience with:

* Retrieval-Augmented Generation (RAG)
* Document Processing Pipelines
* Embedding Models
* Vector Databases
* Hybrid Search Architectures
* Cross Encoder Re-ranking
* FastAPI Development
* Next.js Integration
* LLM Integration
* Evaluation and Monitoring
* Secure AI Application Design

---

# Author

Developed as part of an AI Engineering onboarding project to explore modern Retrieval-Augmented Generation (RAG) architectures and enterprise AI assistant design.
