// db.js

const mongoose = require('mongoose');

const uri = 'mongodb+srv://salmabaig:BOjkNjmvvRsN2aRh@cluster0.f7xgqux.mongodb.net/?retryWrites=true&w=majority';

// Set up Mongoose connection
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get a reference to the default connection
const db = mongoose.connection;

// Event handling for successful connection
db.on('connected', () => {
  console.log('Connected to MongoDB Atlas');
});

// Event handling for connection error
db.on('error', (err) => {
  console.error('MongoDB Atlas connection error:', err);
});

// Event handling for connection close
db.on('disconnected', () => {
  console.log('MongoDB Atlas connection disconnected');
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('MongoDB Atlas connection terminated');
    process.exit(0);
  });
});

// Export the Mongoose connection
module.exports = db;