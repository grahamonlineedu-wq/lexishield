# LexiShield 

[![npm version](https://img.shields.io/npm/v/lexishield.svg)](https://www.npmjs.com/package/lexishield)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/grahamonlineedu-wq/lexishield/actions/workflows/node.yml/badge.svg)](https://github.com/grahamonlineedu-wq/lexishield/actions)

**AI-powered contract risk analysis API using Groq.** Secure-by-default Express app for legal document review.

LexiShield is a learning-oriented project that demonstrates production patterns for a SaaS app processing sensitive documents. It analyzes contracts for risk, unclear clauses, and compliance issues using Groq LLMs.

## Features
- Express API with security headers, rate limiting, and JSON limits
- `/api/v1/analyze` endpoint for document risk scoring
- Startup database init for Neon PostgreSQL
- Health check endpoint `/health` for deployments
- Fincra payment integration for SaaS billing
- Example Jest tests for API security

## Install

```bash
npm install lexishield
