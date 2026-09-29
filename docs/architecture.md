# ARCHA Architecture

ARCHA (Architecture Memory & Decision Agent) implements a specialized, multi-tier architecture to securely and effectively retrieve context-aware architectural knowledge. The system acts as a specialized orchestrator rather than a general-purpose AI.

## Flow Diagram

```
USER
  ↓ (HTTP / React Router)
REACT FRONTEND
  ↓ (REST API)
EXPRESS BACKEND
  ↓ (Controller / Service Layer)
ARCHA AGENT
  ↓ (Parallel Orchestration)
HINDSIGHT + NVIDIA LLM
```

## Core Distinctions

ARCHA leverages specialized components for memory and reasoning to prevent AI hallucinations and provide explicit sources for all technical context.

### Hindsight
**Persistent organizational memory.**
Hindsight serves as the long-term context engine. It records, segments, and retrieves past architectural decisions, trade-offs, and outcomes organically. It is the source of truth for *why* an organization operates the way it does.

### NVIDIA LLM
**Reasoning and response generation.**
The NVIDIA LLM (or fallback OpenAI LLM) acts strictly as a reasoning engine. It does not pull organizational knowledge from its own pre-trained weights; instead, it synthesizes the retrieved semantic evidence from Hindsight and formulates a coherent, professional response based solely on the provided context.

### ARCHA
**Decision-aware orchestration and evidence presentation.**
ARCHA acts as the intermediary. Its primary responsibility is not to generate text, but to coordinate the flow of information. It parses the intent, fetches the relevant evidence from Hindsight, invokes the LLM for synthesis, and finally ties the LLM's response back to the specific `decisionId` references for a traceable, UI-level evidence presentation.
