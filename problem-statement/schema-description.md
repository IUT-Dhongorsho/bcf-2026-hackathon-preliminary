## 1) departments

Stores departments like Sales, Accounts, HR, Admin.

* **department_id** (PK)
* name (unique) — e.g., “Sales”
* cost_center_code
* location
* created_at

**Used by:** employees

---

## 2) roles

Job roles + basic access grouping.

* **role_id** (PK)
* role_name (unique) — e.g., “HR Manager”, “Sales Rep”
* description
* is_admin_role (boolean)

**Used by:** employees

---

## 3) employees

Core HR table.

* **employee_id** (PK)
* employee_code (unique)
* first_name
* last_name
* email (unique)
* phone
* department_id (FK → departments.department_id)
* role_id (FK → roles.role_id)
* manager_id (FK → employees.employee_id, nullable)  *(self-reference)*
* hire_date
* employment_status (e.g., Active/OnLeave/Terminated)
* basic_salary
* created_at

**Connects:** HR + Admin + Sales (via created_by in orders) + Finance (via payroll)

---

## 4) payroll_runs

A payroll period (monthly/biweekly).

* **payroll_run_id** (PK)
* period_start
* period_end
* processed_on
* status (Draft/Processed/Paid)
* processed_by (FK → employees.employee_id)

**Used by:** payroll_items

---

## 5) payroll_items

Each employee’s payroll line for a run.

* **payroll_item_id** (PK)
* payroll_run_id (FK → payroll_runs.payroll_run_id)
* employee_id (FK → employees.employee_id)
* base_pay
* allowance
* overtime_pay
* tax_deducted
* other_deductions
* net_pay

**Constraint idea:** (payroll_run_id, employee_id) unique.

---

## 6) customers

Sales customers.

* **customer_id** (PK)
* customer_code (unique)
* name
* email
* phone
* billing_address
* shipping_address
* tax_id
* status (Active/Inactive)
* created_at

**Used by:** sales_orders, invoices

---

## 7) products

Items the company sells.

* **product_id** (PK)
* sku (unique)
* name
* category
* unit_price
* tax_rate
* is_active
* created_at

**Used by:** sales_order_items

---

## 8) sales_orders

Order header.

* **sales_order_id** (PK)
* order_number (unique)
* customer_id (FK → customers.customer_id)
* order_date
* status (Draft/Confirmed/Shipped/Closed/Cancelled)
* created_by (FK → employees.employee_id)  *(usually Sales)*
* approved_by (FK → employees.employee_id, nullable) *(could be Admin/Manager)*
* notes

**Used by:** sales_order_items, invoices

---

## 9) sales_order_items

Order line items.

* **sales_order_item_id** (PK)
* sales_order_id (FK → sales_orders.sales_order_id)
* product_id (FK → products.product_id)
* quantity
* unit_price_at_sale
* discount_amount
* line_total

**Constraint idea:** (sales_order_id, product_id) can repeat or be unique depending on your business rule.

---

## 10) invoices

Finance-facing billing document (can be 1 per order, or multiple—your choice).

* **invoice_id** (PK)
* invoice_number (unique)
* sales_order_id (FK → sales_orders.sales_order_id)
* customer_id (FK → customers.customer_id)
* issued_date
* due_date
* status (Unpaid/PartiallyPaid/Paid/Void)
* subtotal
* tax_total
* total_amount
* created_by (FK → employees.employee_id) *(Accounts typically)*

---

# Relationships summary (cardinality)

* **departments 1 → many employees**
* **roles 1 → many employees**
* **employees 1 → many employees** (manager relationship)
* **payroll_runs 1 → many payroll_items**
* **employees 1 → many payroll_items**
* **customers 1 → many sales_orders**
* **sales_orders 1 → many sales_order_items**
* **products 1 → many sales_order_items**
* **sales_orders 1 → many invoices**
* **customers 1 → many invoices**
* **employees 1 → many sales_orders (created_by)**
* **employees 1 → many invoices (created_by)**

### All currencies are in USD

---

