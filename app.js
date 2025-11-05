const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');
const userRoutes = require('./routes/userRoutes');
const jobRequestRoute = require('./routes/jobRequestRoute');
const subscriptionRoute = require('./routes/subscriptionRoute');

const app = express();
const path = require("path");
// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:8080", // your frontend URL
    credentials: true,               // allow credentials (cookies, auth headers)
  }),
  express.static("uploads")
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests
  })
);

// Logging Middleware
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/post', jobRequestRoute);
app.use('/api/v1/subs', subscriptionRoute);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

//Images Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error Middleware
app.use(errorMiddleware);

module.exports = app;