const { body, param, validationResult } = require("express-validator");

// Reusable handler to return validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// POST /events
const validateCreateEvent = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title must be at most 255 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date (e.g. 2025-06-15T18:00:00)")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Event date must be in the future");
      }
      return true;
    }),
  body("total_capacity")
    .notEmpty()
    .withMessage("Total capacity is required")
    .isInt({ min: 1 })
    .withMessage("Total capacity must be a positive integer"),
  validate,
];

// POST /bookings
const validateCreateBooking = [
  body("user_id")
    .notEmpty()
    .withMessage("user_id is required")
    .isInt({ min: 1 })
    .withMessage("user_id must be a positive integer"),
  body("event_id")
    .notEmpty()
    .withMessage("event_id is required")
    .isInt({ min: 1 })
    .withMessage("event_id must be a positive integer"),
  validate,
];

// GET /users/:id/bookings
const validateUserId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
  validate,
];

// POST /events/:id/attendance
const validateAttendance = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer"),
  body("booking_code")
    .trim()
    .notEmpty()
    .withMessage("booking_code is required"),
  validate,
];

module.exports = {
  validateCreateEvent,
  validateCreateBooking,
  validateUserId,
  validateAttendance,
};
