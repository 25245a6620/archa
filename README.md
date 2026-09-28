# ARCHA

Architecture Memory & Decision Agent

## Overview
ARCHA (Architecture Memory & Decision Agent) helps engineering teams understand architectural decisions by retaining not just what the architecture is, but why it became that way. It recovers the organization's historical reasoning, alternatives considered, trade-offs accepted, and lessons learned.

## The Problem It Solves
Engineering organizations store architecture knowledge across many scattered places (ADRs, issues, PRs, etc.). Over time, the rationale for why a decision was made is often lost. ARCHA aims to solve this by acting as a persistent organizational memory system.

## Current Architecture
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript

## Planned Integrations
- **AI Agent**: LLM to reason over historical architectural context.
- **Hindsight**: To retain and recall architecture decisions and act as the core memory layer. 

## Local Setup
1. Clone the repository.
2. Ensure you have Node.js installed.
3. Install dependencies in both `/backend` and `/frontend`.
4. Run `npm run dev` in both directories to start the services.

## Environment Variables
Copy `.env.example` to `.env` in the root directory and fill in the required keys. Do not commit your real `.env` file!

## Current Development Phase
**PHASE 1 — Project Initialization**
