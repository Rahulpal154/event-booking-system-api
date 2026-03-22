-- ============================================================
-- Event Booking System - Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS event_booking_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE event_booking_db;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255)      NOT NULL,
  email      VARCHAR(255)      NOT NULL,
  created_at DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id                 INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  title              VARCHAR(255)      NOT NULL,
  description        TEXT,
  date               DATETIME          NOT NULL,
  total_capacity     INT UNSIGNED      NOT NULL,
  remaining_tickets  INT UNSIGNED      NOT NULL,
  created_at         DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT chk_events_remaining
    CHECK (remaining_tickets <= total_capacity)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: bookings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED  NOT NULL,
  event_id      INT UNSIGNED  NOT NULL,
  booking_code  VARCHAR(36)   NOT NULL COMMENT 'UUID v4 — unique ticket code',
  booking_date  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_code   (booking_code),
  UNIQUE KEY uq_bookings_user_event (user_id, event_id),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_event
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: event_attendance
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_attendance (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  event_id    INT UNSIGNED  NOT NULL,
  user_id     INT UNSIGNED  NOT NULL,
  booking_id  INT UNSIGNED  NOT NULL,
  entry_time  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_attendance_booking (booking_id) COMMENT 'One check-in per booking',
  CONSTRAINT fk_attendance_event
    FOREIGN KEY (event_id)   REFERENCES events   (id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_user
    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Seed data (optional — for local testing)
-- ------------------------------------------------------------
INSERT INTO users (name, email) VALUES
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith',     'bob@example.com'),
  ('Carol White',   'carol@example.com');

INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES
  ('Tech Summit 2026',       'Annual technology conference',       '2026-06-15 09:00:00', 200, 200),
  ('Node.js Workshop',       'Hands-on Node.js for beginners',     '2026-07-20 10:00:00',  50,  50),
  ('Startup Pitch Night',    'Top 10 startups pitch to investors', '2026-08-05 18:00:00', 100, 100);
