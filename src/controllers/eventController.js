const { pool } = require("../config/database");

/**
 * GET /events
 * List all upcoming events (date >= now), ordered by date ascending.
 */
const getAllEvents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, date, total_capacity, remaining_tickets
       FROM events
       WHERE date >= NOW()
       ORDER BY date ASC`
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /events
 * Create a new event.
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description = null, date, total_capacity } = req.body;

    const [result] = await pool.query(
      `INSERT INTO events (title, description, date, total_capacity, remaining_tickets)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, date, total_capacity, total_capacity]
    );

    const [newEvent] = await pool.query(
      `SELECT id, title, description, date, total_capacity, remaining_tickets
       FROM events WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllEvents, createEvent };
