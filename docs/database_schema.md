# Database Schema

## Overview
This document describes the relational schema for the marketplace. It includes ER diagrams (placeholder) and table definitions.

## Tables
- **users**: id, name, email, password_hash, created_at, updated_at
- **products**: id, seller_id (FK users), title, description, price, stock, created_at, updated_at
- **orders**: id, buyer_id (FK users), total_amount, status, created_at, updated_at
- **order_items**: id, order_id (FK orders), product_id (FK products), quantity, price
- **payments**: id, order_id (FK orders), provider, transaction_id, amount, status, created_at
- **reviews**: id, product_id (FK products), user_id (FK users), rating, comment, created_at

*Diagrams and detailed column types will be added as the design matures.*
