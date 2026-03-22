const express = require("express");
const router = express.Router();
const { createBooking } = require("../controllers/bookingController");
const { validateCreateBooking } = require("../middleware/validation");

router.post("/", validateCreateBooking, createBooking);

module.exports = router;
