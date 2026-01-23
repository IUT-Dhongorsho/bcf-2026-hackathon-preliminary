# BUET CSE FEST Hackathon 2026  
## AI / API Preliminary Round – Starter Repository

Welcome to the official starter repository for the  
**AI / API Preliminary Round** of BUET CSE FEST Hackathon 2026.

This repository contains:

- The complete problem statement
- Database setup files
- External API specifications
- Testing tools
- Submission templates

You are expected to **fork this repository and build your solution inside it**.

---

## Quick Start

Follow these steps **in order**.

### Step 1: Fork This Repository

Click **Fork** on GitHub and create your own copy.

Then clone it:

```bash
git clone <your-fork-url>
cd <repo-name>
```

---

### Step 2: Read the Problem Statement

Go to:

[problem-statement/problem-statement.md](./problem-statement/problem-statement.md)


This file explains everything.

Start here.

---

### Step 3: Choose Your Backend Technology

You may use **any backend framework or language**.

Examples:

* Python (Flask / FastAPI / Django)
* Node.js (Express / NestJS)
* TypeScript
* Any other server framework

All your backend code must go inside:

```
backend/
```

---

### Step 4: Set Up the Database

Choose ONE method:

#### Option A: Using Docker (Recommended)

Follow:

[problem-statement/run-postgres-with-docker.md](./problem-statement/run-postgres-with-docker.md)


#### Option B: Local PostgreSQL

Follow:


[problem-statement/run-postgres-locally.md](./problem-statement/run-postgres-locally.md)

---

### Step 5: Build Your Backend

Inside `backend/`, create your server.

Your server must provide:

* `GET /health`
* `POST /query`

As described in the problem statement.

---

### Step 6: Configure hackathon.yml

Open:

```
hackathon.yml
```

Edit it to match your backend.

Templates are available in:

```
hackathon.yml.templates/
```

Copy the closest template and modify it.

Example:

```bash
cp hackathon.yml.templates/hackathon.python.template.yml hackathon.yml
```

---

### Step 7: Create .env.example

Inside `backend/`, create `.env` from `.env.example`:

```
cp .env.example .env
```

- Now fill up the env vars

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
GEMINI_API_KEY

PORT=8080
```

Do NOT commit `.env` Put it in `.gitingore`.

---

### Step 8: Test Your Server

Start your server using your commands.

Check:

```bash
curl http://localhost:8080/health
```

You should see:

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

### Step 9: Run the Checker

Go to:

```bash
cd checker
python checker.py -b http://localhost:8080
```

Fix errors until tests pass.

---

## 📁 Repository Structure (Important)

```
.
├── backend/              ← Your server code goes here
│
├── checker/              ← Testing scripts
│
├── data/                 ← Database dump
│
├── external-apis/        ← API collections (Bruno)
│
├── hackathon.yml         ← Automation config (REQUIRED)
│
├── hackathon.yml.templates/ ← Ready-made templates
│
├── problem-statement/    ← Full documentation
│
└── README.md             ← You are reading this
```

Do not move or rename these folders.

---

## 📚 Important Documents

| Purpose           | File                                       |
| ----------------- | ------------------------------------------ |
| Main instructions | [problem-statement/problem-statement.md](./problem-statement/problem-statement.md)     |
| Database setup    | problem-statement/run-postgres-*.md        |
| Schema            | [problem-statement/schema-description.md](./problem-statement/schema-description.md)    |
| Submission        | [problem-statement/submission_guideline.md](./problem-statement/submission_guideline.md)  |
| External APIs     | [problem-statement/opeapi-specification.yml](./problem-statement/opeapi-specification.yml) |

---

## 🌐 External APIs

External API definitions are provided in:

```
external-apis/
```

and

```
problem-statement/opeapi-specification.yml
```

Use these for tool selection.

Do NOT use other APIs.

---

## 🧪 Automated Evaluation

Your project will be evaluated automatically.

The judge will:

1. Clone your repository
2. Read `hackathon.yml`
3. Generate `.env`
4. Install dependencies
5. Start your server
6. Call `/health`
7. Run checker

If any step fails, your submission may fail.

---

## 📤 Submission

Read:

```
problem-statement/submission_guideline.md
```

Then submit your GitHub repository link via the Google Form.

---

## ⚠️ Common Mistakes

❌ Writing code outside `backend/`
❌ Missing `hackathon.yml`
❌ Committing `.env`
❌ Wrong server port
❌ Missing `/health` endpoint
❌ Hardcoding answers

Avoid these.

---

## 💡 Tips for Beginners

* Start simple
* First make `/health` work
* Then connect DB
* Then answer 1–2 queries
* Then add LLM
* Then add external APIs

Do not try to do everything at once.

---

## 🤝 Support

If you are confused:

1. Re-read the problem statement
2. Check example templates
3. Ask mentors during workshops

We are here to help you learn.

---

Good luck, and happy hacking!

```

---
