# Event Booking System

A **Mini Event Management System** built with **Node.js (Express)**, **MySQL**, and documented via **OpenAPI 3.0 / Swagger**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup — Manual](#setup--manual)
- [Setup — Docker (One-Click)](#setup--docker-one-click)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Running the Server](#running-the-server)
- [Swagger UI](#swagger-ui)
- [Postman Collection](#postman-collection)
- [Design Decisions](#design-decisions)

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Runtime     | Node.js 20                        |
| Framework   | Express.js 4                      |
| Database    | MySQL 8.0                         |
| DB Driver   | mysql2 (with Promise/pool support)|
| Validation  | express-validator                 |
| Unique Code | uuid (v4)                         |
| Docs        | swagger-ui-express + OpenAPI 3.0  |
| Container   | Docker + docker-compose           |

---

## Project Structure

```
event-booking-system/
├── src/
│   ├── app.js                      # Express entry point
│   ├── config/
│   │   └── database.js             # MySQL connection pool
│   ├── controllers/
│   │   ├── eventController.js      # GET /events, POST /events
│   │   ├── bookingController.js    # POST /bookings, GET /users/:id/bookings
│   │   └── attendanceController.js # POST /events/:id/attendance
│   ├── middleware/
│   │   ├── validation.js           # express-validator rules
│   │   └── errorHandler.js         # Global error + 404 handler
│   └── routes/
│       ├── events.js
│       ├── bookings.js
│       └── users.js
├── schema.sql                      # Full DB schema + seed data
├── swagger.yaml                    # OpenAPI 3.0 specification
├── postman_collection.json         # Postman collection
├── Dockerfile                      # Docker image
├── docker-compose.yml              # One-click local stack
├── .env.example                    # Environment variable template
└── package.json
```

---

## Prerequisites

- **Node.js** v18 or above
- **MySQL** 8.0 (or use Docker — no local install needed)
- **npm** v9+

---

## Setup — Manual

### 1. Clone & install

```bash
git clone <your-repo-url>
cd event-booking-system
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in your MySQL credentials
```

### 3. Create the database & schema

Log in to MySQL and run:

```bash
mysql -u root -p < schema.sql
```

This creates the `event_booking_db` database, all tables, and inserts seed data (3 users, 3 events).

### 4. Start the server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

The server will start on `http://localhost:3000`.

---

## Setup — Docker (One-Click)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be running.

```bash
docker-compose up --build
```

This spins up:
- **MySQL 8.0** on port `3306` (auto-runs `schema.sql` with seed data)
- **API server** on port `3000`

To stop:

```bash
docker-compose down
```

To reset the database volume:

```bash
docker-compose down -v
```

---

## Environment Variables

| Variable      | Default             | Description                   |
|---------------|---------------------|-------------------------------|
| `PORT`        | `3000`              | HTTP port                     |
| `DB_HOST`     | `localhost`         | MySQL host                    |
| `DB_PORT`     | `3306`              | MySQL port                    |
| `DB_USER`     | `root`              | MySQL username                |
| `DB_PASSWORD` | _(empty)_           | MySQL password                |
| `DB_NAME`     | `event_booking_db`  | MySQL database name           |

---

## API Endpoints

| Method | Endpoint                    | Description                                    |
|--------|-----------------------------|------------------------------------------------|
| GET    | `/events`                   | List all upcoming events                       |
| POST   | `/events`                   | Create a new event                             |
| POST   | `/bookings`                 | Book a ticket for a user (transactional)       |
| GET    | `/users/:id/bookings`       | Retrieve all bookings for a specific user      |
| POST   | `/events/:id/attendance`    | Record attendance via booking code             |

### POST /events — Request Body

```json
{
  "title": "Tech Summit 2026",
  "description": "Optional description",
  "date": "2026-06-15T09:00:00",
  "total_capacity": 200
}
```

### POST /bookings — Request Body

```json
{
  "user_id": 1,
  "event_id": 2
}
```

Returns a unique `booking_code` (UUID v4) on success.

### POST /events/:id/attendance — Request Body

```json
{
  "booking_code": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Swagger UI

After starting the server, visit:

```
http://localhost:3000/api-docs
```

The interactive Swagger UI lets you explore and test all endpoints directly in the browser.

---

## Postman Collection

Import `postman_collection.json` into Postman:

1. Open Postman → **Import**
2. Select `postman_collection.json`
3. Set the `baseUrl` variable to `http://localhost:3000`
4. All requests are pre-configured and ready to run

---

## Design Decisions

### Race Condition Prevention
`POST /bookings` uses a **MySQL transaction with `SELECT ... FOR UPDATE`** to lock the event row before checking and decrementing `remaining_tickets`. This ensures two simultaneous requests cannot both see `remaining_tickets = 1` and both succeed, which would oversell the event.

### Unique Booking Code
Each successful booking receives a **UUID v4** as its `booking_code`. This is stored with a `UNIQUE` constraint in the database, making it suitable as a tamper-proof ticket identifier.

### Separation of Concerns
- **Routes** — only define paths and wire middleware/controllers
- **Controllers** — contain all business logic and DB queries
- **Middleware** — validation rules and error handling are decoupled from business logic

### Error Handling
A centralised `errorHandler` middleware catches all unhandled errors and formats them consistently. Validation errors from `express-validator` return a `400` with a structured list of field-level messages.
