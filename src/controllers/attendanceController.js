const { pool } = require("../config/database");

/**
 * POST /events/:id/attendance
 * Takes a booking_code as input.
 * Records the attendance entry and returns how many tickets
 * have been booked (total confirmed bookings) for the event.
 */
const recordAttendance = async (req, res, next) => {
  try {
    const { id: event_id } = req.params;
    const { booking_code } = req.body;

    // Verify event exists
    const [events] = await pool.query(
      `SELECT id, title, total_capacity, remaining_tickets FROM events WHERE id = ?`,
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Verify the booking_code belongs to this event
    const [bookings] = await pool.query(
      `SELECT b.id AS booking_id, b.user_id, b.booking_date, u.name, u.email
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.booking_code = ? AND b.event_id = ?`,
      [booking_code, event_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid booking code for this event",
      });
    }

    const booking = bookings[0];

    // Check if already checked in
    const [alreadyCheckedIn] = await pool.query(
      `SELECT id FROM event_attendance WHERE booking_id = ?`,
      [booking.booking_id]
    );

    if (alreadyCheckedIn.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This ticket has already been used for entry",
      });
    }

    // Record attendance
    await pool.query(
      `INSERT INTO event_attendance (event_id, user_id, booking_id, entry_time)
       VALUES (?, ?, ?, NOW())`,
      [event_id, booking.user_id, booking.booking_id]
    );

    // Count total confirmed bookings for this event
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total_bookings FROM bookings WHERE event_id = ?`,
      [event_id]
    );

    res.status(200).json({
      success: true,
      message: "Attendance recorded successfully",
      data: {
        event_id: Number(event_id),
        event_title: events[0].title,
        attendee: {
          user_id: booking.user_id,
          name: booking.name,
          email: booking.email,
        },
        entry_time: new Date().toISOString(),
        total_bookings_for_event: countResult[0].total_bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { recordAttendance };
