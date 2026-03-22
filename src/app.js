require("dotenv").config();
const express = require("express");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const { testConnection } = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger / OpenAPI docs ────────────────────────────────────────────────────
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Event Booking System API",
    version: "1.0.0",
    docs: "/api-docs",
  });
});

app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
(async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 API Docs available at http://localhost:${PORT}/api-docs`);
  });
})();

module.exports = app;
