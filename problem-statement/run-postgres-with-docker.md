# How to Run PostgreSQL Using Docker Compose and View Data with pgweb

This guide explains how to:
1. Run PostgreSQL using the provided Docker Compose file
2. Automatically load `generated_data.sql`
3. View tables and data using pgweb in a browser

No prior Docker experience is required.

---

## 1. Prerequisites

### Install Docker & Docker Compose

#### Linux
```bash
sudo apt install docker docker-compose
```

#### macOS / Windows

* Install Docker Desktop: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
* Docker Compose is included by default

Verify installation:

```bash
docker --version
docker compose version
```

---

## 2. Directory Structure (Important)

Your directory **must** look like this:

```
project-root/
├── docker-compose.yml
└── data/
    └── generated_data.sql
```

> ⚠️ The `generated_data.sql` file **must be under the data folder**
> Docker will automatically execute it during database initialization.

---

## 3. Start the Containers

From `project-root/`, run:

```bash
docker compose up -d
```

This will:

* Start PostgreSQL on port **5433**
* Load `generated_data.sql` automatically
* Start pgweb UI on port **8081**

Check running containers:

```bash
docker ps
```

---

## 4. Verify Database Initialization

PostgreSQL container logs:

```bash
docker logs postgres
```

You should see logs indicating SQL execution without errors.

---

## 5. Open pgweb (Database Viewer)

Open your browser and go to:

```
http://localhost:8081
```

pgweb connects automatically using:

* Database: `bcf_db`
* User: `bcf`
* Password: `bcf2026`

---

## 6. View Tables in pgweb

In pgweb UI:

1. Click **Tables**
2. Select any table (e.g. `employees`)
3. Click **Browse** or **SQL Query**

Example query:

```sql
SELECT * FROM invoices LIMIT 10;
```

---

## 7. PostgreSQL Connection Details

Use these details if connecting from your backend:

* Host: `localhost`
* Port: `5433`
* Database: `bcf_db`
* Username: `bcf`
* Password: `bcf2026`

---

## 8. Stopping the Containers

To stop everything:

```bash
docker compose down
```

To remove data completely:

```bash
docker compose down -v
```

---

## Notes

* Data persists across restarts unless volumes are removed
* pgweb is read-only by default and safe to use
* Docker setup is optional but recommended for beginners

You are now ready to connect your API server to the database using Docker.

---
