# BUET CSE FEST HACKATHON 2026

## Preliminary Round – AI / API

## Overview

This document contains all the information required to participate in the
AI / API Preliminary Round.

Please read the relevant sections carefully.

### Quick Navigation

1. Problem Description  
   → [Section 1: Problem Overview](#1-problem-overview)

2. Database Setup  
   → [Section 2: Database Setup](#2-database-setup)

3. API Requirements  
   → [Section 3: API Requirements](#3-api-requirements)

4. Response Format  
   → [Section 4: Standardized Response Format](#4-standardized-response-format)

5. Test Questions  
   → [Section 5: Test Questions](#5-test-questions)

6. External API Integration  
   → [Section 6: External-API-Based-Questions](#6-external-api-based-questions)

7. Testing & Verification  
   → [Section 7: How Test Cases Are Provided](#7-how-test-cases-are-provided)  
   → [Section 8: Official Python Checker](#8-official-python-checker)

<!-- 8. Evaluation Criteria  
   → [Section 9: Evaluation Criteria](#9-evaluation-criteria) -->

8. Submission Instructions  
   → [Submission Guidelines](./submission_guideline.md)

9. ### [Don't get overwhelmed, **CLICK HERE**](../README.md/#quick-start)


---

# ConversationalDB: Natural Language Query Engine

## 1. Problem Overview

Suhas, Imitaz, and Prithu work together at a small product team building tools for non-technical users. One rainy afternoon they receive a challenge: the analytics team has a large, deterministic PostgreSQL database full of HR, Sales, Finance, and Payroll data, but the stakeholders only know how to ask questions in plain English.

Suhas proposes a conversational interface so anyone can ask "How much did we earn last month?" Imitaz worries about reliability — SQL must be precise and reproducible across similar databases. Prithu suggests using an LLM to draft SQL, then run it and return a clear, machine-friendly result that the frontend and automated judges can evaluate.

Their mission becomes this: build a backend API that
1. Accepts a **natural language question** about the database,
2. Uses a **specified LLM** to generate SQL,
3. Executes that SQL on the **provided database**,
4. Returns the final answer in a **standardized response format** so both humans and automated checkers (like the one used in this contest) can verify

<!-- The difficulty is **not database setup**, but:

* Correct SQL generation
* Handling joins, grouping, ordering
* Returning results in a **frontend-friendly and judge-friendly format** -->

---

## 2. Database Setup

You are provided with the following files:

* [generated_data.sql](../data/generated_data.sql)
* Optional [docker-compose.yml](../docker-compose.yml) (Postgres + pgweb)

For loading the above `generated-data.sql` in your database you may follow either of the approaches:

* Run PostgreSQL locally
[How to run postgres locally and load data](./run-postgres-locally.md)
* Or use Docker
[How to run postgres with docker and load data](./run-postgres-with-docker.md)
* Use any postgres client (PgAdmin, Dbeaver)

The schema includes:

* Employees, Departments, Roles
* Customers, Products, Orders, Invoices
* Payroll runs and payroll items

[Find the full schema description here](./schema-description.md)

---

## 3. API Requirements

### 3.1 Required Endpoints

#### **A. Health Check**

```
GET /health
```

**Response**

```json
{
  "status": "ok",
  "database": "connected"
}
```

This endpoint is checked **before any test cases run**.

---

#### **B. Query Endpoint**

```
POST /query
```

**Request Body**

```json
{
  "question": "Which customer has paid us the most money so far?",
  "llm": "gemini-2.5-flash"
}
```

* `question` → natural language query
* `llm` → one of:

  * `gemini-2.5-flash`
  * `gemini-3.0-flash`

> The LLM string will be passed **exactly** as shown.

> **Important:** The automated checker used for evaluation will call your API using
> `gemini-2.5-flash`. Your server **must** accept and correctly handle requests
> where `"llm": "gemini-2.5-flash"`. Supporting other models (e.g. `gemini-3.0-flash`,`gpt-4o-mini`)
> is optional and may be useful for development, but is not a substitute for
> handling `gemini-2.5-flash` during automated checks.

### **3.2 LLM Usage & Database-Agnostic Constraint**

> **Important Design Constraint**

Participants **must not assume** that the database schema will always be identical to the provided one, nor that the full schema can be blindly pasted into the LLM prompt.

Your implementation **must be database-agnostic** in the following sense:

* During **hidden evaluation**, the judging system **may connect your server to a different database**
* The database will:

  * Represent the *same business domain* (employees, customers, invoices, etc.)
  * Contain *similar relationships*
  * **Not necessarily have identical table names, column names, or ordering**
* PostgreSQL will still be used during evaluation, but:

  * Vendor-specific SQL features are **not required**
  * Pure SQL generation (without ORM) is acceptable

#### What is **not allowed**

* Hardcoding table names, column lists, or SQL queries per question
* Mapping questions directly to pre-written SQL templates

> The goal is to evaluate **natural language → database reasoning**,
> not memorization of a fixed schema.

Failure to follow this constraint may result in:

* Passing visible test cases
* Failing hidden test cases


---

## 4. Standardized Response Format

Because answers vary wildly (single numbers, single strings, tables), **all responses must follow this structure**:

```json
{
  "question": "<echoed question>",
  "llm": "<llm used>",
  "result_type": "scalar | record | table",
  "columns": ["col1", "col2"],
  "rows": [
    [value1, value2],
    [value1, value2]
  ],
  "meta": {
    "row_count": 2
  }
}
```

### 4.1 Result Types

| Type          | Meaning         | Example         |
| ------------- | --------------- | --------------- |
| `scalar`      | Single value    | total revenue   |
| `record`      | One row         | best customer   |
| `table`       | Multiple rows   | top customers   |

### 4.2 Examples

#### Scalar

```json
{
  "result_type": "scalar",
  "columns": ["money_still_due"],
  "rows": [[155973.70]],
  "meta": { "row_count": 1 }
}
```

#### Record

```json
{
  "result_type": "record",
  "columns": ["customer_name","customer_email"],
  "rows": [["Acme Inc","contact@acmeinc.com"]],
  "meta": { "row_count": 1 }
}
```

#### Table

```json
{
  "result_type": "table",
  "columns": ["customer_id", "name", "total_paid"],
  "rows": [
    [9, "Acme Inc", 59504.44],
    [10, "Horizon Technologies", 29886.53]
  ],
  "meta": { "row_count": 2 }
}
```

---

## 5. Test Questions

Below are the **official test questions** you must answer.

### Simple Queries (Scalar / Record)

1. **“Total money received from customers from paid invoices issued in the last 30 days.”**
2. **“Total outstanding invoice amount from unpaid or partially paid invoices.”**
3. **“Customer with the highest total paid invoice amount (descending).”**
4. **“Invoice that is overdue by the largest number of days; if tied, higher amount first.”**
5. **“Total number of invoices that are overdue today.”**
6. **“Customer with the highest total outstanding invoice amount.”**
7. **“Employee who created the highest number of sales orders.”**
8. **“Employee whose created orders resulted in the highest total invoiced amount.”**
9. **“Manager whose direct reports generated the highest total invoiced amount.”**
10. **“Department whose employees generated the highest total invoiced amount.”**
11. **“Product with the highest total quantity sold.”**
12. **“Product with the highest total revenue from order line items.”**
13. **“Customer who purchased products from the highest number of distinct categories.”**
14. **“Total net payroll paid in payroll run with ID = 3.”**
15. **“Department with the highest total net payroll cost in payroll run ID = 3.”**

---

### Big Queries (Tables)

16. **“List active employees in the Sales department ordered by hire date descending.”**
17. **“Inactive products that have been sold at least once.”**
18. **“Top 10 most recently created customers ordered by creation date descending.”**
19. **“Top 10 customers by total paid invoice amount (paid invoices only).”**
20. **“Monthly revenue totals from paid invoices over the last 24 months, ordered by month.”**
21. **“Sales reps ordered by total invoiced amount, then by number of orders created.”**
22. **“Average invoice value per customer (excluding void invoices), minimum 2 invoices.”**
23. **“Top 5 products by total quantity sold; break ties using revenue.”**
24. **“Top 5 products with highest average discount per unit.”**
25. **“Customers who purchased from at least 3 distinct product categories.”**
26. **“Overdue invoices with days overdue and customer info, ordered by days overdue desc.”**
27. **“Customers whose outstanding balance exceeds 10,000.”**
28. **“Total net payroll cost by department for payroll run ID = 3.”**
29. **“Employees whose net pay deviates by more than 20% from basic salary in payroll run 3.”**
30. **“Total invoiced revenue attributed to each department’s employees.”**
31. **“Managers ranked by total invoiced value generated by their direct reports.”**

These questions define **exact expected semantics**.
Your output must match the provided answers in [test_cases.json](../checker/test_cases.json)

---

## 6. External-API-Based Questions

So far your system can only answer database related questions but

> Some questions can be answered **only using external APIs**,
> 
> and some require **combining both**.
>
> Your system must decide this dynamically.

### 6.1. Provided External APIS
> You are provided with:
>
> * An [OpenAPI (Swagger) document](./opeapi-specification.yml) describing all allowed external APIs
> - [Try them in vscode](./load-external-api-spec.md)
> - [Try them in bruno](../external-apis/)
> During evaluation, only APIs described in the OpenAPI document are allowed.

### Response Format (IMPORTANT)

You already have a strong unified response format.
**Do NOT introduce a new one.**

External-only answers should use **the same format**:

```json
{
  "question": "<original question>",
  "llm": "<llm used>",
  "result_type": "scalar | record | table",
  "columns": [...],
  "rows": [...],
  "meta": {
    "row_count": <n>,
    "source": "external | database | mixed"
  }
}
```

> Only addition:
> **`meta.source`** → lets the judge/frontend know where data came from
> This is useful but not strictly required for correctness.

---

## 6.2. External API Only

These questions **must NOT touch the database at all**.

---

#### **Q1. Currency Conversion (Scalar)**

**Question**

> “What is the conversion rate from USD to EUR today?”


**Response**

```json
{
  "columns": ["rate"],
  "rows": [[0.92]],
  "meta": {
    "row_count": 1,
    "source": "external"
  }
}
```

---

#### **Q2. Location Lookup (Record)**

**Question**

> “What is the latitude and longitude of Dhaka?”

**Response**

```json
{
  "columns": ["lat", "lon"],
  "rows": [[23.8103, 90.4125]],
  "meta": {
    "row_count": 1,
    "source": "external"
  }
}
```

---

#### **Q3. Currency Conversion With Amount (Scalar)**

**Question**

> “Convert 1000 us dollar to euro”


**Response**

```json
{
  "columns": ["amount_eur"],
  "rows": [[920.00]],
  "meta": {
    "row_count": 1,
    "source": "external"
  }
}
```

---

### 6.3. Database + External API Integration 


##### **Q1. Highest Paying Customer — Amount in EUR**

**Question**

> “Which customer has paid us the most, and how much is that amount converted to euro?”

**Steps**

1. DB → highest paid customer (USD)
2. External → USD → EUR
3. Multiply


**Response**

```json
{
  "columns": ["customer_name", "total_paid_eur"],
  "rows": [["Acme Inc", 54744.09]],
  "meta": {
    "row_count": 1,
    "source": "mixed"
  }
}
```

---

#### **Q2. Payroll Cost in EUR**

**Question**

> “What is the total payroll cost for payroll run 3 converted to pound?”

**Response**

```json
{
  "columns": ["payroll_cost_pound"],
  "rows": [[149311.84]],
  "meta": {
    "row_count": 1,
    "source": "mixed"
  }
}
```

---

## 7. How Test Cases Are Provided

You are given:

* [test_cases.json](../checker/test_cases.json) (questions + expected normalized answers)
* [checker.py](../checker/checker.py) (official verifier)
[How to run the checker script](#82-checkerpy)

### 7.1 Test Case Format

```json
[
  {
    "question": "In the last 2 years, how much money came in from customers?",
    "result_type": "scalar",
    "expected": {
      "rows": [
        [
          106887.23
        ]
      ]
    }
  }
]
```
For each question, response of your implemented api will be matched against, 

- `result_type`
- `rows`

## 8. Official Python Checker

### 8.1 How It Works

1. Calls `/health`
2. Iterates through all test cases
3. Sends POST `/query`
4. Normalizes numeric precision
5. Compares:

   * `result_type`
   * `columns`
   * `rows`
6. Outputs score

---

### 8.2 `checker.py`

[Find the file here](./checker.py)

---

### 8.3 How to Run the Checker

Your directory **must** look like this:

```
project-root/
├── checker/
|  └── test_cases.json
|  └── checker.py
```

replace `http://example.com:8000` with your server url (i.e. `http://localhost:8080`)

```bash
cd checker
python checker.py -b http://example.com:8000
```

Your server **must be running** before executing the checker.

## 9. Submission Guideline
Please read the [submission doc](./submission_guideline.md) carefully

---

