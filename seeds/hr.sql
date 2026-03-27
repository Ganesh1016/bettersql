DROP TABLE IF EXISTS salaries;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT NOT NULL,
  hire_date TEXT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE salaries (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  effective_date TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

INSERT INTO departments (id, name, location) VALUES
  (1, 'Engineering', 'Bangalore'),
  (2, 'Finance', 'Pune'),
  (3, 'People Ops', 'Hyderabad');

INSERT INTO employees (id, department_id, first_name, last_name, title, hire_date) VALUES
  (1, 1, 'Priya', 'Nair', 'Software Engineer', '2023-03-01'),
  (2, 1, 'Rahul', 'Menon', 'Senior Engineer', '2021-07-11'),
  (3, 2, 'Meera', 'Kapoor', 'Analyst', '2024-05-19'),
  (4, 3, 'Amit', 'Sethi', 'HR Specialist', '2022-10-03');

INSERT INTO salaries (id, employee_id, amount, effective_date) VALUES
  (1, 1, 98000, '2025-01-01'),
  (2, 2, 142000, '2025-01-01'),
  (3, 3, 86000, '2025-01-01'),
  (4, 4, 91000, '2025-01-01');

