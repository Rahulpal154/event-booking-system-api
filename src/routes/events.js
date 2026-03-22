const express = require("express");
const router = express.Router();
const { getAllEvents, createEvent } = require("../controllers/eventController");
const { recordAttendance } = require("../controllers/attendanceController");
const {
  validateCreateEvent,
  validateAttendance,
} = require("../middleware/validation");

router.get("/", getAllEvents);
router.post("/", validateCreateEvent, createEvent);
router.post("/:id/attendance", validateAttendance, recordAttendance);

module.exports = router;
