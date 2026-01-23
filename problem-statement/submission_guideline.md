# Submission Guidelines  
BUET CSE FEST Hackathon 2026 – AI / API Preliminary Round

---

## 1. Submission Portal

### 1.1. Fill up the form:

https://docs.google.com/forms/d/1tIptEgoGVJglaO8pe-fOai6CItxjKX-WEJL9ZkCv3CY

### 1.2. Add the following people as collaborators in your repository

```
suhashines
prithu-anan
ImtiazKabir
```

---

## 2. Mandatory Files

Each submission MUST contain:

```
hackathon.yml
backend/.env.example
backend/
checker/
```

### 2.1. Required Project Structure

```
project-root/
├── backend/
│   ├── .env.example     ← REQUIRED
│   ├── (all source code)
│
├── checker/
│   ├── checker.py
│   └── test_cases.json
│
├── hackathon.yml        ← REQUIRED
└── README.md            ← Optional
```

Submissions missing any of these may not be evaluated.

---

## 3. Environment Configuration

You must NOT commit `.env` files.

Instead, provide:

```
backend/.env.example

```

This file lists all environment variables your server needs.

During evaluation, the judge will:

- Copy `.env.example` → `.env`
- Insert official credentials
- Start your server

---

## 4. hackathon.yml File

This file describes how to run your backend.

Location: Repository root

It must include:

- Install commands
- Run commands
- Env file info
- Server address

---

### Required Format

```yaml
version: 1

backend:
  working_dir: backend

  env:
    example_file: .env.example
    output_file: .env

  install:
    - <commands>

  run:
    - <commands>

server:
  base_url: http://localhost:PORT
  health_endpoint: /health
```

---

## 5. How Evaluation Works

Our automated system will:

1. Clone your repository
2. Read hackathon.yml
3. Generate .env from .env.example
4. Inject credentials
5. Run install commands
6. Run run commands
7. Wait for server startup
8. Call /health
9. Run checker

---

## 6. Framework Templates

We provide ready-to-use templates for:

* [Node / Express](../hackathon.yml.templates/hackathon.node.template.yml)
* [Flask / FastAPI](../hackathon.yml.templates/hackathon.python.template.yml)
* [Next.js](../hackathon.yml.templates/hackathon.next.template.yml)
* [TypeScript](../hackathon.yml.templates/hackathon.typescript.template.yml)

Copy and modify the closest one.

---

## 7. Common Mistakes

❌ Missing .env.example
❌ Committing .env
❌ Wrong port
❌ Hardcoded credentials
❌ Server not binding to localhost

These may cause automatic failure.

