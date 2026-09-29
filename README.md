# ARCHA — Architecture Memory & Decision Agent

## What is ARCHA?
ARCHA is a specialized AI agent designed to help engineering teams understand architectural decisions by retaining not just what the architecture is, but **why** it became that way. It recovers the organization's historical reasoning, alternatives considered, trade-offs accepted, and lessons learned.

## The Problem It Solves
Engineering organizations naturally lose organizational context as systems evolve and engineers leave. Documentation tells teams *what* exists, but often fails to articulate *why* it was chosen over competing alternatives. ARCHA bridges this gap by acting as an intelligent memory layer to provide immediate context regarding historical engineering decisions.

## Architecture Overview
- **USER** → React Frontend
- **REACT FRONTEND** → Express Backend
- **EXPRESS BACKEND** → ARCHA Agent
- **ARCHA AGENT** → Orchestrates between Hindsight Cloud (memory) and NVIDIA LLM (reasoning)

### Component Roles
- **Hindsight Cloud**: The core organizational memory store. It durably records and geometrically retrieves historical architectural decisions based on context rather than hardcode SQL.
- **NVIDIA LLM (or OpenAI fallback)**: Acts as the reasoning engine to synthesize the Hindsight evidence into easily understandable, conversational answers.
- **ARCHA**: Coordinates intention extraction, evidence retrieval, and presentation layering.

## The "NovaCart" Example
ARCHA is pre-seeded with the fictional **NovaCart** e-commerce platform architecture. NovaCart's evolution—from a monolithic PostgreSQL setup to an event-driven EKS architecture with caching and global CDNs—is completely documented and queryable as the historical baseline for demo purposes.

## Features
- **Ask ARCHA**: Conversational agent that searches organizational memory for architectural reasoning.
- **Memory Inspector**: Direct visibility into exactly what historical evidence Hindsight returned.
- **Architecture Map**: Visual exploration of system architecture and the relationships between components.
- **Timeline Evolution**: A detailed, chronological view of architecture decisions and subsequent trade-offs.

## Technology Stack
- **Frontend**: React, Vite, TypeScript, React Router
- **Backend**: Node.js, Express, TypeScript
- **Memory**: Hindsight (Vectorize)
- **AI**: NVIDIA API (LLaMA3/Mistral models), OpenAI API fallback

## Project Structure
```
ARCHA/
├── backend/          # Express API server + ARCHA Agent + Memory services
├── frontend/         # React UI + Timeline + Map + Ask ARCHA components
├── docs/             # Architecture documentation
├── docker-compose.yml# Container orchestration
└── README.md
```

## Local Setup

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Configuration**
   Copy `.env.example` to `.env` in the root (or `backend` directory depending on your setup) and fill in your keys:
   ```env
   # Hindsight configuration for organizational memory
   HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
   HINDSIGHT_API_KEY=your_key_here
   HINDSIGHT_BANK_ID=archa
   
   # NVIDIA key for agentic reasoning
   NVIDIA_API_KEY=your_key_here
   NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
   NVIDIA_MODEL=meta/llama3-70b-instruct
   ```

4. **Running the Application**
   - **Backend**: `cd backend && npm run dev` (Runs on `http://localhost:3000`)
   - **Frontend**: `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

5. **Seeding the Database (Initial Setup only)**
   Once the backend is running, seed Hindsight with the NovaCart architectural decisions:
   ```bash
   curl -X POST http://localhost:3000/api/decisions/seed
   ```
   *Note: This will safely skip duplicates if already seeded.*

## Demo Flow

The application comes ready for a flawless demonstration of AI organizational memory:

1. Open **Ask ARCHA**.
2. Leave **Memory: ON**.
3. Ask: *"Why did NovaCart choose PostgreSQL?"*
4. ARCHA will pull historical evidence from Hindsight and synthesize an answer explaining the transactional guarantees over MongoDB.
5. Click **View Decision AD-001** to inspect the detailed alternatives, trade-offs, and lessons learned.
6. Click **View on Architecture Map** to explore its relation to Redis and Kubernetes.
7. Return to Ask ARCHA, toggle **Memory: OFF**, and ask the exact same question.
8. ARCHA will gracefully fallback without historical context, showcasing that the agent purely relies on the injected institutional memory.
