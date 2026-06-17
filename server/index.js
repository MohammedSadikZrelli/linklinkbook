require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');
require('./config/passport');

// Initialize database connection
connectDB();

const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Main Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Linkbook API Gateway is active' });
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/google', require('./routes/googleAuth'));
app.use('/api/books', require('./routes/book'));
app.use('/api/invitations', require('./routes/invitation'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/subscriptions', require('./routes/subscription'));
app.use('/api/images', require('./routes/image'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/assets', require('./routes/asset'));

// Import error handling middlewares
const { errorHandler, notFoundHandler } = require('./middleware/error');

// Register error handling middlewares (must be registered last)
app.use(notFoundHandler);
app.use(errorHandler);

// Define listening port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in simple/clean mode on port ${PORT}`);
});

