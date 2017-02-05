CREATE DATABASE IF NOT EXISTS bamazon_bookstore;

USE bamazon_bookstore;

CREATE TABLE IF NOT EXISTS products (
  item_id INT(10) AUTO_INCREMENT PRIMARY KEY NOT NULL
, product_name VARCHAR(100) NOT NULL
, author_name VARCHAR(100) NULL
, department_name VARCHAR(30) NULL
, price FLOAT(12) NOT NULL
, stock_quantity INT(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
  department_id INT(10) AUTO_INCREMENT PRIMARY KEY NOT NULL
, department_name VARCHAR(30) NULL
, over_head_costs INT(10) NOT NULL
, total_sales INT(10) NOT NULL
);
