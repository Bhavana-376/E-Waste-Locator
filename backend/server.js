const express = require('express');
const mongoose = require('mongoose');
const open = require('open');
const path = require('path');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch(err => console.error("MongoDB Connection Error:", err));

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Serve static frontend (index.html, styles, scripts)
app.use(express.static(path.join(__dirname, '..', 'client')));

//API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/protectedRoutes'));
app.use('/api/centers', require('./routes/centerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes')); 
app.use('/api/credits', require('./routes/creditRoutes'));

//SPA fallback for client-side routing (like /dashboard.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
