const { pool } = require("../config/database");
const { v4: uuidv4 } = require("uuid");

/**
 * POST /bookings
 * Book a ticket for a user.
 * Uses a DB transaction + SELECT FOR UPDATE to prevent race conditions
 * on remaining_tickets.
 */
const createBooking = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { user_id, event_id } = req.body;

    await connection.beginTransaction();

    // Lock the event row to prevent concurrent over-booking
    const [events] = await connection.query(
      `SELECT id, title, remaining_tickets
       FROM events
       WHERE id = ?
       FOR UPDATE`,
      [event_id]
    );

    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = events[0];

    if (event.remaining_tickets <= 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "No tickets remaining for this event",
      });
    }

    // Verify the user exists
    const [users] = await connection.query(
      `SELECT id FROM users WHERE id = ?`,
      [user_id]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check duplicate booking
    const [existing] = await connection.query(
      `SELECT id FROM bookings WHERE user_id = ? AND event_id = ?`,
      [user_id, event_id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "User has already booked this event",
      });
    }

    // Generate unique booking code
    const booking_code = uuidv4();

    // Insert booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (user_id, event_id, booking_code, booking_date)
       VALUES (?, ?, ?, NOW())`,
      [user_id, event_id, booking_code]
    );

    // Decrement remaining tickets atomically
    await connection.query(
      `UPDATE events
       SET remaining_tickets = remaining_tickets - 1
       WHERE id = ?`,
      [event_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Ticket booked successfully",
      data: {
        booking_id: bookingResult.insertId,
        user_id,
        event_id,
        event_title: event.title,
        booking_code,
        booking_date: new Date().toISOString(),
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * GET /users/:id/bookings
 * Retrieve all bookings made by a specific user.
 */
const getUserBookings = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify user exists
    const [users] = await pool.query(`SELECT id, name, email FROM users WHERE id = ?`, [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [bookings] = await pool.query(
      `SELECT
         b.id          AS booking_id,
         b.booking_code,
         b.booking_date,
         e.id          AS event_id,
         e.title       AS event_title,
         e.description AS event_description,
         e.date        AS event_date,
         e.total_capacity,
         e.remaining_tickets
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      user: users[0],
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getUserBookings };
