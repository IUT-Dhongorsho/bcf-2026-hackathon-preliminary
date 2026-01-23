
# How to Run PostgreSQL Locally and Load the Database

This guide explains how to:
1. [Install PostgreSQL locally](#1-install-postgresql)
2. [Create a database](#3-create-database-and-user)
3. [Execute the provided `generated_data.sql` file](#4-execute-the-sql-script)
4. [Verify that all tables are created correctly](#5-verify-tables-were-created)

---

## 1. Install PostgreSQL

### Ubuntu / Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### macOS (using Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

### Windows

* Download PostgreSQL from: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
* During installation:

  * Remember the **password** you set for the `postgres` user
  * Keep default port `5432`

---

## 2. Verify PostgreSQL Is Running

```bash
psql --version
```

If PostgreSQL is running, you should see a version number.

---

## 3. Create Database and User

Open PostgreSQL shell:

```bash
psql -U postgres
```

Then run:

```sql
CREATE DATABASE bcf_db;
CREATE USER bcf WITH PASSWORD 'bcf2026';
ALTER ROLE bcf SET client_encoding TO 'utf8';
ALTER ROLE bcf SET default_transaction_isolation TO 'read committed';
ALTER ROLE bcf SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bcf_db TO bcf;
```

Exit:

```sql
\q
```

---

## 4. Execute the SQL Script

Make sure `generated_data.sql` is in your current directory.

Run:

```bash
psql -U bcf -d bcf_db -f generated_data.sql
```

If successful, you should see multiple `CREATE TABLE`, `INSERT`, and `ALTER` statements executing without errors.

---

## 5. Verify Tables Were Created

Connect to the database:

```bash
psql -U bcf -d bcf_db
```

List tables:

```sql
\dt
```

You should see tables such as:

* employees
* departments
* customers
* invoices
* sales_orders
* payroll_items

---

## 6. (Optional) Test a Sample Query

```sql
SELECT COUNT(*) FROM employees;
```

If this returns a number, your setup is complete.

---

## Notes

* PostgreSQL runs on port **5432** by default
* Credentials used in this project:

  * Database: `bcf_db`
  * User: `bcf`
  * Password: `bcf2026`

You are now ready to connect your backend server to the database.

---

