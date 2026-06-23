### BUET CSE FEST Hackathon 2026 – Implementation Plan

### Project Overview

We are building a **Natural Language → SQL + External API** backend.  
The system accepts plain‑English questions, decides whether to query the database, call an external API, or both, and returns standardized JSON.

**Key Constraints:**

*   Database schema may change during evaluation – no hardcoding.
*   Must support `gemini-2.5-flash` (the checker uses it).
*   Response format must match the spec exactly.
*   External APIs: currency conversion, geocoding.

* * *

### 👥 Team Division (3 People)

Person

Focus

Files

**A – LLM & SQL**

Prompt engineering, SQL generation, response formatting

`gemini.ts`, `formatter.ts`, `queryController.ts` (lead)

**B – Database**

PostgreSQL setup, schema loading, SQL execution, safety

`database.ts`, `executor.ts`, `sqlSanitizer.ts`

**C – External APIs**

Currency, geocoding, intent detection (external vs mixed)

`currency.ts`, `geocode.ts`, `queryController.ts` (support)

* * *

### 🧱 Phase 0 – Setup (0–2 hours)

### Everyone:

1.  Clone the repository.
2.  Install dependencies:
    
    bash
    
        cd backend
        pnpm init
        pnpm add express cors dotenv pg axios @google/generative-ai
        pnpm add -D typescript @types/node @types/express @types/cors nodemon tsx
        
    
    Use code with caution.
    
3.  Copy `.env.example` to `.env` and fill in:
    *   `DATABASE_URL`
    *   `GEMINI_API_KEY`
    *   `EXCHANGE_RATE_API_KEY` (or use free exchangerate-api.com)
    *   `PORT=8005`

### Person B:

1.  Download the provided `generated_data.sql`.
2.  Set up PostgreSQL (local or Docker) and load the data.
3.  Test connection and confirm schema is visible.

* * *

### 🧪 Phase 1 – Health Check & Barebones Server (1 hour)

### Person B (lead):

Create the foundational server structure in TypeScript:

typescript

    // config/database.ts – export a connection pool
    // routes/health.routes.ts – GET /health → { status: "ok", database: "connected" }
    // app.ts – mount routes, start server
    

Use code with caution.

**Test:**

bash

    curl http://localhost:8005/health
    # → {"status":"ok","database":"connected"}
    

Use code with caution.

* * *

### 🗄️ Phase 2 – Database Executor (2 hours)

### Person B:

typescript

    // services/database/executor.ts
    export async function executeSQL(sql: string) {
      // 1. Sanitize: only SELECT, no DROP/UPDATE/DELETE/ALTER
      // 2. Execute query
      // 3. Return { rows, columns }
    }
    

Use code with caution.

Person B also writes:

typescript

    // utils/sqlSanitizer.ts
    export function isReadOnly(sql: string): boolean { ... }
    

Use code with caution.

**Test:** Hardcode a simple SQL (`SELECT * FROM employees LIMIT 5`) and verify rows + columns are returned properly.

* * *

### 🤖 Phase 3 – LLM → SQL (3 hours)

### Person A:

typescript

    // services/llm/gemini.ts
    export async function generateSQL(question: string): Promise<string> {
      // 1. Fetch schema dynamically from database (Person B provides a helper)
      // 2. Build prompt: "Given this schema: ... generate SQL for: ..."
      // 3. Call Gemini 2.5 Flash
      // 4. Extract SQL from response (remove markdown)
      // 5. Return clean SQL
    }
    

Use code with caution.

**Prompt Strategy:**

*   Include table names, column names, and foreign keys dynamically.
*   Ask Gemini to output only SQL, with no explanation or extra text.
*   Provide examples for scalar, record, and table queries.

**Test:** Ask “Total money received from customers from paid invoices issued in the last 30 days.” → should produce a functional SQL statement.

* * *

### 🔗 Phase 4 – Query Controller (4 hours)

