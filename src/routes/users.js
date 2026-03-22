const express = require("express");
const router = express.Router();
const { getUserBookings } = require("../controllers/bookingController");
const { validateUserId } = require("../middleware/validation");

router.get("/:id/bookings", validateUserId, getUserBookings);

module.exports = router;
