<div align="center">

# 🏦 Bank Ledger System

### Production-Inspired Banking Backend API

A secure banking backend built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**, implementing **ledger-based accounting**, **MongoDB ACID transactions**, **JWT authentication**, and **idempotent payment processing**.

<p>
<img src="https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Express.js-Backend-000000?logo=express"/>
<img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Mongoose-ODM-880000"/>
<img src="https://img.shields.io/badge/JWT-Authentication-orange"/>
<img src="https://img.shields.io/badge/License-MIT-blue"/>
</p>

</div>

---

# 📖 Overview

This project simulates the backend of a modern banking system by implementing secure financial transactions using **double-entry ledger accounting**.

Instead of storing balances directly inside the account document, balances are calculated from immutable ledger entries, ensuring consistency, auditability, and transaction safety.

The project also demonstrates backend concepts used in production systems, including MongoDB transactions, JWT authentication, idempotent requests, and secure route protection.

---

# ✨ Features

- 🔐 JWT Authentication
- 🍪 Cookie-Based Authentication
- 👤 User Registration & Login
- 🏦 Account Creation & Management
- 💸 Secure Money Transfers
- 📚 Ledger-Based Accounting
- 🔄 MongoDB ACID Transactions
- ⚡ Idempotent Payment Processing
- 🛡 Protected Routes
- 🚫 JWT Token Blacklisting (Logout)
- 📧 Email Notifications
- 👑 System Account for Initial Funding
- 📈 Dynamic Balance Calculation

---

# 🏗 System Architecture

```text
                 Client
                    │
                    ▼
            Express.js Server
                    │
        ┌───────────┴───────────┐
        │                       │
 Authentication           Transactions
        │                       │
        ▼                       ▼
 JWT Middleware        MongoDB Session
        │                       │
        ▼                       ▼
      Users                Ledger Entries
                                │
                                ▼
                        Account Balance
                     (Calculated Dynamically)
```

---

# 💰 Ledger-Based Accounting

Unlike traditional systems that store balances directly,

```text
Balance = Stored Value
```

this application derives balances from immutable ledger entries.

```text
Balance = Total Credits − Total Debits
```

### Advantages

- Complete financial audit trail
- Prevents balance tampering
- Easy reconciliation
- Immutable transaction history
- Scalable accounting architecture

---

# 🔄 Transaction Workflow

```text
Validate Request
        │
        ▼
Validate Accounts
        │
        ▼
Validate Idempotency Key
        │
        ▼
Calculate Sender Balance
        │
        ▼
Start MongoDB Transaction
        │
        ▼
Create Transaction
        │
        ├────────────► Debit Ledger Entry
        │
        ├────────────► Credit Ledger Entry
        │
        ▼
Commit Transaction
        │
        ▼
Send Email Notification
        │
        ▼
Return Success Response
```

---

# 🗄 Database Design

```text
User
│
├── name
├── email
├── password
└── systemUser
      │
      │ 1
      ▼
Account
│
├── user
├── status
└── currency
      │
      │ 1
      ▼
Ledger
│
├── account
├── amount
├── transaction
└── type
      ▲
      │
Transaction
│
├── fromAccount
├── toAccount
├── amount
├── status
└── idempotencyKey
```

---

# 🛠 Tech Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- bcrypt

## Email Service

- Nodemailer

## Security

- Cookie Parser
- Authentication Middleware
- Token Blacklisting

---

# 📂 Project Structure

```text
src
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── app.js
└── server.js
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| POST | `/api/auth/logout` |

---

## Accounts

| Method | Endpoint |
|--------|----------|
| POST | `/api/accounts` |
| GET | `/api/accounts` |
| GET | `/api/accounts/:accountId/balance` |

---

## Transactions

| Method | Endpoint |
|--------|----------|
| POST | `/api/transaction` |
| POST | `/api/transaction/system/initial-funds` |

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Token Blacklisting
- Immutable Ledger Entries
- MongoDB Transactions
- Idempotent Transactions
- Account Ownership Validation

---

# ⚙️ Getting Started

## Clone the repository

```bash
git clone https://github.com/garry000111/bank-ledger-system.git
```

## Navigate to the project

```bash
cd bank-ledger-system
```

## Install dependencies

```bash
npm install
```

## Configure environment variables

Create a `.env` file in the project root.

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL=your_email

EMAIL_PASSWORD=your_email_password
```

## Run the development server

```bash
npm run dev
```

---

# 🚀 Future Enhancements

- Docker Support
- Redis Integration
- Rate Limiting
- Refresh Token Authentication
- Role-Based Access Control (RBAC)
- Swagger/OpenAPI Documentation
- Kafka/RabbitMQ Integration
- AWS Deployment
- CI/CD Pipeline
- Unit & Integration Testing

---

# 📚 Key Backend Concepts Demonstrated

- RESTful API Design
- MongoDB Transactions
- Double-Entry Ledger Accounting
- Idempotent APIs
- Authentication & Authorization
- Middleware Architecture
- Secure Password Storage
- Email Service Integration
- Account Ownership Validation
- Database Indexing
- Immutable Data Design

---

# 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

Feel free to fork this repository and submit a pull request.

---

# ⭐ Show Your Support

If you found this project helpful or interesting,

⭐ **Star this repository** to support the project.

---

<div align="center">

### Built with ❤️ using Node.js, Express.js & MongoDB

**If you like this project, consider giving it a ⭐ on GitHub.**

</div>