### Person A (lead) with Person C support:

typescript

    // controllers/queryController.ts
    export async function handleQuery(req, res) {
      const { question, llm } = req.body;
    
      // 1. Decide if external-only, db-only, or mixed (Person C helps)
      const intent = detectIntent(question);
    
      let result;
      if (intent === 'external') {
        result = await handleExternal(question);
      } else if (intent === 'mixed') {
        const dbResult = await dbQuery(question);
        result = await convertWithExternal(dbResult, question);
      } else {
        const sql = await generateSQL(question);
        result = await executeSQL(sql);
      }
    
      // 2. Format response (scalar/record/table)
      const response = formatResponse(question, llm, result);
      res.json(response);
    }
    

Use code with caution.

* * *

### 🌐 Phase 5 – External APIs (2 hours)

### Person C:

typescript

    // services/external/currency.ts
    export async function convertCurrency(amount: number, from: string, to: string) {
      // Call exchangerate-api.com or similar
      // Return converted amount
    }
    
    // services/external/geocode.ts
    export async function geocode(city: string) {
      // Return { lat, lon }
    }
    

Use code with caution.

**Test:**

*   “Convert 1000 USD to EUR” → should return a scalar.
*   “Latitude and longitude of Dhaka” → should return a record.

* * *

### 🧩 Phase 6 – Mixed Mode (2 hours)

### Person C & A:

Detect that a question asks for a database value combined with an external service processing.

*Example:* “Which customer has paid us the most, and how much is that in EUR?”

**Steps:**

1.  DB query → get `customer_name` and `total_paid_usd`
2.  Call currency converter → `total_paid_usd` \* rate
3.  Return `{ customer_name, total_paid_eur }`

**Response format:** `result_type: "record"` or `"table"`, with `meta.source: "mixed"`.

* * *

### 🧪 Phase 7 – Full Checker Test (2 hours)

Download `checker.py` and `test_cases.json` from the provided links.

**Run:**

bash

    python checker.py -b http://localhost:8005
    

Use code with caution.

**Fix any failures:**

*   Wrong `result_type`
*   Numeric precision differences (use `toFixed(2)` for money values)
*   Missing columns or extra fields
*   SQL errors (Person A iterates prompts)
*   External API failures (Person C adds retry logic)

* * *

### 🧹 Phase 8 – Polish & Deployment (1 hour)

*   Add proper error handling (all routes must return valid JSON errors, never raw HTML).
*   Add retry logic for external APIs (3 attempts with exponential backoff).
*   Ensure `/health` is always accessible.
*   Write a short `README.md` with setup instructions.

* * *

### ⚠️ Critical Pitfalls to Avoid

Pitfall

Solution

**Hardcoding schema**

Always fetch schema dynamically using Person B's `getSchema()` helper.

**SQL injection**

Only allow `SELECT` statements. Reject any query containing `DROP`, `DELETE`, `UPDATE`, `ALTER`, or `INSERT`.

**Wrong response format**

Enforce formatting using a single centralized `formatResponse()` helper utility.

**Missing LLM support**

Accept `gemini-2.5-flash` as the default engine since the grading checker uses it.

**External API limits**

Use free tiers allowing at least 100 daily requests. Cache responses for 5 minutes.

* * *

### ✅ Success Criteria

*   `/health` successfully returns `{ status: "ok", database: "connected" }`.
*   All official test cases pass (25 DB + 3 external + 2 mixed).
*   Hidden test cases pass (evaluated against a different schema layout within the same business domain).
*   Response JSON structures match the requirements exactly (`result_type`, `columns`, `rows`, `meta`).
*   `meta.source` accurately reflects `external` or `mixed` states.

* * *

### 📚 Reference

*   **Gemini SDK**: `@google/generative-ai`
*   **PostgreSQL driver**: `pg`
*   **Currency API**: Free baseline endpoint from exchangerate-api
*   **Geocoding**: Nominatim (OpenStreetMap)